const ALBY_API_URL = 'https://api.getalby.com';

/**
 * Creates a new Lightning invoice using the Alby API.
 * @param amount The amount in satoshis.
 * @param description A description for the invoice.
 * @returns An object containing the invoice string and its payment hash.
 */
export async function createInvoice(amount: number, description: string) {
  const response = await fetch(`${ALBY_API_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ALBY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 1000,
      description,
    }),
  });

  if (!response.ok) {
    console.error("Alby API Error:", await response.text());
    throw new Error('Failed to create Lightning invoice.');
  }

  const data = await response.json();
  return {
    invoice: data.payment_request as string,
    paymentHash: data.payment_hash as string,
  };
}

/**
 * Verifies if a Lightning invoice has been paid using its payment hash.
 * @param paymentHash The hash of the invoice to check.
 * @returns True if the invoice is settled, false otherwise.
 */
export async function verifyPayment(paymentHash: string): Promise<boolean> {
  try {
    const response = await fetch(`${ALBY_API_URL}/invoices/${paymentHash}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ALBY_API_KEY}`,
      },
    });

    if (!response.ok) {
      if (response.status !== 404) {
        console.error("Alby API Verification Error:", await response.text());
      }
      return false;
    }

    const data = await response.json();
    return data.settled === true;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
}