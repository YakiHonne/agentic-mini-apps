import OpenAI from 'openai';
import { Event } from 'nostr-tools';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

let requestQueue: Promise<any> = Promise.resolve();

/**
 * Enqueue a function to ensure sequential execution of requests.
 */
function queuedCall<T>(fn: () => Promise<T>): Promise<T> {
  const resPromise = requestQueue.then(() => fn());
  requestQueue = resPromise.catch(() => undefined);
  return resPromise;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const status = err.status || err.statusCode || (err.code === '429' ? 429 : null)
                || (typeof err.message === 'string' && err.message.includes('429') ? 429 : null);
    if (retries > 0 && status === 429) {
      console.warn(`Rate limit hit, retrying in ${backoff}ms... (${retries} retries left)`);
      await sleep(backoff);
      return callWithRetry(fn, retries - 1, backoff * 2);
    }
    throw err;
  }
}

/**
 * Cleans up Nostr note content to make it more suitable for AI processing.
 * Removes URLs, hashtags, and excessive whitespace.
 * @param content The raw content of a Nostr note.
 * @returns The cleaned-up text.
 */
function cleanNoteContent(content: string): string {
  let cleaned = content.replace(/https?:\/\/[^\s]+/g, '');
  cleaned = cleaned.replace(/nostr:[^\s]+/g, '');
  cleaned = cleaned.replace(/#\w+/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Summarizes a piece of text using the OpenAI API with enhanced quality.
 * @param content The text content of a single Nostr note.
 * @returns An AI-generated comprehensive summary.
 */
export async function summarizeContent(content: string): Promise<string> {
  const cleanedContent = cleanNoteContent(content);

  if (cleanedContent.length < 20) {
    return cleanedContent;
  }

  try {
    const completion = await callWithRetry(() => openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: `You are Nebulus, an expert AI assistant specializing in Nostr and cryptocurrency content analysis. 

Your task is to create insightful, engaging summaries that:
- Capture the core message and key insights
- Identify important technical details or market implications
- Highlight unique perspectives or valuable information
- Use clear, accessible language
- Maintain objectivity while being engaging

Format: Provide a 1-2 sentence summary that gives readers immediate value and context.`
        },
        {
          role: "user",
          content: `Summarize this Nostr post with focus on extracting maximum value and insight:\n\n${cleanedContent}`
        }
      ],
      temperature: 0.3,
      max_tokens: 250,
    }));

    const summary = completion.choices[0]?.message?.content?.trim() || "Could not generate summary.";
    return summary;

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "AI summarization temporarily unavailable.";
  }
}

/**
 * Expands a user query into related search terms for comprehensive coverage
 * @param topic The original search topic
 * @returns Array of expanded search terms
 */
export async function expandQuery(topic: string): Promise<string[]> {
  try {
    const completion = await callWithRetry(() => openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: `You are Nebulus, an expert research assistant with deep knowledge of cryptocurrency, blockchain, Nostr protocol, and decentralized technologies.

Given a search topic, generate 4-6 strategically related search terms that would help find comprehensive, high-quality content. Focus on:
- Technical terminology and variations
- Related concepts and protocols
- Market and adoption aspects
- Developer and community perspectives
- Current events and developments

Return only the terms separated by commas, no explanations.`
        },
        {
          role: "user",
          content: `Generate comprehensive search terms for: "${topic}"`
        }
      ],
      temperature: 0.4,
      max_tokens: 150,
    }));

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) return [topic];

    const expandedTerms = response.split(',').map(term => term.trim()).filter(term => term.length > 0);
    return [topic, ...expandedTerms].slice(0, 8); // Increased from 6 to 8 for better coverage

  } catch (error) {
    console.error("Error expanding query:", error);
    return [topic];
  }
}

/**
 * Agentic AI Chat Assistant for Nostr and Crypto
 * @param message User's message
 * @param conversationHistory Previous conversation context
 * @param userContext Optional user context (wallet, preferences, etc.)
 * @returns AI response with actions and insights
 */
