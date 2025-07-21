# SWHandler Payment Integration Guide

This guide explains how to use the latest smart-widget-handler payment functionality for lightning payments and ZAP requests in the AI Habit Tracker mini-app.

## SWHandler Import and Setup

First, import SWHandler in your component or helper file:

```javascript
import SWHandler from "smart-widget-handler";
```

## Payment Request Format

Use SWHandler to request payments directly:

```javascript
const paymentRequest = {
  address: "lnbc1...", // or LNURL, or Lightning address
  amount: 1000, // sats (ignored if address is a BOLT11 invoice)
  nostrPubkey: "npub1example...", // optional
  nostrEventIDEncode: "note1example...", // optional
};

SWHandler.client.requestPayment(paymentRequest, "https://myapp.com");
```

## Payment Response Format

Send payment responses back to SWHandler:

```javascript
const paymentResponse = {
  status: true, // true for success, false for error
  preImage: "abcdef123456...", // optional, only for successful payments
};

SWHandler.host.sendPaymentResponse(
  paymentResponse,
  "https://trusted-widget.com",
  iframeElement
);
```

## Payment Flow Overview

### 1. Habit Creation (Staking)

When a user creates a habit, they need to stake sats:

**Flow**: User pays → Centralized lightning node

- User initiates staking payment
- Payment goes to centralized lightning node
- Habit is created and staking is confirmed

### 2. Reward Claims

When a user completes a habit and claims rewards:

**Flow**: Centralized lightning node → User's wallet

- Centralized lightning node automatically sends reward to user's wallet
- No user payment required (rewards are sent TO the user)
- Reward amount based on total habit days and staked amount

## Centralized Reward System

### Reward Structure

The centralized reward system implements a progressive reward structure based on total habit days:

- **Day 1**: 50% of staked amount
- **Days 2-6**: Gradual increase from 60% to 90%
- **Day 7+**: 100% of staked amount

### User Wallet Address Fetching

The system automatically fetches the user's lightning address from:

1. User metadata (lud16/lud06)
2. Nostr profile lookup
3. Future: SWHandler getUserWallet method (when available)

### Reward Calculation

Rewards are calculated based on the total number of days the habit has been active, not just the current streak. This encourages long-term habit formation rather than just maintaining streaks.

## Usage Examples

### 1. Habit Creation with Payment (User pays to centralized node)

```javascript
import { createHabitWithPayment } from "./Helpers/PaymentHelpers";

const handleCreateHabit = async () => {
  try {
    const result = await createHabitWithPayment(
      userPubkey,
      1000, // amount user pays
      "Exercise", // habit name
      hostUrl,
      // Payment success callback
      (paymentResult) => {
        if (paymentResult.success) {
          console.log("Habit created successfully:", paymentResult);
          // Create the habit in your app
          createHabitInApp(habitName, amount);
        } else {
          console.log("Payment failed:", paymentResult.error);
        }
      },
      // Payment timeout callback (10 seconds)
      (timeoutResult) => {
        console.log("Payment timeout:", timeoutResult);
        // Handle timeout - don't create habit
      }
    );
    console.log("Payment request sent:", result);
  } catch (error) {
    console.error("Habit creation failed:", error);
  }
};
```

### 2. Habit Staking (User pays to centralized node)

```javascript
import { processCentralizedStaking } from "./Helpers/PaymentHelpers";

const handleStaking = async () => {
  try {
    const result = await processCentralizedStaking(
      userPubkey,
      1000, // amount user pays
      "Exercise", // habit name
      hostUrl
    );
    console.log("Staking payment initiated:", result);
    // User pays 1000 sats to centralized lightning node
  } catch (error) {
    console.error("Staking payment failed:", error);
  }
};
```

### 3. Reward Claim (Centralized node sends to user)

