export interface CuratedEvent {
    content: string;
    created_at: number;
    id: string;
    kind: number;
    pubkey: string;
    sig: string;
    tags: string[][];
    summary: string;
    category?: string;
    sentiment?: string;
    score?: number;
}

export interface DeepAnalysis {
    executiveSummary: string;
    keyFindings: string[];
    sentimentAnalysis: {
        overall: 'bullish' | 'bearish' | 'neutral';
        confidence: number;
        breakdown: { positive: number; negative: number; neutral: number };
        reasoning?: string;
    };
    notableQuotes: Array<{ content: string; context: string }>;
    trendingNarratives: string[];
    recommendedReading: Array<{ id: string; reason: string }>;
    categories: Array<{ name: string; count: number; description: string }>;
}

export interface CuratedEventsResponse {
    curatedEvents: CuratedEvent[];
    deepAnalysis?: DeepAnalysis;
    expandedQueries?: string[];
    totalEventsAnalyzed?: number;
    type: 'search' | 'deep-analysis';
}