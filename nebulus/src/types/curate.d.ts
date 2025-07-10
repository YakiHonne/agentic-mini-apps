export interface CuratedEvent {
    content: string;
    created_at: number;
    id: string;
    kind: number;
    pubkey: string;
    sig: string;
    tags: string[][];
    summary: string;
}

export interface CuratedEventsResponse {
    curatedEvents: CuratedEvent[];
}