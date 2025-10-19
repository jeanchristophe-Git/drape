/**
 * API ROUTE - PORTAIL CLIENT STRIPE
 * POST /api/portal
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
