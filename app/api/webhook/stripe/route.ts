import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  // Vérifier signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`🔔 Webhook received: ${event.type}`);

  // Gérer les événements
  try {
    switch (event.type) {
      // ===== NOUVEL ABONNEMENT =====
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const userId = session.metadata?.userId;
          const subscriptionId = session.subscription as string;

          if (!userId) {
            console.error('No userId in session metadata');
            break;
          }

          // Récupérer détails subscription
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Upgrade user à PREMIUM
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'PREMIUM',
              isPremium: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              premiumSince: new Date(),
              dailyUsed: 0, // Reset
            },
          });

          // Créer Payment record
          await prisma.payment.create({
            data: {
              userId,
              stripePaymentId: session.payment_intent as string,
              stripeInvoiceId: subscription.latest_invoice as string,
              amount: 9.99,
              status: 'succeeded',
              billingReason: 'subscription_create'
            },
          });

          // Analytics
          await prisma.usage.create({
            data: {
              userId,
              action: 'subscription_started',
              metadata: {
                subscriptionId,
                priceId: subscription.items.data[0].price.id
              }
            },
          });

          console.log(`✅ User ${userId} upgraded to PREMIUM`);
        }
        break;
      }

      // ===== RENOUVELLEMENT MENSUEL =====
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription && invoice.billing_reason !== 'manual') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = subscription.metadata.userId;

          if (!userId) {
            console.error('No userId in subscription metadata');
            break;
          }

          // Mettre à jour la période
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              isPremium: true,
              dailyUsed: 0, // Reset pour le nouveau mois
            },
          });

          // Créer Payment record
          await prisma.payment.create({
            data: {
              userId,
              stripePaymentId: invoice.payment_intent as string,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid / 100,
              status: 'succeeded',
              billingReason: invoice.billing_reason || 'subscription_cycle'
            },
          });

          console.log(`✅ Subscription renewed for user ${userId}`);
        }
        break;
      }

      // ===== PAIEMENT ÉCHOUÉ =====
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = subscription.metadata.userId;

          if (userId) {
            await prisma.usage.create({
              data: {
                userId,
                action: 'payment_failed',
                metadata: {
                  invoiceId: invoice.id,
                  amount: invoice.amount_due / 100
                }
              },
            });

            console.log(`⚠️ Payment failed for user ${userId}`);
          }
        }
        break;
      }

      // ===== ANNULATION ABONNEMENT =====
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPremium: false,
              plan: 'FREE',
              stripeSubscriptionId: null,
              freeUsed: 0, // Reset les 2 gratuits
              dailyUsed: 0,
            },
          });

          await prisma.usage.create({
            data: {
              userId,
              action: 'subscription_cancelled',
              metadata: {
                subscriptionId: subscription.id,
                cancelledAt: new Date()
              }
            },
          });

          console.log(`✅ Subscription cancelled for user ${userId}`);
        }
        break;
      }

      // ===== MISE À JOUR ABONNEMENT =====
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              isPremium: subscription.status === 'active' || subscription.status === 'trialing',
            },
          });

          console.log(`✅ Subscription updated for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
