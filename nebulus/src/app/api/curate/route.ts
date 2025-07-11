import { NextResponse } from 'next/server';
import { SimplePool, Filter, Event } from 'nostr-tools';
import { summarizeContent, performDeepAnalysis, expandQuery } from '@/lib/ai';
import { verifyPayment } from '@/lib/lightning';

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr.wine',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net',
  'wss://relay.nostrich.de',
];

const FREE_TIER_LIMIT = 6;
const PREMIUM_TIER_LIMIT = 5;

export async function POST(request: Request) {
  try {
    const {
      topic,
      type = 'search',
      dateRange = 'all',
      includeReplies = true,
      paymentHash,
    } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Handle Deep Analysis
    if (type === 'deep-analysis') {
      if (!paymentHash) {
        return NextResponse.json({ 
          error: 'Payment required for deep analysis. Please complete the Lightning payment to continue.',
          requiresPayment: true 
        }, { status: 402 });
      }
      
      const isPaid = await verifyPayment(paymentHash);
      if (!isPaid) {
        return NextResponse.json({ 
          error: 'Payment not confirmed. Please try again or contact support.',
          paymentFailed: true 
        }, { status: 402 });
      }

      // Step 1: Intelligent Query Expansion
      const expandedQueries = await expandQuery(topic);
      
      // Step 2: Advanced Multi-Relay Search
      const pool = new SimplePool();
      const allEvents: Event[] = [];

      // Search with expanded queries
      for (const query of expandedQueries) {
        const filter: Filter = {
          kinds: [1], // Regular notes and long-form content:: 30023
          search: query,
          limit: 30,
        };

        if (dateRange === '24h') {
          filter.since = Math.floor((Date.now() / 1000) - 24 * 60 * 60);
        } else if (dateRange === '7d') {
          filter.since = Math.floor((Date.now() / 1000) - 7 * 24 * 60 * 60);
        } else if (dateRange === '30d') {
          filter.since = Math.floor((Date.now() / 1000) - 30 * 24 * 60 * 60);
        }

        const events: Event[] = await pool.querySync(RELAYS, filter);
        allEvents.push(...events);
      }

      pool.close(RELAYS);

      // Remove duplicates by event ID
      const uniqueEvents = allEvents.filter((event, index, arr) => 
        arr.findIndex(e => e.id === event.id) === index
      );

      // Step 3: Advanced Filtering & Ranking
      let filteredEvents = uniqueEvents;
      
      if (!includeReplies) {
        filteredEvents = filteredEvents.filter(event => 
          !event.tags.some(tag => tag[0] === 'e')
        );
      }

      // Rank by engagement and recency
      const rankedEvents = filteredEvents
        .map(event => {
          const zapTags = event.tags.filter(tag => tag[0] === 'zap').length;
          const replyTags = event.tags.filter(tag => tag[0] === 'e').length;
          const contentLength = event.content.length;
          const recencyScore = Math.max(0, 1 - (Date.now()/1000 - event.created_at) / (7 * 24 * 60 * 60));
          
          const engagementScore = (zapTags * 3) + (replyTags * 2) + (contentLength > 100 ? 1 : 0);
          const totalScore = engagementScore + (recencyScore * 2);
          
          return { ...event, score: totalScore };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, PREMIUM_TIER_LIMIT);

      // Step 4: Deep AI Analysis
      const analysisResult = await performDeepAnalysis(rankedEvents, topic, expandedQueries);

      return NextResponse.json({ 
        curatedEvents: analysisResult.events,
        deepAnalysis: analysisResult.analysis,
        expandedQueries,
        totalEventsAnalyzed: uniqueEvents.length,
        type: 'deep-analysis'
      });
    }

    // Regular Search (Free)
    const pool = new SimplePool();
    const filter: Filter = {
      kinds: [1],
      search: topic,
      limit: 40,
    };

    if (dateRange === '24h') {
      filter.since = Math.floor((Date.now() / 1000) - 24 * 60 * 60);
    } else if (dateRange === '7d') {
      filter.since = Math.floor((Date.now() / 1000) - 7 * 24 * 60 * 60);
    }

    let events: Event[] = await pool.querySync(RELAYS, filter);
    pool.close(RELAYS);

    if (!includeReplies) {
      events = events.filter(event => !event.tags.some(tag => tag[0] === 'e'));
    }

    const rankedEvents = events
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, FREE_TIER_LIMIT);

    // Generate basic summaries for free tier
    const summaryPromises = rankedEvents.map(event => summarizeContent(event.content));
    const summaries = await Promise.all(summaryPromises);
    
    const results = rankedEvents.map((event, index) => ({
      ...event,
      summary: summaries[index] || '',
    }));

    return NextResponse.json({ 
      curatedEvents: results,
      type: 'search'
    });

  } catch (error) {
    console.error('Error in Nostr curation API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch or process events. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}