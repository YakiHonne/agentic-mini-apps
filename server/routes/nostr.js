global.WebSocket = require('ws'); // Required for nostr-tools in Node.js

const {
  Relay,
  finalizeEvent,
  getPublicKey,
  generateSecretKey
} = require('nostr-tools');

// Generate a static keypair on startup
const sk = generateSecretKey();
const pk = getPublicKey(sk);

// Log for debug
console.log("🔑 Private Key:", Buffer.from(sk).toString('hex'));
console.log("🧷 Public Key:", pk);

// Multiple public relays to try
const relayUrls = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social'
];

// Try connecting to relays in order
const connectToRelay = async () => {
  for (const url of relayUrls) {
    try {
      const relay = new Relay(url);
      await relay.connect();

      // Optional: log notices from the relay
      relay.on('notice', (msg) => {
        console.warn('📢 Relay Notice:', msg);
      });

      console.log(`✅ Connected to ${url}`);
      return relay;
    } catch (err) {
      console.warn(`⚠️ Could not connect to ${url}:`, err.message);
    }
  }

  throw new Error('❌ All relays failed to connect');
};

// Publish bounty data to nostr
const publishBountyToNostr = async (bountyData) => {
  const relay = await connectToRelay();

  // Make content a human-readable string (not JSON)
  const content = `🚀 New Bounty Posted!
Title: ${bountyData.title}
City: ${bountyData.city}
Reward: ${bountyData.reward}
Description: ${bountyData.description}`;

  const event = {
    kind: 1, // Kind 1 is standard for simple text notes
    pubkey: pk,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: content
  };

  const signedEvent = finalizeEvent(event, sk);
  const success = await relay.publish(signedEvent);

  if (success) {
    console.log("✅ Published to Nostr");
    return { success: true, event: signedEvent };
  } else {
    console.error("❌ Relay rejected event");
    return { success: false, reason: "Relay rejected event" };
  }
};

// Export the function for use in routes
module.exports = {
  publishBountyToNostr
};