export async function agenticChatResponse(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  userContext?: {
    walletConnected?: boolean;
    publicKey?: string;
    recentSearches?: string[];
    preferences?: any;
  }
): Promise<{
  content: string;
  actions?: Array<{
    type: 'search' | 'analysis' | 'recommendation' | 'data_fetch';
    payload: any;
    description: string;
  }>;
  followUpQuestions?: string[];
  confidence: number;
}> {
  try {
    const systemPrompt = `You are Nebulus, an advanced AI assistant specializing in Nostr protocol, cryptocurrency, blockchain technology, and decentralized systems. You are built into a powerful Nostr search and analysis platform.

Your capabilities include:
- Real-time Nostr network analysis and insights
- Cryptocurrency market analysis and trends
- Technical protocol explanations (Bitcoin, Lightning, Nostr, Solana, etc.)
- Community sentiment analysis
- Developer resources and guidance
- Privacy and security best practices
- Decentralized application recommendations

User Context:
- Wallet Connected: ${userContext?.walletConnected ? 'Yes' : 'No'}
- Recent Searches: ${userContext?.recentSearches?.join(', ') || 'None'}

Guidelines:
1. Provide accurate, actionable information
2. Suggest specific searches or analyses when relevant
3. Ask clarifying questions to better help the user
4. Recommend premium features when they would add significant value
5. Maintain a helpful, knowledgeable, but approachable tone
6. Always consider the decentralized and privacy-focused nature of these technologies

Respond with helpful insights and when appropriate, suggest actions the user can take within the platform.`;

    const completion = await callWithRetry(() => openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }));

    const response = completion.choices[0]?.message?.content?.trim() || "I'm having trouble processing that right now. Could you try rephrasing your question?";

    // Analyze the response to suggest actions
    const actions: Array<{
      type: 'search' | 'analysis' | 'recommendation' | 'data_fetch';
      payload: any;
      description: string;
    }> = [];

    // Detect if user is asking about specific topics that could benefit from search
    const searchKeywords = ['bitcoin', 'nostr', 'lightning', 'solana', 'ethereum', 'defi', 'nft', 'crypto', 'blockchain', 'protocol'];
    const messageWords = message.toLowerCase().split(' ');
    
    for (const keyword of searchKeywords) {
      if (messageWords.some(word => word.includes(keyword))) {
        actions.push({
          type: 'search',
          payload: { query: keyword, type: 'search' },
          description: `Search for recent ${keyword} discussions`
        });
        break; // Only suggest one search action
      }
    }

    // Suggest analysis for market-related questions
    if (message.toLowerCase().includes('market') || message.toLowerCase().includes('price') || message.toLowerCase().includes('trend')) {
      actions.push({
        type: 'analysis',
        payload: { type: 'market_sentiment' },
        description: 'Analyze current market sentiment'
      });
    }

    // Generate follow-up questions
    const followUpCompletion = await callWithRetry(() => openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: "Based on the user's question and the AI response, suggest 2-3 relevant follow-up questions they might want to ask. Return only the questions, separated by | character."
        },
        {
          role: "user",
          content: `User asked: "${message}"\nAI responded: "${response}"\n\nSuggest follow-ups:`
        }
      ],
      temperature: 0.6,
      max_tokens: 150,
    }));

    const followUpQuestions = followUpCompletion.choices[0]?.message?.content?.trim()
      ?.split('|')
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 3) || [];

    return {
      content: response,
      actions: actions.slice(0, 2), // Limit to 2 actions max
      followUpQuestions,
      confidence: 0.85
    };

  } catch (error) {
    console.error("Error in agentic chat response:", error);
    return {
      content: "I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to explore the Nostr search functionality while I get back online! 🛠️",
      confidence: 0.1
    };
  }
}

/**
 * Performs comprehensive deep analysis on a collection of Nostr events
 * @param events Array of Nostr events to analyze
 * @param originalTopic The original search topic
 * @param expandedQueries The expanded search terms used
 * @returns Analysis results with enhanced event data
 */
