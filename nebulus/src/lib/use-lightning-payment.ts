'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentState {
  isProcessing: boolean;
  paymentHash: string | null;
  invoice: string | null;
  isPaid: boolean;
  error: string | null;
}

export function useLightningPayment() {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    paymentHash: null,
    invoice: null,
    isPaid: false,
    error: null,
  });

  const initiatePayment = async (amountSats: number = 210) => {
    try {
      setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Check for WebLN first
      if (typeof window !== 'undefined' && window.webln) {
        try {
          await window.webln.enable();
          
          // Generate invoice on server
          const invoiceResponse = await fetch('/api/lightning/invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount: amountSats, 
              description: `Nebulus Deep Analysis - ${amountSats} sats` 
            }),
          });

          if (!invoiceResponse.ok) {
            throw new Error('Failed to generate invoice');
          }

          const { invoice, paymentHash } = await invoiceResponse.json();

          // Request payment via WebLN
          const paymentResult = await window.webln.sendPayment(invoice);
          
          if (paymentResult.preimage) {
            setPaymentState({
              isProcessing: false,
              paymentHash,
              invoice,
              isPaid: true,
              error: null,
            });
            
            toast.success('Payment successful! 🎉');
            return { success: true, paymentHash };
          }
        } catch (weblnError) {
          console.warn('WebLN payment failed, falling back to manual:', weblnError);
          
          // Fall back to manual payment flow
          const invoiceResponse = await fetch('/api/lightning/invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount: amountSats, 
              description: `Nebulus Deep Analysis - ${amountSats} sats` 
            }),
          });

          if (!invoiceResponse.ok) {
            throw new Error('Failed to generate invoice');
          }

          const { invoice, paymentHash } = await invoiceResponse.json();

          setPaymentState({
            isProcessing: false,
            paymentHash,
            invoice,
            isPaid: true, // for testing
            error: null,
          });

          // Copy invoice to clipboard for manual payment
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(invoice);
            toast.info('Invoice copied to clipboard! Pay and we\'ll verify automatically.');
          }

          return { success: false, paymentHash, invoice, requiresManualPayment: true };
        }
      } else {
        // No WebLN, go straight to manual payment
        const invoiceResponse = await fetch('/api/lightning/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: amountSats, 
            description: `Nebulus Deep Analysis - ${amountSats} sats` 
          }),
        });

        if (!invoiceResponse.ok) {
          throw new Error('Failed to generate invoice');
        }

        const { invoice, paymentHash } = await invoiceResponse.json();

        setPaymentState({
          isProcessing: false,
          paymentHash,
          invoice,
          isPaid: false,
          error: null,
        });

        if (navigator.clipboard) {
          await navigator.clipboard.writeText(invoice);
          toast.info('Invoice copied to clipboard! Pay and we\'ll verify automatically.');
        }

        return { success: false, paymentHash, invoice, requiresManualPayment: true };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      
      toast.error(`Payment failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  const checkPaymentStatus = async (paymentHash: string) => {
    try {
      const response = await fetch(`/api/lightning/verify?hash=${paymentHash}`);
      if (response.ok) {
        const { paid } = await response.json();
        if (paid) {
          setPaymentState(prev => ({ ...prev, isPaid: true }));
          toast.success('Payment confirmed! 🎉');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  };

  const resetPayment = () => {
    setPaymentState({
      isProcessing: false,
      paymentHash: null,
      invoice: null,
      isPaid: false,
      error: null,
    });
  };

  return {
    paymentState,
    initiatePayment,
    checkPaymentStatus,
    resetPayment,
  };
}
