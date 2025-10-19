/**
 * API ROUTE - CRÉER UNE SESSION DE PAIEMENT STRIPE
 * POST /api/checkout
 * 
 * TEMPORAIREMENT DÉSACTIVÉ - En attente de configuration Paystack
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Payment system not configured yet. Please configure Paystack after deployment.' },
    { status: 503 }
  );
}
