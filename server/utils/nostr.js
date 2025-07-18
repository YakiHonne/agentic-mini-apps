global.WebSocket = require('ws');
require('dotenv').config();

const { Relay, finalizeEvent, getPublicKey, nip19, verifyEvent } = require('nostr-tools');
const { hexToBytes } = require('@noble/hashes/utils');

// ===== Load Private Key =====
let sk;
try {
  const key = process.env.NOSTR_SECRET_KEY.trim();
  sk = key.startsWith('nsec') ? hexToBytes(nip19.decode(key).data) : hexToBytes(key);
} catch (e) {
  console.error("❌ Invalid NOSTR_SECRET_KEY in .env");
  process.exit(1);
}

const pk = getPublicKey(sk);
console.log("🧷 Public Key:", pk);
console.log("🔑 Private Key:", Buffer.from(sk).toString('hex'));

// ===== List of Recommended Open Relays =====
const relayUrls = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://nostr.oxtr.dev',
  'wss://relayable.org',
  'wss://nostr-pub.wellorder.net'
];

// ===== Connect to Relays =====
const connectToRelays = async () => {
  const connected = [];
  for (const url of relayUrls) {
    try {
      const relay = new Relay(url);
      await relay.connect();
      await relay.ensureConnected?.(); // optional chaining in case method is missing
      console.log(`✅ Connected to ${url}`);
      connected.push(relay);
    } catch (err) {
      console.warn(`⚠️ Could not connect to ${url}: ${err.message}`);
    }
  }
  return connected;
};

// ===== Publish to Nostr =====
const publishBountyToNostr = async (bounty) => {
  const relays = await connectToRelays();

  const content = `🚀 Bounty: ${bounty.title} in ${bounty.city}. Reward: ${bounty.reward}. ${bounty.description}`;

  const event = {
    kind: 1,
    pubkey: pk,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['t', 'bounty'], ['city', bounty.city.toLowerCase()]],
    content,
  };
  
  
  const signedEvent = finalizeEvent(event, sk);

  if (!verifyEvent(signedEvent)) {
    console.error("❌ Event signature invalid");
    return {
      success: false,
      acceptedRelays: [],
      rejectedRelays: relays.map(r => r.url),
      event: signedEvent
    };
  }

  const acceptedRelays = [];
  const rejectedRelays = [];
  for (const relay of relays) {
    try {
      const result = await relay.publish(signedEvent);
      if (result) {
        console.log(`✅ Relay accepted: ${relay.url}`);
        acceptedRelays.push(relay.url);
      } else {
        console.log(`❌ Relay rejected: ${relay.url}`);
        rejectedRelays.push(relay.url);
      }
    } catch (err) {
      console.log(`⚠️ Error publishing to ${relay.url}: ${err.message}`);
      rejectedRelays.push(relay.url);
    }
  }
  

  // Allow some time for .on() handlers to resolve
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log("🔍 View post on: https://nostr.band/e/" + signedEvent.id);

  return {
    success: acceptedRelays.length > 0,
    acceptedRelays,
    rejectedRelays,
    event: signedEvent,
  };
};

// ===== Example Usage (Run Directly) =====
if (require.main === module) {
  const bounty = {
    title: "GeoSats Beta",
    city: "Nairobi",
    reward: "5000 sats",
    description: "Build a Lightning-powered bounty board with map-based challenges."
  };

  publishBountyToNostr(bounty).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

// ===== Export for use in other files =====
module.exports = {
  publishBountyToNostr
};
