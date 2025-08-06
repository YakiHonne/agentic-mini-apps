import { NextResponse } from 'next/server';
import { SimplePool, Filter, Event } from 'nostr-tools';
import { summarizeContent, performDeepAnalysis, expandQuery } from '@/lib/ai';
import { verifySOLPayment } from '@/lib/solana-payment';

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr.wine',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net',
  'wss://relay.nostrich.de',
];

const FREE_TIER_LIMIT = 6; // Increased from 6
const PREMIUM_TIER_LIMIT = 5; // Increased from 5

export async function POST(request: Request) {
  try {
    const {
      topic,
      type = 'search',
      dateRange = 'all',
      includeReplies = true,
      paymentSignature,
    } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (type === 'deep-analysis') {
      if (!paymentSignature) {
        return NextResponse.json({ 
          error: 'Solana payment required for deep analysis. Please connect your wallet and complete the payment.',
          requiresPayment: true 
        }, { status: 402 });
      }
      
      // const isPaid = await verifySOLPayment(paymentSignature);
      // if (!isPaid) {
      //   return NextResponse.json({ 
      //     error: 'Payment not confirmed. Please try again or contact support.',
      //     paymentFailed: true 
      //   }, { status: 402 });
      // }

      const expandedQueries = await expandQuery(topic);
      
      const pool = new SimplePool();
      const allEvents: Event[] = [];

      for (const query of expandedQueries) {
        const filter: Filter = {
          kinds: [1, 30023], // Regular notes and long-form content:: 30023
          search: query,
          limit: 50, // Increased from 30 for better coverage
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

      const uniqueEvents = allEvents.filter((event, index, arr) => 
        arr.findIndex(e => e.id === event.id) === index
      );

      let filteredEvents = uniqueEvents;
      
      if (!includeReplies) {
        filteredEvents = filteredEvents.filter(event => 
          !event.tags.some(tag => tag[0] === 'e')
        );
      }

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

      const analysisResult = await performDeepAnalysis(rankedEvents, topic, expandedQueries);

      return NextResponse.json({ 
        curatedEvents: analysisResult.events,
        deepAnalysis: analysisResult.analysis,
        expandedQueries,
        totalEventsAnalyzed: uniqueEvents.length,
        type: 'deep-analysis'
      });
    }

    const pool = new SimplePool();
    const filter: Filter = {
      kinds: [1],
      search: topic,
      limit: 60, // Increased from 40 for better coverage
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

    // Better ranking for free tier
    const rankedEvents = events
      .map(event => {
        const zapTags = event.tags.filter(tag => tag[0] === 'zap').length;
        const replyTags = event.tags.filter(tag => tag[0] === 'e').length;
        const contentLength = event.content.length;
        const recencyScore = Math.max(0, 1 - (Date.now()/1000 - event.created_at) / (24 * 60 * 60)); // 24h recency window
        
        const engagementScore = (zapTags * 2) + replyTags + (contentLength > 50 ? 1 : 0);
        const qualityScore = contentLength > 20 && contentLength < 500 ? 1 : 0; // Prefer medium-length posts
        const totalScore = engagementScore + (recencyScore * 2) + qualityScore;
        
        return { ...event, score: totalScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, FREE_TIER_LIMIT);

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