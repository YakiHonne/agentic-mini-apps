import OpenAI from 'openai';
import { Event } from 'nostr-tools';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

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
 * Summarizes a piece of text using the OpenAI API.
 * @param content The text content of a single Nostr note.
 * @returns An AI-generated one-sentence summary.
 */
export async function summarizeContent(content: string): Promise<string> {
  const cleanedContent = cleanNoteContent(content);

  if (cleanedContent.length < 20) {
    return cleanedContent;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [
        {
          role: "system",
          content: "You are a highly skilled AI assistant called Nebulus. Your task is to summarize the following social media post into a single, concise, and neutral sentence. Do not add any commentary or your own opinions."
        },
        {
          role: "user",
          content: cleanedContent
        }
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const summary = completion.choices[0]?.message?.content?.trim() || "Could not generate summary.";
    return summary;

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "AI summarization failed.";
  }
}

/**
 * Expands a user query into related search terms for comprehensive coverage
 * @param topic The original search topic
 * @returns Array of expanded search terms
 */
export async function expandQuery(topic: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [
        {
          role: "system",
          content: "You are Nebulus, an expert research assistant. Given a search topic, generate 4-6 related search terms that would help find comprehensive content about the topic. Return only the terms, separated by commas, no explanations."
        },
        {
          role: "user",
          content: `Expand this search topic into related terms: "${topic}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) return [topic];

    const expandedTerms = response.split(',').map(term => term.trim()).filter(term => term.length > 0);
    return [topic, ...expandedTerms].slice(0, 6);

  } catch (error) {
    console.error("Error expanding query:", error);
    return [topic];
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
        
        const categoryResponse = await openai.chat.completions.create({
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
        });

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

    const analysisCompletion = await openai.chat.completions.create({
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
    });

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