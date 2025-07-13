import {
  SimplePool,
  nip04,
  getPublicKey,
  Relay,
  finalizeEvent,
} from "nostr-tools";

// Utility: hex string to Uint8Array
function hexToBytes(hex) {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Utility to parse NWC URI
function parseNwcUri(uri) {
  // Example: nostr+walletconnect://<walletPubkey>?relay=wss://relay.example.com&secret=<hex>
  const url = new URL(uri.replace("nostr+walletconnect://", "http://"));
  const walletPubkey = url.pathname.replace("/", "");
  const relay = url.searchParams.get("relay");
  const secret = url.searchParams.get("secret");
  return { walletPubkey, relay, secret };
}

// Get lightning address from user profile
export const getLightningAddress = async (pubkey) => {
  const relays = [
    "wss://nostr-01.yakihonne.com",
    "wss://nostr-02.yakihonne.com",
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
  ];

  const pool = new SimplePool();

  for (const relay of relays) {
    const ev = await pool.get([relay], {
      kinds: [0],
      authors: [pubkey],
      limit: 1,
    });

    if (ev) {
      try {
        const content = JSON.parse(ev.content);
        if (content.lud16) return content.lud16;
        if (content.lud06) return content.lud06;
      } catch (error) {
        console.error("Error parsing profile content:", error);
      }
    }
  }

  return null;
};

// Build and sign a NIP-57 zap request (kind 9734)
export const buildZapRequest = async (
  senderPubkey,
  recipientPubkey,
  lnurl,
  amountMsat,
  relays = [],
  content = ""
) => {
  try {
    const event = {
      kind: 9734,
      content: content,
      created_at: Math.floor(Date.now() / 1000),
      pubkey: senderPubkey,
      tags: [
        ["relays", ...relays],
        ["amount", amountMsat.toString()],
        ["lnurl", lnurl],
        ["p", recipientPubkey],
      ],
    };

    // If we have window.nostr (NIP-07) ask it to sign.
    if (
      typeof window !== "undefined" &&
      window.nostr &&
      window.nostr.signEvent
    ) {
      const signed = await window.nostr.signEvent(event);
      return encodeURIComponent(JSON.stringify(signed));
    }

    // Otherwise we can only proceed if we somehow have sender's secret (not recommended in browser).
    return null;
  } catch (err) {
    console.error("Failed to build zap request", err);
    return null;
  }
};

// Fetch LNURL invoice from lightning address
export const fetchLnurlInvoice = async (
  lnAddress,
  amount,
  description = "",
  senderPubkey = null
) => {
  let lnurl;

  if (lnAddress.includes("@")) {
    const [name, domain] = lnAddress.split("@");
    lnurl = `https://${domain}/.well-known/lnurlp/${name}`;
  } else if (lnAddress.startsWith("lnurl1")) {
    // lnurl is bech32 encoded, decode if needed (not implemented here)
    return null;
  } else {
    return null;
  }

  try {
    // Step 1: Get LNURL pay info
    const res = await fetch(lnurl);
    const data = await res.json();

    if (!data.callback) return null;

    // Step 2: Request invoice
    const amountMsat = amount * 1000; // Convert sats to msats
    let callbackUrl = `${data.callback}${
      data.callback.includes("?") ? "&" : "?"
    }amount=${amountMsat}`;

    // If server allows zap requests build one
    if (data.allowsNostr && data.nostrPubkey && senderPubkey) {
      // Dynamically import relay list to avoid circular dep
      const relaysModule = await import("../Content/Relays.js");
      const relays = relaysModule.default || [];

      const zapReq = await buildZapRequest(
        senderPubkey,
        data.nostrPubkey,
        lnurl,
        amountMsat,
        relays,
        description
      );

      if (zapReq) {
        callbackUrl += `&nostr=${zapReq}&lnurl=${encodeURIComponent(lnurl)}`;
      }
    }

    if (description) {
      callbackUrl += `&comment=${encodeURIComponent(description)}`;
    }

    const invoiceRes = await fetch(callbackUrl);
    const invoiceData = await invoiceRes.json();

    return {
      invoice: invoiceData.pr || null,
      minSendable: data.minSendable / 1000, // Convert to sats
      maxSendable: data.maxSendable / 1000, // Convert to sats
      metadata: data.metadata,
      description: description,
    };
  } catch (error) {
    console.error("Error fetching LNURL invoice:", error);
    return null;
  }
};

// Send NWC payment
export const sendNwcPayment = async (
  userMetadata,
  invoice,
  amount,
  description = ""
) => {
  const nwcUri = userMetadata?.nwc_uri;
  if (!nwcUri) {
    throw new Error("No NWC configuration found. Please connect a wallet.");
  }

  const nwcConfig = parseNwcUri(nwcUri);
  const { walletPubkey, relay, secret } = nwcConfig;

  if (!walletPubkey || !relay || !secret) {
    throw new Error("Invalid NWC configuration");
  }

  try {
    // Prepare payment request
    const privkey = hexToBytes(secret);
    const pubkey = getPublicKey(privkey);

    const content = JSON.stringify({
      method: "pay_invoice",
      params: {
        invoice,
        amount: amount * 1000, // Convert to msats
      },
    });

    const encryptedContent = await nip04.encrypt(
      privkey,
      walletPubkey,
      content
    );

    const event = {
      kind: 23194, // NWC request kind
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", walletPubkey]],
      content: encryptedContent,
    };

    const finalizedEvent = finalizeEvent(event, privkey);

    // Connect to relay and send payment
    const relayConn = new Relay(relay);
    await relayConn.connect();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        relayConn.close();
        reject(new Error("Payment request timed out"));
      }, 30000); // 30 second timeout

      relayConn.subscribe(
        [
          {
            kinds: [23195], // NWC response kind
            authors: [walletPubkey],
            "#p": [pubkey],
          },
        ],
        {
          onevent: async (ev) => {
            clearTimeout(timeout);
            relayConn.close();

            try {
              const decrypted = await nip04.decrypt(
                privkey,
                walletPubkey,
                ev.content
              );
              const response = JSON.parse(decrypted);

              if (response.error) {
                reject(new Error(response.error.message || "Payment failed"));
              } else {
                resolve({
                  success: true,
                  preimage: response.result?.preimage,
                  paymentHash: response.result?.payment_hash,
                  description,
                  amount,
                });
              }
            } catch (error) {
              reject(new Error("Failed to decrypt payment response"));
            }
          },
        }
      );

      // Send the payment request
      relayConn.publish(finalizedEvent);
    });
  } catch (error) {
    console.error("NWC payment error:", error);
    throw new Error(`Payment failed: ${error.message}`);
  }
};

