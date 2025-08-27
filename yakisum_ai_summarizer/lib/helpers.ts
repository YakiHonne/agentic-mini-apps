// helpers.ts
// Ported and adapted from the reference curation app's Helpers.jsx
// Core helpers for user info and event fetching (TypeScript-ready)

import ndkInstance from "./ndkInstance";
import { nip19 } from "nostr-tools";
import type { NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

export type Pubkey = string;
export type Event = any; // Use rawEvent() output, which is a plain object

// Get empty user metadata for a given pubkey (reference logic)
export function getEmptyUserMetadata(pubkey: Pubkey) {
  return {
    name: nip19.npubEncode(pubkey).substring(0, 10),
    display_name: nip19.npubEncode(pubkey).substring(0, 10),
    picture: "",
    banner: "",
    about: "",
    lud06: "",
    lud16: "",
    nip05: "",
    website: "",
    pubkey,
    created_at: 0,
  };
}

// Parse author metadata from a Nostr event (reference logic)
export function getParsedAuthor(data: any) {
  let content: Record<string, any> = {};
  try {
    content = JSON.parse(data.content) || {};
  } catch (e) {
    content = {};
  }
  return {
    display_name:
      content?.display_name || content?.name || data.pubkey?.substring(0, 10),
    name:
      content?.name || content?.display_name || data.pubkey?.substring(0, 10),
    picture: content?.picture || "",
    pubkey: data.pubkey,
    banner: content?.banner || "",
    about: content?.about || "",
    lud06: content?.lud06 || "",
    lud16: content?.lud16 || "",
    website: content?.website || "",
    nip05: content?.nip05 || "",
  };
}

// Sort events by created_at descending (reference logic)
export function sortEvents(events: Event[]): Event[] {
  return events.sort((ev1, ev2) => (ev2.created_at ?? 0) - (ev1.created_at ?? 0));
}

// Fetch events from Nostr/NDK (reference logic)
export async function getSubData(filter: NDKFilter[], timeout = 1000, useCache = false): Promise<{ data: Event[]; pubkeys: Pubkey[] }> {
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };

  return new Promise((resolve) => {
    let events: Event[] = [];
    let pubkeys: Pubkey[] = [];

    let filter_ = filter.map((_) => {
      let temp = { ..._ };
      if (!_["#t"]) {
        delete temp["#t"];
        return temp;
      }
      return temp;
    });

    let sub = ndkInstance.subscribe(filter_, {
      cacheUsage: useCache ? NDKSubscriptionCacheUsage.CACHE_FIRST : NDKSubscriptionCacheUsage.ONLY_RELAY,
      groupable: false,
      skipVerification: true,
      skipValidation: true,
    });
    let timer: NodeJS.Timeout | undefined;

    // Set the timer ONCE, right after subscribing
    timer = setTimeout(() => {
      sub.stop();
      resolve({
        data: sortEvents(events),
        pubkeys: Array.from(new Set(pubkeys)),
      });
    }, timeout);

    sub.on("event", (event: any) => {
      pubkeys.push(event.pubkey);
      events.push(event.rawEvent());
    });
  });
} 