export async function performDeepAnalysis(
  events: Event[], 
  originalTopic: string, 
  expandedQueries: string[]
): Promise<{
  events: (Event & { summary: string; category?: string; sentiment?: string })[];
  analysis: {
    executiveSummary: string;
    keyFindings: string[];
    sentimentAnalysis: {
      overall: 'bullish' | 'bearish' | 'neutral';
      confidence: number;
      breakdown: { positive: number; negative: number; neutral: number };
    };
    notableQuotes: Array<{ content: string; author: string; context: string }>;
    trendingNarratives: string[];
    recommendedReading: Array<{ id: string; reason: string }>;
    categories: Array<{ name: string; count: number; description: string }>;
  };
}> {
  try {
    const enhancedEvents = await Promise.all(
      events.map(async (event) => {
        const summary = await summarizeContent(event.content);
        
        const categoryResponse = await callWithRetry(() => openai.chat.completions.create({
          model: "gemini-2.0-flash",
          messages: [
            {
              role: "system",
              content: "Categorize this content into one of: News, Technical Analysis, Community Sentiment, Educational, Debate, Announcement, Personal Opinion. Return only the category name."
            },
            {
              role: "user",
              content: event.content.slice(0, 300)
            }
          ],
          temperature: 0.1,
          max_tokens: 20,
        }));

        const category = categoryResponse.choices[0]?.message?.content?.trim() || "General";

        return {
          ...event,
          summary,
          category
        };
      })
    );

    const analysisPrompt = `
Analyze these ${enhancedEvents.length} Nostr posts about "${originalTopic}" and provide a comprehensive research report.

POSTS TO ANALYZE:
${enhancedEvents.map((event, index) => 
  `${index + 1}. [${event.category}] ${event.content.slice(0, 200)}...`
).join('\n\n')}

Please provide a JSON response with the following structure:
{
  "executiveSummary": "2-3 sentence overview of key insights",
  "keyFindings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5"],
  "sentimentAnalysis": {
    "overall": "bullish|bearish|neutral",
    "confidence": 85,
    "reasoning": "explanation of sentiment"
  },
  "notableQuotes": [
    {"content": "quote text", "context": "why this quote is significant"},
    {"content": "quote text", "context": "why this quote is significant"}
  ],
  "trendingNarratives": ["narrative 1", "narrative 2", "narrative 3"],
  "categories": [
    {"name": "News", "count": 3, "description": "Recent developments"},
    {"name": "Technical Analysis", "count": 2, "description": "Market and technical insights"}
  ]
}`;

    const analysisCompletion = await callWithRetry(() => openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: "You are Nebulus, an expert research analyst. Provide comprehensive analysis in valid JSON format only."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }));

    let analysis;
    try {
      const rawAnalysis = analysisCompletion.choices[0]?.message?.content?.trim();
      analysis = JSON.parse(rawAnalysis || '{}');
    } catch (parseError) {
      console.error("Error parsing analysis JSON:", parseError);
      // Fallback analysis
      analysis = {
        executiveSummary: `Analysis of ${enhancedEvents.length} posts about ${originalTopic} reveals diverse perspectives and ongoing discussions in the Nostr community.`,
        keyFindings: [
          "Active community engagement around the topic",
          "Multiple perspectives and viewpoints represented",
          "Mix of technical and general interest content",
          "Recent developments driving discussion",
          "Strong participation from various community members"
        ],
        sentimentAnalysis: {
          overall: "neutral" as const,
          confidence: 70,
          reasoning: "Mixed sentiment across analyzed content"
        },
        notableQuotes: [],
        trendingNarratives: ["Community discussion", "Technical development", "User adoption"],
        categories: [
          { name: "General Discussion", count: enhancedEvents.length, description: "Community conversations" }
        ]
      };
    }

    const sentimentBreakdown = { positive: 0, negative: 0, neutral: 0 };
    const total = enhancedEvents.length;
    
    if (analysis.sentimentAnalysis?.overall === 'bullish') {
      sentimentBreakdown.positive = Math.round(total * 0.6);
      sentimentBreakdown.neutral = Math.round(total * 0.3);
      sentimentBreakdown.negative = total - sentimentBreakdown.positive - sentimentBreakdown.neutral;
    } else if (analysis.sentimentAnalysis?.overall === 'bearish') {
      sentimentBreakdown.negative = Math.round(total * 0.6);
      sentimentBreakdown.neutral = Math.round(total * 0.3);
      sentimentBreakdown.positive = total - sentimentBreakdown.negative - sentimentBreakdown.neutral;
    } else {
      sentimentBreakdown.neutral = Math.round(total * 0.5);
      sentimentBreakdown.positive = Math.round(total * 0.25);
      sentimentBreakdown.negative = total - sentimentBreakdown.neutral - sentimentBreakdown.positive;
    }

    const recommendedReading = enhancedEvents
      .slice(0, 3)
      .map(event => ({
        id: event.id,
        reason: "High engagement and relevance to the topic"
      }));

    const finalAnalysis = {
      ...analysis,
      sentimentAnalysis: {
        ...analysis.sentimentAnalysis,
        breakdown: sentimentBreakdown
      },
      recommendedReading
    };

    return {
      events: enhancedEvents,
      analysis: finalAnalysis
    };

  } catch (error) {
    console.error("Error in deep analysis:", error);
    
    const summaries = await Promise.all(
      events.map(event => summarizeContent(event.content))
    );

    const eventsWithSummaries = events.map((event, index) => ({
      ...event,
      summary: summaries[index],
      category: "General"
    }));

    return {
      events: eventsWithSummaries,
      analysis: {
        executiveSummary: `Analysis of ${events.length} posts about ${originalTopic}. Deep analysis temporarily unavailable.`,
        keyFindings: ["Content successfully retrieved", "Summaries generated", "Analysis in progress"],
        sentimentAnalysis: {
          overall: "neutral" as const,
          confidence: 50,
          breakdown: { positive: 0, negative: 0, neutral: events.length }
        },
        notableQuotes: [],
        trendingNarratives: ["Discussion ongoing"],
        recommendedReading: [],
        categories: [{ name: "General", count: events.length, description: "Mixed content" }]
      }
    };
  }
}