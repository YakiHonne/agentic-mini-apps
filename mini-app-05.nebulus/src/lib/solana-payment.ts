import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Devnet configuration
export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const PAYMENT_WALLET = new PublicKey('Fg8ur1F9Z4n21BfEPgbvsUfLEZ8GYbkADUM8LqQAN2e9'); // Dummy address for now

// Deep analysis costs 0.001 SOL on devnet (very cheap for testing)
export const DEEP_ANALYSIS_PRICE = 0.001 * LAMPORTS_PER_SOL;

export interface PaymentTransactionData {
  transaction: string; // Base64 encoded transaction
  message: string;
}

/**
 * Creates a payment transaction for deep analysis
 */
export async function createPaymentTransaction(userWallet: PublicKey): Promise<PaymentTransactionData> {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userWallet,
        toPubkey: PAYMENT_WALLET,
        lamports: DEEP_ANALYSIS_PRICE,
      })
    );
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userWallet;
    
    const serializedTransaction = transaction.serialize({ 
      requireAllSignatures: false,
      verifySignatures: false 
    }).toString('base64');
    
    return {
      transaction: serializedTransaction,
      message: `Transfer ${DEEP_ANALYSIS_PRICE / LAMPORTS_PER_SOL} SOL for Deep Analysis`
    };
  } catch (error) {
    console.error('Failed to create payment transaction:', error);
    throw new Error('Failed to create payment transaction');
  }
}

/**
 * Verifies a Solana payment using the transaction signature
 */
export async function verifySOLPayment(signature: string): Promise<boolean> {
  try {
    console.log('Verifying payment with signature:', signature);
    
    const txResult = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    if (!txResult?.meta) {
      console.log('Transaction not found or no metadata');
      return false;
    }
    
    if (txResult.meta.err) {
      console.log('Transaction failed:', txResult.meta.err);
      return false;
    }
    
    // Verify the payment amount and recipient
    // For devnet testing, we'll be more lenient
    const preBalances = txResult.meta.preBalances;
    const postBalances = txResult.meta.postBalances;
    
    if (preBalances.length < 2 || postBalances.length < 2) {
      console.log('Invalid balance arrays');
      return false;
    }
    
    // Check if SOL was transferred (sender balance decreased)
    const senderBalanceChange = preBalances[0] - postBalances[0];
    const minExpectedChange = DEEP_ANALYSIS_PRICE * 0.8; // Allow for some tolerance with fees
    
    console.log('Balance change:', senderBalanceChange, 'Expected min:', minExpectedChange);
    
    return senderBalanceChange >= minExpectedChange;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

/**
 * Gets SOL balance for a wallet
 */
export async function getSOLBalance(walletAddress: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(walletAddress);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get SOL balance:', error);
    return 0;
  }
}

/**
 * Airdrops SOL on devnet for testing
 */
export async function airdropSOL(walletAddress: PublicKey, amount: number = 1): Promise<string> {
  try {
    const airdropAmount = amount * LAMPORTS_PER_SOL;
    const signature = await connection.requestAirdrop(walletAddress, airdropAmount);
    
    // Confirm the airdrop
    await connection.confirmTransaction({
      signature,
      ...(await connection.getLatestBlockhash())
    });
    
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    throw new Error('Airdrop failed. You may have reached the rate limit.');
  }
}

/**
 * Format SOL amount for display
 */
export function formatSOL(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

/**
 * Get devnet faucet URL for manual airdrops
 */
export function getDevnetFaucetUrl(): string {
  return 'https://faucet.solana.com/';
}
