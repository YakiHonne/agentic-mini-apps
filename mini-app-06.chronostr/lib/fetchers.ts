import { Client, Filter, Kind, KindStandard, Event, EventId, Timestamp, PublicKey, Duration, loadWasmAsync, Keys, SubscribeAutoCloseOptions, SingleLetterTag, Alphabet } from "@rust-nostr/nostr-sdk";
import { relays, eventKinds, rsvpKind } from "./constants";


export async function fetchRSVPs(eventId: string, callback: any) {
    await loadWasmAsync();
    let client = new Client();
    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();

    //get rsvps
    const tg = SingleLetterTag.lowercase(Alphabet.E);
    let filter = new Filter().kind(new Kind(rsvpKind)).customTag(tg, eventId)
    const events1 = await client.fetchEvents(filter, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson);
    callback(eventsVecJson);
}

export async function fetchUserRSVPEvents(pubkey: string, callback: any, activeHashtags: string[] = []) {
    await loadWasmAsync();
    let client = new Client();
    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();
    //get rsvps
    let filterRsvp = new Filter().kind(new Kind(rsvpKind)).author(PublicKey.parse(pubkey))
    if (activeHashtags.length > 0) {
        filterRsvp = filterRsvp.hashtags(activeHashtags);
    }
    const events1 = await client.fetchEvents(filterRsvp, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson);

    //now fetch the events for which the user has RSVPed
    let parsedRsvpEvents = eventsVecJson.map((event) => parseRSVPEvent(event));
    let filterEvents = new Filter().kinds(eventKinds.map((kind) => new Kind(kind))).ids(parsedRsvpEvents.map((rsvp) => EventId.parse(rsvp.e)));
    const events2 = await client.fetchEvents(filterEvents, Duration.fromSecs(10));
    let eventsVec2 = events2.toVec();
    let eventsVecJson2 = eventsVec2.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson2);
    callback(eventsVecJson2)
}

