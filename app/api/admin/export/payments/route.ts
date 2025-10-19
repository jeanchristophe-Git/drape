/**
 * API ROUTE - EXPORT PAIEMENTS CSV
 * GET /api/admin/export/payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    // Récupérer tous les paiements
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Générer le CSV
    const headers = [
      'ID',
      'User Email',
      'Amount',
      'Currency',
      'Status',
      'Billing Reason',
      'Stripe Payment ID',
      'Created At',
    ];

    const rows = payments.map(payment => [
      payment.id,
      payment.user.email,
      payment.amount,
      payment.currency,
      payment.status,
      payment.billingReason || '',
      payment.stripePaymentId,
      payment.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payments-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting payments:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
