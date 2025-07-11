'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { useLightningPayment } from '@/lib/use-lightning-payment';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentHash: string) => void;
  query: string;
  amountSats?: number;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  query, 
  amountSats = 210 
}: PaymentModalProps) {
  const { paymentState, initiatePayment, checkPaymentStatus, resetPayment } = useLightningPayment();
  const [copied, setCopied] = useState(false);
  const [paymentStatusInterval, setPaymentStatusInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paymentState.isPaid && paymentState.paymentHash) {
      onPaymentSuccess(paymentState.paymentHash);
      handleClose();
    }
  }, [paymentState.isPaid, paymentState.paymentHash, onPaymentSuccess]);

  useEffect(() => {
    // Auto-check payment status every 3 seconds when we have a payment hash
    if (paymentState.paymentHash && !paymentState.isPaid) {
      const interval = setInterval(() => {
        checkPaymentStatus(paymentState.paymentHash!);
      }, 3000);
      setPaymentStatusInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [paymentState.paymentHash, paymentState.isPaid, checkPaymentStatus]);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (paymentStatusInterval) {
        clearInterval(paymentStatusInterval);
      }
    };
  }, [paymentStatusInterval]);

  const handleClose = () => {
    resetPayment();
    setCopied(false);
    if (paymentStatusInterval) {
      clearInterval(paymentStatusInterval);
      setPaymentStatusInterval(null);
    }
    onClose();
  };

  const handlePayment = async () => {
    await initiatePayment(amountSats);
  };

  const copyInvoice = async () => {
    if (paymentState.invoice) {
      try {
        await navigator.clipboard.writeText(paymentState.invoice);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Invoice copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy invoice');
      }
    }
  };

  const formatSats = (sats: number) => {
    return sats.toLocaleString();
  };

  const formatQuery = (query: string) => {
    return query.length > 50 ? query.substring(0, 50) + '...' : query;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Deep Analysis</h3>
                  <p className="text-sm text-gray-400">Premium AI-powered research</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Query Preview */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300 mb-2">Query:</p>
              <p className="text-white font-medium">{formatQuery(query)}</p>
            </div>

            {/* Payment Details */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Amount:</span>
                <span className="text-white font-semibold">{formatSats(amountSats)} sats</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">USD Equivalent:</span>
                <span className="text-gray-400 text-sm">~${(amountSats * 0.0001).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment State */}
            <div className="space-y-4">
              {!paymentState.paymentHash && !paymentState.isProcessing && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                >
                  Pay with Lightning ⚡
                </motion.button>
              )}

              {paymentState.isProcessing && (
                <div className="flex items-center justify-center gap-3 py-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full" />
                  </motion.div>
                  <span className="text-gray-300">Processing payment...</span>
                </div>
              )}

              {paymentState.invoice && !paymentState.isPaid && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Waiting for payment...</span>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-300 mb-2">Lightning Invoice:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-400 bg-gray-900 p-2 rounded flex-1 overflow-hidden">
                        {paymentState.invoice.substring(0, 30)}...
                      </code>
                      <button
                        onClick={copyInvoice}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center">
                    Invoice automatically copied to clipboard. We'll verify payment automatically.
                  </p>
                </div>
              )}

              {paymentState.error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{paymentState.error}</span>
                </div>
              )}
            </div>

            {/* Features List */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3">What you get:</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  AI-powered query expansion
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Multi-relay comprehensive search
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Sentiment analysis & insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Categorized findings & quotes
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
