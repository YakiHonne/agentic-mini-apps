// WebLN Types
declare global {
  interface Window {
    webln?: {
      enable(): Promise<void>;
      sendPayment(invoice: string): Promise<{ preimage: string }>;
      makeInvoice(amount: number): Promise<{ paymentRequest: string }>;
      signMessage(message: string): Promise<{ signature: string }>;
    };
  }
}

export {};
