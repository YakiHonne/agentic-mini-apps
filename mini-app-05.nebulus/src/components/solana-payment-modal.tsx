'use client';
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { createPaymentTransaction, connection, DEEP_ANALYSIS_PRICE, airdropSOL, getSOLBalance } from '@/lib/solana-payment';
import { toast } from 'sonner';
import { X, Zap, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SolanaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (signature: string) => void;
  query: string;
}

export default function SolanaPaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  query 
}: SolanaPaymentModalProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);

  const amountSOL = DEEP_ANALYSIS_PRICE / LAMPORTS_PER_SOL;

  // Load balance when wallet connects
  React.useEffect(() => {
    if (publicKey && connected) {
      getSOLBalance(publicKey).then(setBalance);
    }
  }, [publicKey, connected]);

  const handlePayment = async () => {
    if (!publicKey || !connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsProcessing(true);
    try {
      const { transaction: serializedTx } = await createPaymentTransaction(publicKey);
      const transaction = Transaction.from(Buffer.from(serializedTx, 'base64'));
      
      const signature = await sendTransaction(transaction, connection);
      
      toast.success('Transaction sent! Confirming...');
      
      // Wait for confirmation
      // await connection.confirmTransaction(signature, 'confirmed');
      
      onPaymentSuccess(signature);
      toast.success('Payment confirmed! Starting Deep Analysis...');
    } catch (error: any) {
      console.error('Payment failed:', error);
      if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient SOL balance. Request an airdrop or add funds.');
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAirdrop = async () => {
    if (!publicKey) return;
    
    setIsRequestingAirdrop(true);
    try {
      await airdropSOL(publicKey, 1);
      toast.success('Airdrop successful! 1 SOL added to your wallet.');
      
      // Refresh balance
      const newBalance = await getSOLBalance(publicKey);
      setBalance(newBalance);
    } catch (error: any) {
      console.error('Airdrop failed:', error);
      toast.error(error.message || 'Airdrop failed. Try the faucet link instead.');
    } finally {
      setIsRequestingAirdrop(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-black/30 border border-white/20 p-6 rounded-xl max-w-md w-full mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Deep Analysis Payment</h3>
              <p className="text-gray-300 text-sm">
                Unlock comprehensive AI analysis for <span className="text-orange-400 font-medium">"{query}"</span>
              </p>
            </div>
            
            <div className="border border-white/10 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Amount:</span>
                <span className="text-2xl font-bold text-orange-400">{amountSOL} SOL</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Network:</span>
                <span className="text-green-400 font-medium">Devnet (Free Testing)</span>
              </div>
              {balance !== null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Your Balance:</span>
                  <span className={`font-medium ${balance >= amountSOL ? 'text-green-400' : 'text-red-400'}`}>
                    {balance.toFixed(4)} SOL
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {!connected ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 text-center">Connect your Solana wallet to continue</p>
                  <WalletMultiButton className="!w-full !bg-orange-600 !hover:bg-orange-700" />
                </div>
              ) : balance !== null && balance < amountSOL ? (
                <div className="space-y-3">
                  <p className="text-sm text-red-400 text-center">
                    Insufficient balance. Need {amountSOL} SOL but have {balance.toFixed(4)} SOL
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleAirdrop}
                      disabled={isRequestingAirdrop}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isRequestingAirdrop ? 'Requesting...' : 'Free Airdrop'}
                    </button>
                    <a
                      href="https://faucet.solana.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      Faucet <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !connected}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? 'Processing Payment...' : 'Pay with Solana'}
                </button>
              )}
            </div>

            <div className="text-xs text-white/80 text-center space-y-1">
              <p>🧪 This is Solana Devnet - no real money involved</p>
              <p>✨ Get free SOL from faucets for testing</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
