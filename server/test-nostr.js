require('dotenv').config();
global.WebSocket = require('ws');

const {
  Relay,
  finalizeEvent,
  getPublicKey,
} = require('nostr-tools');

const sk = process.env.NOSTR_SECRET_KEY;
const pk = getPublicKey(sk);
const relayUrl = 'wss://relay.snort.social';

const connectToRelay = async () => {
  const relay = new Relay(relayUrl);
  await relay.connect();
  return relay;
};

const publishBountyToNostr = async () => {
  try {
    const relay = await connectToRelay();

    const unsignedEvent = {
      kind: 1,
      pubkey: pk,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: "🚀 Hello Nostr from Node.js!",
    };

    const signedEvent = finalizeEvent(unsignedEvent, sk); // ✅ Use finalizeEvent
    console.log("🧾 Final Signed Event:", signedEvent);

    const success = await relay.publish(signedEvent);
    console.log("📡 Relay publish result:", success);

    if (success) {
      console.log("✅ Successfully posted to Nostr:", signedEvent.id);
    } else {
      console.error("❌ Relay rejected event");
    }
  } catch (err) {
    console.error("❌ Error publishing to Nostr:", err);
  }
};

publishBountyToNostr();
