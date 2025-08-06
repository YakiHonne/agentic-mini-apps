import { NextResponse } from 'next/server';
import { agenticChatResponse } from '@/lib/ai';
import { verifySOLPayment } from '@/lib/solana-payment';

const FREE_MESSAGES_PER_DAY = 10;
const PREMIUM_MESSAGES_PER_SESSION = 50;

// In production, you'd use a proper database
const userMessageCounts = new Map<string, { count: number; lastReset: Date }>();

function checkMessageLimit(userKey: string, isPremium: boolean): boolean {
  const now = new Date();
  const userKey_normalized = userKey || 'anonymous';
  
  if (!userMessageCounts.has(userKey_normalized)) {
    userMessageCounts.set(userKey_normalized, { count: 0, lastReset: now });
  }
  
  const userData = userMessageCounts.get(userKey_normalized)!;
  
  // Reset daily count for free users
  if (!isPremium && now.getDate() !== userData.lastReset.getDate()) {
    userData.count = 0;
    userData.lastReset = now;
  }
  
  const limit = isPremium ? PREMIUM_MESSAGES_PER_SESSION : FREE_MESSAGES_PER_DAY;
  
  if (userData.count >= limit) {
    return false;
  }
  
  userData.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const {
      message,
      conversationHistory = [],
      userContext = {},
      paymentSignature
    } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if this is a premium request
    const isPremium = !!paymentSignature;
    let isValidPayment = true;

    if (isPremium) {
      isValidPayment = await verifySOLPayment(paymentSignature);
      if (!isValidPayment) {
        return NextResponse.json({ 
          error: 'Payment verification failed. Please try again.',
          requiresPayment: true 
        }, { status: 402 });
      }
    }

    // Check message limits
    const userKey = userContext.publicKey || request.headers.get('x-forwarded-for') || 'anonymous';
    
    if (!checkMessageLimit(userKey, isPremium && isValidPayment)) {
      const limitMessage = isPremium 
        ? 'Premium session message limit reached. Please start a new session.'
        : 'Daily message limit reached. Connect your wallet and pay with SOL for premium unlimited chat!';
      
      return NextResponse.json({ 
        error: limitMessage,
        requiresPayment: !isPremium,
        limitReached: true
      }, { status: 429 });
    }

    // Enhanced user context for premium users
    const enhancedContext = {
      ...userContext,
      isPremium: isPremium && isValidPayment,
      features: isPremium && isValidPayment ? [
        'unlimited_messages',
        'advanced_analysis',
        'real_time_data',
        'priority_support'
      ] : [
        'basic_chat',
        'limited_messages'
      ]
    };

    // Get AI response
    const aiResponse = await agenticChatResponse(message, conversationHistory, enhancedContext);

    // Add premium indicators to response
    const response = {
      ...aiResponse,
      isPremium: isPremium && isValidPayment,
      messageCount: userMessageCounts.get(userKey)?.count || 1,
      remainingMessages: isPremium && isValidPayment 
        ? PREMIUM_MESSAGES_PER_SESSION - (userMessageCounts.get(userKey)?.count || 1)
        : FREE_MESSAGES_PER_DAY - (userMessageCounts.get(userKey)?.count || 1),
      features: enhancedContext.features
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ 
      error: 'Failed to process chat message. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userKey = url.searchParams.get('userKey') || 'anonymous';
  
  const userData = userMessageCounts.get(userKey);
  const remainingFreeMessages = Math.max(0, FREE_MESSAGES_PER_DAY - (userData?.count || 0));
  
  return NextResponse.json({
    remainingFreeMessages,
    totalFreeMessages: FREE_MESSAGES_PER_DAY,
    premiumSessionLimit: PREMIUM_MESSAGES_PER_SESSION,
    lastActivity: userData?.lastReset || null
  });
}