```javascript
import { sendCentralizedReward } from "./Helpers/PaymentHelpers";

const handleReward = async () => {
  try {
    const result = await sendCentralizedReward(
      userPubkey,
      1000, // original staked amount
      "Exercise", // habit name
      5, // total habit days
      hostUrl
    );
    console.log("Reward sent to user:", result);
    // Centralized node sends 825 sats (82.5% of 1000) to user's wallet
    // Result: { rewardAmount: 825, rewardPercentage: 82.5, ... }
  } catch (error) {
    console.error("Reward failed:", error);
  }
};
```

### 4. Calculate Reward Amount

```javascript
import {
  calculateRewardAmount,
  getRewardPercentage,
} from "./Helpers/PaymentHelpers";

const stakedAmount = 1000;
const totalHabitDays = 5; // Total days habit has been active

const rewardAmount = calculateRewardAmount(stakedAmount, totalHabitDays); // 825 sats
const rewardPercentage = getRewardPercentage(totalHabitDays); // 82.5%
```

### 5. Get User Wallet Address

```javascript
import { getUserWalletAddress } from "./Helpers/PaymentHelpers";

const handleGetWallet = async () => {
  try {
    const walletAddress = await getUserWalletAddress(userData, hostUrl);
    console.log("User wallet address:", walletAddress);
  } catch (error) {
    console.error("Failed to get wallet address:", error);
  }
};
```

### 6. Send Payment Response

```javascript
import { sendSWHandlerPaymentResponse } from "./Helpers/PaymentHelpers";

const handlePaymentResponse = (success, preImage = null) => {
  const paymentResponse = {
    status: success, // true for success, false for error
    preImage: preImage, // optional, only for successful payments
  };

  sendSWHandlerPaymentResponse(
    paymentResponse,
    "https://trusted-widget.com",
    iframeElement
  );
};
```

### 7. Basic Lightning Payment Request

```javascript
import { requestPayment } from "./Helpers/PaymentHelpers";

const handlePayment = async () => {
  try {
    const paymentRequest = {
      address: "user@domain.com", // Lightning address
      amount: 500, // 500 sats
    };

    const result = await requestPayment(paymentRequest, hostUrl);
    console.log("Payment requested:", result);
  } catch (error) {
    console.error("Payment failed:", error);
  }
};
```

### 8. ZAP Payment Request

```javascript
import { requestZapPayment } from "./Helpers/PaymentHelpers";

const handleZap = async () => {
  try {
    const result = await requestZapPayment(
      "npub1recipient...", // recipient's pubkey
      1000, // 1000 sats
      "Great content! Keep it up! 🔥", // optional message
      [], // relays
      hostUrl
    );
    console.log("ZAP requested:", result);
  } catch (error) {
    console.error("ZAP failed:", error);
  }
};
```

## Components

### CreateHabitWithPayment

A new component for habit creation with SWHandler payment request and response waiting:

```javascript
import CreateHabitWithPayment from "./Components/CreateHabitWithPayment";

<CreateHabitWithPayment
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  amount={1000}
  habitName="Exercise"
  userData={userData}
  hostUrl={hostUrl}
  onHabitCreated={(result) => {
    console.log("Habit created:", result);
    // Handle successful habit creation
  }}
  onHabitCreationFailed={(error) => {
    console.log("Habit creation failed:", error);
    // Handle failed habit creation
  }}
/>;
```

**Features:**

- 10-second payment timeout with countdown timer
- Real-time payment status updates
- Automatic habit creation on successful payment
- Graceful error handling and user feedback
- Visual progress indicators

### RewardInfoCard

A component to display reward information with the progressive reward system based on total habit days:

```javascript
import RewardInfoCard from "./Components/RewardInfoCard";

<RewardInfoCard
  stakedAmount={1000}
  totalHabitDays={5} // Total days habit has been active
  habitName="Exercise"
/>;
```

### ZapRequestModal

A React component for sending ZAP requests using SWHandler:

```javascript
import ZapRequestModal from "./Components/ZapRequestModal";

<ZapRequestModal
  isOpen={showZapModal}
  onClose={() => setShowZapModal(false)}
  recipientPubkey={userData?.pubkey}
  recipientName="Habit Tracker"
  defaultAmount={100}
  defaultContent="Supporting your habit journey! 🔥"
  hostUrl={hostUrl}
  onZapSuccess={handleZapSuccess}
  onZapFailure={handleZapFailure}
/>;
```

