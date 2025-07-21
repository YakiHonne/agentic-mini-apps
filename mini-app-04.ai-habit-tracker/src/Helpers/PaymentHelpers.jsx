import { SimplePool, nip04, getPublicKey, Relay } from "nostr-tools";
import SWHandler from "smart-widget-handler";
import { claimReward } from "./BackendAPI.js";

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

// Build and sign a NIP-57 zap request (kind 9734) using SMHandler
export const buildZapRequest = async (
  senderPubkey,
  recipientPubkey,
  lnurl,
  amountMsat,
  relays = [],
  content = "",
  hostUrl = null
) => {
  try {
    const event = {
      kind: 9734,
      content: content,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["relays", ...relays],
        ["amount", amountMsat.toString()],
        ["lnurl", lnurl],
        ["p", recipientPubkey],
      ],
    };

    // Use SMHandler.client for signing if hostUrl is available
    if (hostUrl && SWHandler?.client?.requestEventSign) {
      try {
        const signed = await SWHandler.client.requestEventSign(event, hostUrl);
        return encodeURIComponent(JSON.stringify(signed));
      } catch (error) {
        console.error("SWHandler signing failed:", error);
        // Fall back to window.nostr if available
      }
    }

    // Fallback to window.nostr (NIP-07) if SWHandler fails
    if (
      typeof window !== "undefined" &&
      window.nostr &&
      window.nostr.signEvent
    ) {
      const signed = await window.nostr.signEvent(event);
      return encodeURIComponent(JSON.stringify(signed));
    }

    // If no signing method available, return null
    console.warn("No signing method available for zap request");
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
  senderPubkey = null,
  hostUrl = null
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
        description,
        hostUrl
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

// Send NWC payment using SMHandler for signing
export const sendNwcPayment = async (
  userMetadata,
  invoice,
  amount,
  description = "",
  hostUrl = null
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

    // Try to use SWHandler for signing first
    let finalizedEvent;
    if (hostUrl && SWHandler?.client?.requestEventSign) {
      try {
        finalizedEvent = await SWHandler.client.requestEventSign(
          event,
          hostUrl
        );
      } catch (error) {
        console.error(
          "SWHandler signing failed, falling back to manual signing:",
          error
        );
        // Fall back to manual signing with nostr-tools
        const { finalizeEvent } = await import("nostr-tools");
        finalizedEvent = finalizeEvent(event, privkey);
      }
    } else {
      // Fall back to manual signing with nostr-tools
      const { finalizeEvent } = await import("nostr-tools");
      finalizedEvent = finalizeEvent(event, privkey);
    }

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
export const generateStakingInvoice = async (
  userPubkey,
  amount,
  habitName,
  hostUrl = null
) => {
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
      userPubkey,
      hostUrl
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
export const payHabitStaking = async (
  userMetadata,
  amount,
  habitName,
  hostUrl = null
) => {
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
  streakDays,
  hostUrl = null
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
      userPubkey,
      hostUrl
    );

    if (!invoiceData || !invoiceData.invoice) {
      throw new Error("Failed to generate reward invoice");
    }

    // Pay the reward via NWC
    const paymentResult = await sendNwcPayment(
      userMetadata,
      invoiceData.invoice,
      amount,
      description,
      hostUrl
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

// New function to request payment using SWHandler
export const requestPayment = async (paymentRequest, hostUrl) => {
  try {
    if (!SWHandler?.client?.requestPayment) {
      throw new Error("SWHandler payment request not available");
    }

    const result = await SWHandler.client.requestPayment(
      paymentRequest,
      hostUrl
    );
    return result;
  } catch (error) {
    console.error("Payment request failed:", error);
    throw error;
  }
};

// New function to send payment response using SWHandler
export const sendPaymentResponse = async (
  paymentResponse,
  widgetUrl,
  iframeElement
) => {
  try {
    if (!SWHandler?.host?.sendPaymentResponse) {
      throw new Error("SWHandler payment response not available");
    }

    await SWHandler.host.sendPaymentResponse(
      paymentResponse,
      widgetUrl,
      iframeElement
    );
    return true;
  } catch (error) {
    console.error("Payment response failed:", error);
    throw error;
  }
};

// Updated function to request ZAP payment using SWHandler
export const requestZapPayment = async (
  recipientPubkey,
  amount,
  content = "",
  relays = [],
  hostUrl = null
) => {
  try {
    // Get recipient's lightning address
    const lnAddress = await getLightningAddress(recipientPubkey);
    if (!lnAddress) {
      throw new Error("Recipient has no lightning address");
    }

    // Build zap request
    const zapRequest = await buildZapRequest(
      null, // We'll let SWHandler handle the signing
      recipientPubkey,
      lnAddress,
      amount * 1000, // Convert to msats
      relays,
      content,
      hostUrl
    );

    if (!zapRequest) {
      throw new Error("Failed to build zap request");
    }

    // Create payment request for SWHandler
    const paymentRequest = {
      address: lnAddress,
      amount: amount,
      nostrPubkey: recipientPubkey,
      nostrEventIDEncode: zapRequest,
    };

    // Request payment through SWHandler
    const result = await requestPayment(paymentRequest, hostUrl);
    return result;
  } catch (error) {
    console.error("ZAP payment request failed:", error);
    throw error;
  }
};

// Updated function to handle habit staking with SWHandler
export const stakeHabitWithSWHandler = async (
  userPubkey,
  amount,
  habitName,
  hostUrl = null
) => {
  try {
    // Get user's lightning address
    const lnAddress = await getLightningAddress(userPubkey);
    if (!lnAddress) {
      throw new Error("User has no lightning address for staking");
    }

    // Create payment request for staking
    const paymentRequest = {
      address: lnAddress,
      amount: amount,
      nostrPubkey: userPubkey,
    };

    // Request payment through SWHandler
    const result = await requestPayment(paymentRequest, hostUrl);
    return {
      success: true,
      purpose: "staking",
      habitName,
      amount,
      paymentMethod: "swhandler",
      result,
    };
  } catch (error) {
    console.error("Habit staking failed:", error);
    throw error;
  }
};

// Updated function to handle habit rewards with SWHandler
export const rewardHabitWithSWHandler = async (
  userPubkey,
  amount,
  habitName,
  streakDays,
  hostUrl = null
) => {
  try {
    // Get user's lightning address
    const lnAddress = await getLightningAddress(userPubkey);
    if (!lnAddress) {
      throw new Error("User has no lightning address for reward");
    }

    // Create payment request for reward
    const paymentRequest = {
      address: lnAddress,
      amount: amount,
      nostrPubkey: userPubkey,
    };

    // Request payment through SWHandler
    const result = await requestPayment(paymentRequest, hostUrl);
    return {
      success: true,
      purpose: "reward",
      habitName,
      streakDays,
      rewardAmount: amount,
      paymentMethod: "swhandler",
      result,
    };
  } catch (error) {
    console.error("Habit reward failed:", error);
    throw error;
  }
};

// Function to handle payment response from SWHandler
export const handlePaymentResponse = async (
  paymentResponse,
  widgetUrl,
  iframeElement
) => {
  try {
    // Send payment response back to the widget
    await sendPaymentResponse(paymentResponse, widgetUrl, iframeElement);

    // Log the response for debugging
    console.log("Payment response sent:", paymentResponse);

    return true;
  } catch (error) {
    console.error("Failed to send payment response:", error);
    throw error;
  }
};

// Example function to handle successful payment
export const handleSuccessfulPayment = async (
  preImage,
  widgetUrl,
  iframeElement
) => {
  const paymentResponse = {
    status: true,
    preImage: preImage,
  };

  return await handlePaymentResponse(paymentResponse, widgetUrl, iframeElement);
};

// Example function to handle failed payment
export const handleFailedPayment = async (error, widgetUrl, iframeElement) => {
  const paymentResponse = {
    status: false,
    error: error.message || "Payment failed",
  };

  return await handlePaymentResponse(paymentResponse, widgetUrl, iframeElement);
};

// Function to create a lightning invoice payment request
export const createLightningPaymentRequest = (
  address,
  amount,
  nostrPubkey = null,
  nostrEventIDEncode = null
) => {
  return {
    address: address, // Lightning address, LNURL, or BOLT11 invoice
    amount: amount, // sats (ignored if address is a BOLT11 invoice)
    nostrPubkey: nostrPubkey, // optional
    nostrEventIDEncode: nostrEventIDEncode, // optional
  };
};

// Function to create a ZAP payment request
export const createZapPaymentRequest = async (
  recipientPubkey,
  amount,
  content = "",
  relays = []
) => {
  try {
    // Get recipient's lightning address
    const lnAddress = await getLightningAddress(recipientPubkey);
    if (!lnAddress) {
      throw new Error("Recipient has no lightning address");
    }

    // Build zap request
    const zapRequest = await buildZapRequest(
      null, // We'll let SWHandler handle the signing
      recipientPubkey,
      lnAddress,
      amount * 1000, // Convert to msats
      relays,
      content
    );

    if (!zapRequest) {
      throw new Error("Failed to build zap request");
    }

    return {
      address: lnAddress,
      amount: amount,
      nostrPubkey: recipientPubkey,
      nostrEventIDEncode: zapRequest,
    };
  } catch (error) {
    console.error("Failed to create ZAP payment request:", error);
    throw error;
  }
};

// New function to get user wallet address from SWHandler (if available)
export const getUserWalletAddress = async (userData, hostUrl = null) => {
  try {
    // First try to get from user metadata (existing method)
    const lnAddress = userData?.lud16 || userData?.lud06;
    if (lnAddress) {
      return lnAddress;
    }

    // Try to get from Nostr profile (existing method)
    if (userData?.pubkey) {
      const profileLnAddress = await getLightningAddress(userData.pubkey);
      if (profileLnAddress) {
        return profileLnAddress;
      }
    }

    // TODO: If SWHandler adds getUserWallet method in future
    // if (hostUrl && SWHandler?.client?.getUserWallet) {
    //   try {
    //     const walletInfo = await SWHandler.client.getUserWallet(hostUrl);
    //     return walletInfo?.lightningAddress || walletInfo?.address;
    //   } catch (error) {
    //     console.log("SWHandler getUserWallet not available:", error);
    //   }
    // }

    return null;
  } catch (error) {
    console.error("Failed to get user wallet address:", error);
    return null;
  }
};

// New function for centralized reward system (no wallet signing required)
export const sendCentralizedReward = async (
  userPubkey,
  amount, // now this is the actual reward amount to send
  habitName,
  totalHabitDays,
  hostUrl = null
) => {
  try {
    // Get user's lightning address
    const userLnAddress = await getUserWalletAddress(
      { pubkey: userPubkey },
      hostUrl
    );
    if (!userLnAddress) {
      throw new Error("User has no lightning address for reward");
    }

    // Use backend API for reward claim
    const result = await claimReward({
      walletAddress: userLnAddress,
      amount, // use directly
      habitName,
      userPubkey,
    });

    return {
      success: result.success,
      purpose: "centralized_reward",
      habitName,
      totalHabitDays,
      amount,
      userLightningAddress: userLnAddress,
      paymentMethod: "centralized_custodian",
      result,
    };
  } catch (error) {
    console.error("Centralized reward failed:", error);
    throw error;
  }
};

// New function for centralized staking (no wallet signing required)
export const processCentralizedStaking = async (
  userPubkey,
  amount,
  habitName,
  hostUrl = null
) => {
  try {
    // Get user's lightning address
    const userLnAddress = await getUserWalletAddress(
      { pubkey: userPubkey },
      hostUrl
    );
    if (!userLnAddress) {
      throw new Error("User has no lightning address for staking");
    }

    // For centralized staking, we create a record but don't require user payment
    // The custodian wallet handles the staking
    const stakingRecord = {
      stakingId: `stake_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      userPubkey,
      userLightningAddress: userLnAddress,
      amount,
      habitName,
      timestamp: new Date().toISOString(),
      status: "active",
    };

    return {
      success: true,
      purpose: "centralized_staking",
      habitName,
      amount,
      stakingRecord,
      paymentMethod: "centralized_custodian",
    };
  } catch (error) {
    console.error("Centralized staking failed:", error);
    throw error;
  }
};

// Function to calculate daily reward amount based on habit formation system
export const calculateDailyRewardAmount = (
  stakedAmount,
  currentDay,
  currentStreak
) => {
  // Base reward calculation using percentage system (same as sendCentralizedReward)
  let baseReward;
  if (stakedAmount === 0) {
    baseReward = 30; // Default reward for non-staked habits
  } else {
    // Use percentage-based system like sendCentralizedReward
    let rewardPercentage;
    if (currentDay === 1) {
      // Day 1: 50% of staked amount
      rewardPercentage = 0.5;
    } else if (currentDay >= 7) {
      // 7+ days: 100% of staked amount
      rewardPercentage = 1.0;
    } else {
      // 2-6 days: Gradual increase from 60% to 90%
      rewardPercentage = 0.6 + (currentDay - 2) * 0.075; // 60% + 7.5% per day
    }
    baseReward = Math.floor(stakedAmount * rewardPercentage);
  }

  // Streak bonus calculation (extra reward for maintaining consecutive days)
  let streakBonus = 0;
  if (currentStreak >= 7) {
    streakBonus = Math.floor(baseReward * 0.1); // 10% bonus for 7+ day streak
  } else if (currentStreak >= 3) {
    streakBonus = Math.floor(baseReward * 0.05); // 5% bonus for 3+ day streak
  }

  const totalReward = baseReward + streakBonus;

  return {
    baseReward,
    streakBonus,
    totalReward,
    rewardPercentage:
      stakedAmount > 0 ? Math.round((baseReward / stakedAmount) * 100) : 0,
    streakLevel:
      currentStreak >= 7 ? "high" : currentStreak >= 3 ? "medium" : "none",
  };
};

// Function to calculate reward amount based on total habit days (legacy for existing rewards)
export const calculateRewardAmount = (stakedAmount, totalHabitDays) => {
  // Use the new daily reward system
  const rewardInfo = calculateDailyRewardAmount(
    stakedAmount,
    totalHabitDays,
    totalHabitDays
  );
  return rewardInfo.totalReward;
};

// Function to check if habit is completed (30-31 days)
export const isHabitCompleted = (totalCompletions) => {
  return totalCompletions >= 30;
};

// Function to get habit completion status
export const getHabitCompletionStatus = (totalCompletions) => {
  const HABIT_FORMATION_DAYS = 30;

  if (totalCompletions >= HABIT_FORMATION_DAYS) {
    return {
      status: "completed",
      message:
        "🎉 Habit formed! You've successfully completed your 30-day journey!",
      progress: 100,
      daysRemaining: 0,
    };
  }

  return {
    status: "active",
    message: `${
      HABIT_FORMATION_DAYS - totalCompletions
    } days left to form this habit`,
    progress: Math.round((totalCompletions / HABIT_FORMATION_DAYS) * 100),
    daysRemaining: HABIT_FORMATION_DAYS - totalCompletions,
  };
};

// Function to check if user can check-in today
export const canCheckInToday = (lastCompletedAt) => {
  if (!lastCompletedAt) return true;

  const today = new Date().toDateString();
  const lastCompleted = new Date(lastCompletedAt).toDateString();

  return today !== lastCompleted; // Can only check-in once per day
};

// Function to calculate streak status (consecutive days)
export const calculateStreakStatus = (lastCompletedAt, currentStreak) => {
  if (!lastCompletedAt) {
    return { isConsecutive: true, streakBroken: false };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastCompleted = new Date(lastCompletedAt);
  const lastCompletedDate = lastCompleted.toDateString();
  const yesterdayDate = yesterday.toDateString();

  // Check if last completion was yesterday (maintaining streak)
  const isConsecutive = lastCompletedDate === yesterdayDate;
  const streakBroken = !isConsecutive && currentStreak > 0;

  return { isConsecutive, streakBroken };
};

// Function to get reward percentage for display
export const getRewardPercentage = (totalHabitDays) => {
  if (totalHabitDays === 1) return 50;
  if (totalHabitDays >= 7) return 100;
  return Math.round((0.6 + (totalHabitDays - 2) * 0.075) * 100);
};

// New function for habit creation with SWHandler payment request
export const createHabitWithPayment = async (
  userPubkey,
  amount,
  habitName,
  hostUrl,
  onPaymentSuccess,
  onPaymentTimeout
) => {
  try {
    // Use the provided staking service address
    const stakingServiceAddress = "zapmindr@wallet.yakihonne.com";

    // Create payment request for SWHandler
    const paymentRequest = {
      address: stakingServiceAddress,
      amount: amount,
      nostrPubkey: userPubkey,
    };

    console.log("Creating payment request:", paymentRequest);

    // Request payment via SWHandler
    SWHandler.client.requestPayment(paymentRequest, hostUrl);
    console.log("Payment request sent via SWHandler");

    // Track payment completion to prevent double habit creation
    let paymentCompleted = false;

    // Set up payment response listener
    const paymentResponseHandler = (event) => {
      console.log("Payment event received:", event.data);

      // Handle the actual response format from SWHandler
      if (event.data && event.data.kind === "payment-response") {
        const paymentData = event.data.data;
        console.log("Payment response:", paymentData);

        if (paymentData.status === true && !paymentCompleted) {
          // Payment successful
          paymentCompleted = true;
          console.log("Payment successful, calling onPaymentSuccess");

          // Clear the timeout to prevent creating habit without stake
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          onPaymentSuccess({
            success: true,
            purpose: "habit_creation",
            habitName,
            amount,
            preImage: paymentData.preImage,
            paymentMethod: "swhandler",
          });

          window.removeEventListener("message", paymentResponseHandler);
        } else if (!paymentCompleted) {
          // Payment failed but don't show error immediately
          // Let the 30-second timer complete first for non-staked option
          console.log(
            "Payment failed with status:",
            paymentData.status,
            "but waiting for timeout to show options"
          );
        }
      } else {
        console.log("Event received but not payment-response:", event.data);
      }
    };

    // Listen for payment response
    window.addEventListener("message", paymentResponseHandler);

    // Set timeout for payment (30 seconds for non-staked option)
    const timeoutId = setTimeout(() => {
      window.removeEventListener("message", paymentResponseHandler);

      // Only call timeout if payment hasn't been completed
      if (!paymentCompleted && onPaymentTimeout) {
        paymentCompleted = true; // Prevent any further processing
        onPaymentTimeout({
          success: false,
          purpose: "habit_creation",
          habitName,
          amount,
          error: "Payment timeout",
          paymentMethod: "swhandler",
        });
      }
    }, 30000); // Changed from 10000 to 30000 (30 seconds)

    return {
      success: true,
      purpose: "payment_request_sent",
      habitName,
      amount,
      paymentMethod: "swhandler",
    };
  } catch (error) {
    console.error("Habit creation with payment failed:", error);
    throw error;
  }
};

// Function to send payment response back to SWHandler
export const sendSWHandlerPaymentResponse = (
  paymentResponse,
  targetOrigin,
  iframeElement
) => {
  try {
    SWHandler.host.sendPaymentResponse(
      paymentResponse,
      targetOrigin,
      iframeElement
    );
    return true;
  } catch (error) {
    console.error("Failed to send payment response:", error);
    throw error;
  }
};
