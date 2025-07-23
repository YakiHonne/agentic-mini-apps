// utils/nostr.js
const {
  Relay,
  getPublicKey,
  signEvent,
  getEventHash,
  generateSecretKey,
} = require('nostr-tools');

const relayUrl = 'wss://relay.damus.io';

const sk = generateSecretKey();
const pk = getPublicKey(sk);

const connectToRelay = async () => {
  const relay = new Relay(relayUrl);
  await relay.connect();
  return relay;
};

const publishToNostr = async (bountyData) => {
  const relay = await connectToRelay();

  const event = {
    kind: 30000,
    pubkey: pk,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', 'bounty'], ['city', bountyData.city || '']],
    content: JSON.stringify(bountyData),
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, sk);

  const pub = relay.publish(event);

  return new Promise((resolve, reject) => {
    pub.on('ok', () => resolve(event));
    pub.on('failed', (reason) => reject(new Error(reason)));
  });
};

module.exports = { publishToNostr };