### PaymentModal (Updated)

The existing PaymentModal has been updated to use the centralized reward system:

- Tries centralized payment first (no wallet signing)
- Falls back to SWHandler payment
- Falls back to NWC if available
- Falls back to lightning address invoice generation
- Provides appropriate success/error messages with reward details

## Integration Points

### 1. Payment Flow

The payment flow follows different patterns for staking vs rewards:

#### Staking Flow (User pays):

1. **Centralized Payment** (primary - user pays to centralized node)
2. **SWHandler Payment** (fallback - user pays via SWHandler)
3. **NWC Payment** (fallback - user pays via NWC)
4. **Lightning Address Invoice** (fallback - user pays via invoice)

#### Reward Flow (Centralized node pays):

1. **Centralized Reward** (primary - centralized node sends to user)
2. **SWHandler Reward** (fallback - SWHandler sends to user)
3. **Legacy Methods** (fallback - manual reward distribution)

### 2. Reward Calculation

Rewards are automatically calculated based on total habit days:

```javascript
// Day 1: 50%
calculateRewardAmount(1000, 1); // 500 sats

// Day 3: 67.5%
calculateRewardAmount(1000, 3); // 675 sats

// Day 5: 82.5%
calculateRewardAmount(1000, 5); // 825 sats

// Day 7+: 100%
calculateRewardAmount(1000, 7); // 1000 sats
```

### 3. Error Handling

Comprehensive error handling with user-friendly messages:

```javascript
dispatch(
  addToast({
    type: "error",
    message: `Payment failed: ${error.message}`,
  })
);
```

## Configuration

### Required Dependencies

Ensure you have the latest version of smart-widget-handler:

```json
{
  "dependencies": {
    "smart-widget-handler": "^1.0.34"
  }
}
```

### Host URL

The `hostUrl` parameter is required for SWHandler functionality. It's automatically provided by the host application.

### Lightning Addresses

Users need lightning addresses in their Nostr profiles for payment functionality:

- `lud16`: Lightning address (e.g., "user@domain.com")
- `lud06`: LNURL (e.g., "lnurl1...")

## Best Practices

1. **Always provide fallbacks**: Use centralized payment as primary, but have SWHandler and legacy methods as backup
2. **Handle errors gracefully**: Show user-friendly error messages
3. **Validate inputs**: Check for required fields before making payment requests
4. **Log for debugging**: Include console logs for payment flow debugging
5. **User feedback**: Provide clear feedback for payment status and reward amounts
6. **Reward transparency**: Always show users their reward percentage and amount
7. **Track total days**: Ensure you're tracking total habit days, not just current streak

## Troubleshooting

### Common Issues

1. **"SWHandler payment request not available"**

   - Ensure you're using the latest smart-widget-handler version
   - Check that hostUrl is provided

2. **"Recipient has no lightning address"**

   - Verify the user has a lightning address in their Nostr profile
   - Check both `lud16` and `lud06` fields

3. **"Payment failed"**

   - Check network connectivity
   - Verify lightning address format
   - Ensure sufficient balance in custodian wallet

4. **"Centralized reward failed"**

   - Check custodian wallet configuration
   - Verify user lightning address is valid
   - Ensure custodian wallet has sufficient balance

5. **"Incorrect reward amount"**
   - Verify you're passing totalHabitDays, not streakDays
   - Check that totalHabitDays is calculated correctly
   - Ensure stakedAmount is the correct value

### Debug Mode

Enable debug logging by checking console output for detailed payment flow information.

## Future Enhancements

- Support for custom relay lists
- Batch payment requests
- Payment scheduling
- Advanced ZAP features
- Multi-currency support
- SWHandler getUserWallet method integration
- Advanced reward algorithms
- Streak-based bonus rewards
- Habit difficulty multipliers
- Time-based reward bonuses

## Support

For issues or questions about the SWHandler payment integration, please refer to the smart-widget-handler documentation or create an issue in the project repository.
