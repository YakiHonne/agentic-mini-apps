import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/lightning';

export async function POST(request: Request) {
  try {
    const { amount, description } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const result = await createInvoice(amount, description || 'Nebulus Deep Analysis');
    
    return NextResponse.json({
      invoice: result.invoice,
      paymentHash: result.paymentHash,
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
