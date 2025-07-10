import { NextResponse } from 'next/server';
import { SimplePool, Filter, Event } from 'nostr-tools';
import { summarizeContent } from '@/lib/ai';
import { verifyPayment } from '@/lib/lightning';

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr.wine',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
];

const FREE_TIER_LIMIT = 10;
const PREMIUM_TIER_LIMIT = 10;

export async function POST(request: Request) {
  try {
    const {
      topic,
      tier = 'free',
      dateRange = 'all',
      includeReplies = true,
      paymentHash,
    } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (tier === 'premium') {
      if (!paymentHash) {
        return NextResponse.json({ error: 'Payment hash is required for premium tier.' }, { status: 402 });
      }
      const isPaid = await verifyPayment(paymentHash);
      if (!isPaid) {
        return NextResponse.json({ error: 'Payment not confirmed or invalid.' }, { status: 402 });
      }
    }

    const pool = new SimplePool();
    const filter: Filter = {
      kinds: [1],
      search: topic,
      limit: 50,
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

    const rankedEvents = events.sort((a, b) => b.created_at - a.created_at);
    
    const limit = tier === 'premium' ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;
    const topEvents = rankedEvents.slice(0, limit);

    let results;
    if (tier === 'premium') {
      const summaryPromises = topEvents.map(event => summarizeContent(event.content));
      const summaries = await Promise.all(summaryPromises);
      results = topEvents.map((event, index) => ({
        ...event,
        summary: summaries[index],
      }));
    } else {
      const summaryPromises = topEvents.map(event => summarizeContent(event.content));
      const summaries = await Promise.all(summaryPromises);
      results = topEvents.map((event, index) => ({ ...event, summary: summaries[index] || '' }));
    }

    return NextResponse.json({ curatedEvents: results });

  } catch (error) {
    console.error('Error in Nostr curation API:', error);
    return NextResponse.json({ error: 'Failed to fetch or process events.' }, { status: 500 });
  }
}