export async function fetchAllEvents(callback: (events: any) => void, activeHashtags: string[] = []) {
    await loadWasmAsync();

    let client = new Client();

    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();

    //get calendar events
    let filter1 = new Filter().kinds(eventKinds.map((kind) => new Kind(kind))).since(Timestamp.fromSecs(Date.now() / 1000 - 60 * 60 * 24 * 30))
    if (activeHashtags.length > 0) {
        filter1 = filter1.hashtags(activeHashtags);
    }
    filter1 = filter1.limit(100);
    const events1 = await client.fetchEvents(filter1, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    //only return the events whose start /time is in the future
    //doing this client side now but explore filters
    eventsVecJson = eventsVecJson.map((event) => parseCalendarEvent(event));
    eventsVecJson = eventsVecJson.filter((event: any) => {
        if (event.kind === 31923) {
            const startDate = new Date(parseInt(event.start, 10) * 1000);
            return startDate > new Date();
        }
        if (event.kind === 31922) {
            //here, the date has to be ahead of today
            return new Date(event.start) > new Date();
        }
        return true;
    });
    //sort it by earliest to latest start date
    eventsVecJson = sortEventsByStartDate(eventsVecJson);
    callback(eventsVecJson);
}


export async function fetchUserEvents(pubkey: string, callback: (events: any) => void, activeHashtags: string[] = []) {
    await loadWasmAsync();

    let client = new Client();

    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();

    //get calendar events
    let filter1 = new Filter().kinds(eventKinds.map((kind) => new Kind(kind))).author(PublicKey.parse(pubkey))
    if (activeHashtags.length > 0) {
        filter1 = filter1.hashtags(activeHashtags);
    }
    const events1 = await client.fetchEvents(filter1, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson);
    callback(eventsVecJson);
}

export async function fetchUserCalendars(pubkey: string, callback: (events: any) => void) {
    await loadWasmAsync();
    let client = new Client();
    for (const relay of relays) {
        await client.addRelay(relay);
    }
    await client.connect();

    let filter = new Filter()
        .kind(new Kind(31924))
        .author(PublicKey.parse(pubkey));

    const events = await client.fetchEvents(filter, Duration.fromSecs(10));
    let eventsVec = events.toVec();
    let eventsVecAsJson = eventsVec.map((event) => JSON.parse(event.asJson()));
    callback(eventsVecAsJson);
}

export async function fetchEventsForCalendar(calendar: any, callback: (events: any) => void) {
    await loadWasmAsync();
    let client = new Client();
    for (const relay of relays) {
        await client.addRelay(relay);
    }
    await client.connect();

    const eventCoordinates = calendar.a;

    if (!eventCoordinates || eventCoordinates.length === 0) {
        callback([]);
        return;
    }

    const dIdentifiers = eventCoordinates
        .map((coord: string) => {
            const parts = coord.split(':');
            return parts.length >= 3 ? parts[2] : null;
        })
        .filter((d: any): d is string => d !== null);

    if (dIdentifiers.length === 0) {
        callback([]);
        return;
    }

    const filter = new Filter().kinds(eventKinds.map((kind) => new Kind(kind))).customTags(SingleLetterTag.lowercase(Alphabet.D), dIdentifiers).limit(20)

    const events = await client.fetchEvents(filter, Duration.fromSecs(10));
    let eventsVec = events.toVec();
    let eventsVecAsJson = eventsVec.map((event) => JSON.parse(event.asJson()));
    callback(eventsVecAsJson);
}

// fetching related utils

const sortEventsByStartDate = (events: any[]) => {
    return events.sort((a: any, b: any) => {
        if (a.kind === 31923 && b.kind === 31923) {
            return new Date(parseInt(a.start, 10) * 1000).getTime() - new Date(parseInt(b.start, 10) * 1000).getTime();
        }
        if (a.kind === 31922 && b.kind === 31922) {
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        }
        if (a.kind === 31923 && b.kind === 31922) {
            return new Date(parseInt(a.start, 10) * 1000).getTime() - new Date(b.start).getTime();
        }
        if (a.kind === 31922 && b.kind === 31923) {
            return new Date(a.start).getTime() - new Date(parseInt(b.start, 10) * 1000).getTime();
        }
        return 0;
    })
}

export function parseCalendarEvent(eventJson: any) {
    const parsed = {
        id: eventJson.id,
        pubkey: eventJson.pubkey,
        createdAt: eventJson.created_at,
        kind: eventJson.kind,
        content: eventJson.content,
        d: "",
        title: '',
        summary: '',
        start: null,
        end: null,
        location: '',
        image: '',
        hashtags: Array<string>(),
        participants: Array<{ pubkey: string, role: string }>(),
    };

    if (!eventJson.tags || !Array.isArray(eventJson.tags)) {
        return parsed;
    }

    const tagMap = new Map<string, any>();
    for (const tag of eventJson.tags) {
        const key = tag[0];
        const value = tag.slice(1);

        if (tagMap.has(key)) {
            const existing = tagMap.get(key);
            if (Array.isArray(existing[0])) {
                tagMap.set(key, [...existing, value]);
            } else {
                tagMap.set(key, [existing, value]);
            }
        } else {
            tagMap.set(key, value);
        }
    }

    parsed.d = tagMap.get('d')?.[0] || '';
    parsed.title = tagMap.get('title')?.[0] || 'Untitled Event';
    parsed.summary = tagMap.get('summary')?.[0] || parsed.content;
    parsed.start = tagMap.get('start')?.[0] || null;
    parsed.end = tagMap.get('end')?.[0] || null;
    // console.log(typeof parsed.start, parsed.kind)
    parsed.location = tagMap.get('location')?.[0] || '';
    parsed.image = tagMap.get('image')?.[0] || '';

    const hashtags = tagMap.get('t');
    if (hashtags) {
        parsed.hashtags = hashtags.flat();
    }

    const participantsData = tagMap.get('p');
    if (participantsData) {
        const participantsArray = (participantsData.length > 0 && Array.isArray(participantsData[0]))
            ? participantsData
            : [participantsData];

        for (const pTag of participantsArray) {
            if (pTag && pTag[0]) {
                const participant = {
                    pubkey: pTag[0],
                    role: ''
                };
                if (pTag.length >= 2) {
                    participant.role = pTag[pTag.length - 1];
                }

                parsed.participants.push(participant);
            }
        }
    }
    return parsed;
}

export function parseCalendarListEvent(eventJson: any) {
    const parsed = {
        id: eventJson.id,
        pubkey: eventJson.pubkey,
        createdAt: eventJson.created_at,
        kind: eventJson.kind,
        d: "",
        title: '',
        a: Array<string>(),
    };

    if (!eventJson.tags || !Array.isArray(eventJson.tags)) {
        return parsed;
    }

    const tagMap = new Map<string, any>();
    for (const tag of eventJson.tags) {
        const key = tag[0];
        const value = tag.slice(1);

        if (tagMap.has(key)) {
            const existing = tagMap.get(key);
            if (Array.isArray(existing[0])) {
                tagMap.set(key, [...existing, value]);
            } else {
                tagMap.set(key, [existing, value]);
            }
        } else {
            tagMap.set(key, value);
        }
    }

    parsed.d = tagMap.get('d')?.[0] || '';
    parsed.title = tagMap.get('title')?.[0] || 'Untitled Calendar';

    const aTagData = tagMap.get('a');
    if (aTagData) {
        const aTagsArray = (aTagData.length > 0 && Array.isArray(aTagData[0]))
            ? aTagData
            : [aTagData];

        for (const aTag of aTagsArray) {
            if (aTag && aTag[0]) {
                parsed.a.push(aTag[0]);
            }
        }
    }

    return parsed;
}
export function parseRSVPEvent(eventJson: any) {
    const parsed = {
        id: eventJson.id,
        pubkey: eventJson.pubkey,
        createdAt: eventJson.created_at,
        kind: eventJson.kind,
        content: eventJson.content,
        e: '',
        a: '',
        d: "",
        status: '',
        fb: '',
        p: ''
    };

    const tagMap = new Map();
    for (const tag of eventJson.tags) {
        const [key, value] = tag;
        if (tagMap.has(key)) {
            const existing = tagMap.get(key);
            if (Array.isArray(existing)) {
                existing.push(value);
            } else {
                tagMap.set(key, [existing, value]);
            }
        } else {
            tagMap.set(key, value);
        }
    }

    parsed.e = tagMap.get('e') || '';
    parsed.a = tagMap.get('a') || '';
    parsed.status = tagMap.get('status') || '';
    parsed.fb = tagMap.get('fb') || '';
    parsed.p = tagMap.get('p') || '';
    parsed.d = tagMap.get('d') || '';

    return parsed;
}

export const getSHA256Hash = async (input: string) => {
    const textAsBuffer = new TextEncoder().encode(input);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray
        .map((item) => item.toString(16).padStart(2, "0"))
        .join("");
    return hash;
};