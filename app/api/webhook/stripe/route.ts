/**
 * API ROUTE - WEBHOOK STRIPE
 * POST /api/webhook/stripe
 * 
 * TEMPORAIREMENT DÉSACTIVÉ - En attente de configuration Paystack
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ received: false, message: 'Webhook not configured' });
}
