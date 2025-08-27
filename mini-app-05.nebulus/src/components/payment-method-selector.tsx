'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Wallet, QrCode, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLightningPayment } from '@/lib/use-lightning-payment';
import { payWithSOL, airdropSOL } from '@/lib/solana-payment';
import QRCode from 'qrcode';

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (signature: string, method: 'solana' | 'lightning') => void;
  amount?: number;
  description?: string;
  title?: string;
}

export default function PaymentMethodSelector({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount = 0.001,
  description = "Premium AI Analysis",
  title = "Choose Payment Method"
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'solana' | 'lightning' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [invoice, setInvoice] = useState<string>('');
  const [paymentHash, setPaymentHash] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  const { connected, publicKey, signTransaction, sendTransaction } = useWallet();
  const { paymentState, initiatePayment, checkPaymentStatus, resetPayment } = useLightningPayment();

  const handleSolanaPayment = async () => {
    if (!connected || !publicKey || !signTransaction || !sendTransaction) {
      toast.error('Please connect your Solana wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      const signature = await payWithSOL(
        publicKey,
        amount,
        signTransaction,
        sendTransaction
      );

      if (signature) {
        onPaymentSuccess(signature, 'solana');
        onClose();
        toast.success('Solana payment successful! 🎉');
      }
    } catch (error: any) {
      console.error('Solana payment error:', error);
      
      if (error.message?.includes('insufficient')) {
        // Offer airdrop for devnet
        toast.error('Insufficient SOL balance. Getting devnet SOL...');
        try {
          await airdropSOL(publicKey);
          toast.success('Devnet SOL airdropped! Please try payment again.');
        } catch (airdropError) {
          toast.error('Failed to get devnet SOL. Please try again later.');
        }
      } else {
        toast.error('Solana payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLightningPayment = async () => {
    setIsProcessing(true);
    try {
      const amountSats = Math.round(amount * 100000000 * 0.000040); // Convert SOL to sats (approximate)
      const result = await initiatePayment(amountSats);

      if (result?.success) {
        onPaymentSuccess(result?.paymentHash!, 'lightning');
        onClose();
      } else if (result?.requiresManualPayment) {
        setInvoice(result?.invoice!);
        setPaymentHash(result?.paymentHash!);
        
        // Generate QR code
        try {
          const qrDataUrl = await QRCode.toDataURL(result?.invoice!, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeDataUrl(qrDataUrl);
        } catch (qrError) {
          console.error('QR code generation failed:', qrError);
        }
        
        setShowQR(true);
        
        // Start polling for payment
        const pollInterval = setInterval(async () => {
          const isPaid = await checkPaymentStatus(result.paymentHash!);
          if (isPaid) {
            clearInterval(pollInterval);
            onPaymentSuccess(result.paymentHash!, 'lightning');
            onClose();
          }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error) {
      toast.error('Lightning payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyInvoice = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice);
      toast.success('Invoice copied to clipboard!');
    }
  };

  const openInWallet = () => {
    if (invoice) {
      const lightningUrl = `lightning:${invoice}`;
      window.open(lightningUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!selectedMethod && !showQR && (
              <div className="space-y-4">
                <p className="text-white/80 text-center mb-6">
                  Choose your preferred payment method:
                </p>

                {/* Solana Payment Option */}
                <motion.button
                  onClick={() => setSelectedMethod('solana')}
                  className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-white">Solana Payment</h4>
                        <p className="text-sm text-gray-400">Pay with SOL using your wallet</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{amount} SOL</p>
                      <p className="text-xs text-gray-400">~${(amount * 100).toFixed(2)}</p>
                    </div>
                  </div>
                </motion.button>

                {/* Lightning Payment Option */}
                <motion.button
                  onClick={() => setSelectedMethod('lightning')}
                  className="w-full p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl hover:from-yellow-500/30 hover:to-orange-500/30 transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-white">Lightning Network</h4>
                        <p className="text-sm text-gray-400">Instant Bitcoin payments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{Math.round(amount * 100000000 * 0.000040)} sats</p>
                      <p className="text-xs text-gray-400">~${(amount * 100).toFixed(2)}</p>
                    </div>
                  </div>
                </motion.button>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                  <p className="text-xs text-blue-300 text-center">
                    💡 Both methods support instant payments. Choose the one you prefer!
                  </p>
                </div>
              </div>
            )}

            {/* Solana Payment Flow */}
            {selectedMethod === 'solana' && !showQR && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Solana Payment</h4>
                  <p className="text-gray-400 mb-4">Amount: {amount} SOL</p>
                </div>

                {!connected ? (
                  <div className="text-center">
                    <p className="text-red-400 mb-4">Please connect your Solana wallet first</p>
                    <button
                      onClick={() => setSelectedMethod(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                    >
                      Go Back
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
                      <p className="text-sm text-green-300 text-center">
                        ✅ Wallet Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedMethod(null)}
                        className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                        disabled={isProcessing}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSolanaPayment}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4" />
                            Pay Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lightning Payment Flow */}
            {selectedMethod === 'lightning' && !showQR && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Lightning Payment</h4>
                  <p className="text-gray-400 mb-4">Amount: {Math.round(amount * 100000000 * 0.000040)} sats</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleLightningPayment}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Invoice
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Lightning QR/Invoice Display */}
            {showQR && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Lightning Invoice</h4>
                  <p className="text-gray-400 mb-4">Scan QR code or copy invoice to pay</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Lightning Invoice QR Code" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-32 h-32 text-gray-800" />
                    )}
                  </div>
                </div>

                {/* Invoice String */}
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <p className="text-xs text-gray-400 mb-2">Lightning Invoice:</p>
                    <p className="text-sm text-white font-mono break-all">
                      {invoice.slice(0, 50)}...{invoice.slice(-20)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={copyInvoice}
                      className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Invoice
                    </button>
                    <button
                      onClick={openInWallet}
                      className="flex-1 px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Wallet
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      💡 Payment will be verified automatically once received
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