// Generate invoice for habit staking
export const generateStakingInvoice = async (userPubkey, amount, habitName) => {
  try {
    const lnAddress = await getLightningAddress(userPubkey);
    if (!lnAddress) {
      throw new Error(
        "No lightning address found. Please add one to your Nostr profile."
      );
    }

    const description = `Staking ${amount} sats for habit: ${habitName}`;
    const invoiceData = await fetchLnurlInvoice(
      lnAddress,
      amount,
      description,
      userPubkey
    );

    if (!invoiceData || !invoiceData.invoice) {
      throw new Error("Failed to generate staking invoice");
    }

    return {
      ...invoiceData,
      purpose: "staking",
      habitName,
      amount,
    };
  } catch (error) {
    console.error("Error generating staking invoice:", error);
    throw error;
  }
};

// Pay habit staking
export const payHabitStaking = async (userMetadata, amount, habitName) => {
  try {
    // For staking, we could use a dedicated staking service or escrow
    // For now, we'll simulate the staking by creating a payment record
    const description = `Staking ${amount} sats for habit: ${habitName}`;

    // In a real implementation, you would:
    // 1. Generate invoice from escrow service
    // 2. Pay the invoice via NWC
    // 3. Return staking confirmation

    // For demo, we'll just return a simulated staking result
    return {
      success: true,
      stakingId: `stake_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      amount,
      habitName,
      description,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error paying habit staking:", error);
    throw error;
  }
};

// Process habit reward payment
export const processHabitReward = async (
  userMetadata,
  userPubkey,
  amount,
  habitName,
  streakDays
) => {
  try {
    const lnAddress = await getLightningAddress(userPubkey);
    if (!lnAddress) {
      throw new Error("No lightning address found for reward payment");
    }

    const description = `Habit reward: ${amount} sats for ${habitName} (${streakDays} day streak)`;
    const invoiceData = await fetchLnurlInvoice(
      lnAddress,
      amount,
      description,
      userPubkey
    );

    if (!invoiceData || !invoiceData.invoice) {
      throw new Error("Failed to generate reward invoice");
    }

    // Pay the reward via NWC
    const paymentResult = await sendNwcPayment(
      userMetadata,
      invoiceData.invoice,
      amount,
      description
    );

    return {
      ...paymentResult,
      purpose: "reward",
      habitName,
      streakDays,
      rewardAmount: amount,
    };
  } catch (error) {
    console.error("Error processing habit reward:", error);
    throw error;
  }
};

// Check wallet connection
export const checkWalletConnection = (userMetadata) => {
  // Check for NWC URI (for sending payments)
  const nwcUri = userMetadata?.nwc_uri;
  if (nwcUri) {
    try {
      const nwcConfig = parseNwcUri(nwcUri);
      return !!(nwcConfig.walletPubkey && nwcConfig.relay && nwcConfig.secret);
    } catch {
      // Fall through to check lightning address
    }
  }

  // Check for lightning address (for receiving payments)
  const lightningAddress = userMetadata?.lud16 || userMetadata?.lud06;
  if (lightningAddress) {
    return true;
  }

  return false;
};

// Get wallet info
export const getWalletInfo = (userMetadata) => {
  // First check for NWC URI
  const nwcUri = userMetadata?.nwc_uri;
  if (nwcUri) {
    try {
      const nwcConfig = parseNwcUri(nwcUri);
      return {
        connected: !!(
          nwcConfig.walletPubkey &&
          nwcConfig.relay &&
          nwcConfig.secret
        ),
        walletPubkey: nwcConfig.walletPubkey,
        relay: nwcConfig.relay,
        type: "nwc",
      };
    } catch {
      // Fall through to check lightning address
    }
  }

  // Check for lightning address
  const lightningAddress = userMetadata?.lud16 || userMetadata?.lud06;
  if (lightningAddress) {
    return {
      connected: true,
      lightningAddress: lightningAddress,
      type: "lightning_address",
    };
  }

  return null;
};
