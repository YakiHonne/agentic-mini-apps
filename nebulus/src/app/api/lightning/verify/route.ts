import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/lightning';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentHash = searchParams.get('hash');

    if (!paymentHash) {
      return NextResponse.json({ error: 'Payment hash is required' }, { status: 400 });
    }

    const isPaid = await verifyPayment(paymentHash);
    
    return NextResponse.json({ paid: isPaid });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
