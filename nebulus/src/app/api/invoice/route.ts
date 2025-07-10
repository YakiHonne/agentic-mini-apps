import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/lightning';

const PREMIUM_TIER_COST_SATS = 210;

export async function POST() {
  try {
    const { invoice, paymentHash } = await createInvoice(
      PREMIUM_TIER_COST_SATS,
      'Nostr Research Agent - Deep Analysis'
    );
    return NextResponse.json({ invoice, paymentHash });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create invoice.' }, { status: 500 });
  }
}