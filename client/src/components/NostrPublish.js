// NostrPublish.js
import {
    getPublicKey,
    getEventHash,
    finalizeEvent,
    generateSecretKey,
    Relay
  } from 'nostr-tools';
  
  const relayUrl = "wss://relay.damus.io"; // or use a different relay if needed
  
  // 🔐 Generate a new key pair (hardcoded for demo — store securely in real apps)
  const sk = generateSecretKey(); // secret key (private key)
  const pk = getPublicKey(sk);    // public key
  
  // Connect to a relay
  export const connectToRelay = async () => {
    const relay = Relay(relayUrl);
    await relay.connect();
    return relay;
  };
  
  // Sign and publish an event
  export const signAndPublishEvent = async (relay, sk, eventTemplate) => {
    const event = finalizeEvent(eventTemplate, sk); // signs and hashes the event
    const pub = relay.publish(event);
  
    return new Promise((resolve, reject) => {
      pub.on("ok", () => {
        console.log("✅ Event published successfully");
        resolve(event);
      });
      pub.on("failed", (reason) => {
        console.error("❌ Failed to publish event:", reason);
        reject(reason);
      });
    });
  };
  
  // Main function to use in Dashboard.js
  export const publishToNostr = async (bountyData) => {
    const relay = await connectToRelay();
  
    const eventTemplate = {
      kind: 30000,
      pubkey: pk,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["d", "bounty"], ["city", bountyData.city]],
      content: JSON.stringify(bountyData),
    };
  
    const event = await signAndPublishEvent(relay, sk, eventTemplate);
    console.log("✅ Bounty published to Nostr:", event);
  };
  