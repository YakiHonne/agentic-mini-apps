import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { useDispatch } from "react-redux";
import {
  X,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Wallet,
  Timer,
  Gift,
  TrendingUp,
} from "lucide-react";
import { addToast } from "../Store/toastSlice";
import {
  checkWalletConnection,
  getWalletInfo,
  payHabitStaking,
  processHabitReward,
  sendNwcPayment,
  fetchLnurlInvoice,
  getLightningAddress,
  stakeHabitWithSWHandler,
  rewardHabitWithSWHandler,
  requestZapPayment,
  sendCentralizedReward,
  processCentralizedStaking,
  calculateRewardAmount,
  getRewardPercentage,
  getUserWalletAddress,
} from "../Helpers/PaymentHelpers";

export default function PaymentModal({
  isOpen,
  onClose,
  paymentType, // 'staking' or 'reward'
  amount,
  habitName,
  userData,
  totalHabitDays = 0, // Changed from streakDays to totalHabitDays
  streakDays = 0, // Add streakDays parameter for actual streak value
  stakedAmount = 0, // Original staked amount for percentage calculation
  onPaymentSuccess,
  onPaymentFailure,
  hostUrl = null,
}) {
  const dispatch = useDispatch();
  const [paymentStep, setPaymentStep] = useState("preparing"); // preparing, processing, success, failed
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (isOpen && userData) {
      checkWallet();
    }
  }, [isOpen, userData]);

  const checkWallet = () => {
    const connected = checkWalletConnection(userData);
    setWalletConnected(connected);

    if (!connected) {
      setError(
        "Please add a lightning address to your Nostr profile to proceed with payments."
      );
      setPaymentStep("failed");
    } else {
      setPaymentStep("preparing");
      setError(null);
    }
  };

  const processPayment = async () => {
    if (!walletConnected) {
      setError("Wallet not connected");
      return;
    }

    setPaymentStep("processing");
    setPaymentProgress(10);
    setError(null);

    try {
      let result;
      const walletInfo = getWalletInfo(userData);

      if (paymentType === "staking") {
        setPaymentProgress(30);

        // Try centralized staking first (no wallet signing required)
        if (hostUrl) {
          try {
            result = await processCentralizedStaking(
              userData.pubkey,
              amount,
              habitName,
              hostUrl
            );
            setPaymentProgress(80);
          } catch (centralizedError) {
            console.log(
              "Centralized staking failed, falling back to SWHandler:",
              centralizedError
            );
            // Fall back to SWHandler
            try {
              result = await stakeHabitWithSWHandler(
                userData.pubkey,
                amount,
                habitName,
                hostUrl
              );
              setPaymentProgress(80);
            } catch (swError) {
              console.log(
                "SWHandler staking failed, falling back to legacy methods:",
                swError
              );
              // Fall back to legacy methods
            }
          }
        }

        // Fall back to legacy methods if centralized and SWHandler failed
        if (!result) {
          if (walletInfo?.type === "nwc") {
            // Automated staking with NWC
            result = await payHabitStaking(
              userData,
              amount,
              habitName,
              hostUrl
            );
            setPaymentProgress(80);
          } else {
            // Lightning address only - generate invoice and show to user
            const lnAddress = userData.lud16 || userData.lud06;
            if (!lnAddress) {
              throw new Error("No lightning address found for staking");
            }

            const description = `Staking ${amount} sats for ${habitName}`;
            const invoiceData = await fetchLnurlInvoice(
              lnAddress,
              amount,
              description,
              userData.pubkey,
              hostUrl
            );

            if (!invoiceData?.invoice) {
              throw new Error("Failed to generate staking invoice");
            }

            setInvoice(invoiceData.invoice);
            result = {
              success: true,
              purpose: "staking",
              habitName,
              amount,
              invoice: invoiceData.invoice,
              description,
              paymentMethod: "lightning_address",
            };
            setPaymentProgress(80);
          }
        }
      } else if (paymentType === "reward") {
        setPaymentProgress(20);

        // Use the already calculated reward amount passed from parent
        // instead of recalculating to avoid inconsistencies
        const rewardAmount = amount; // This is already the calculated reward amount
        const rewardPercentage = getRewardPercentage(totalHabitDays);

        // Show encouraging message instead of processing payment
        setPaymentProgress(100);

        const result = {
          success: true,
          purpose: "reward_pending",
          habitName,
          totalHabitDays,
          stakedAmount: stakedAmount, // Use the stakedAmount passed from parent
          rewardAmount: rewardAmount,
          rewardPercentage: rewardPercentage,
          paymentMethod: "pending_server_implementation",
          message: "Reward calculated and queued for future distribution",
        };

        setPaymentDetails(result);
        setPaymentStep("success");

        // Don't show toast here - let the parent component handle success messages
        // to avoid duplicate notifications

        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess(result);
        }
      }

      setPaymentProgress(100);
      setPaymentDetails(result);
      setPaymentStep("success");

      // Show success message with reward details
      if (paymentType === "staking") {
        dispatch(
          addToast({
            type: "success",
            message:
              result && result.paymentMethod === "centralized_custodian"
                ? `🛡️ Staking ${amount} sats for ${habitName} initiated!`
                : result && result.paymentMethod === "swhandler"
                ? `🛡️ SWHandler payment requested for ${amount} sats to stake for ${habitName}!`
                : result && result.paymentMethod === "lightning_address"
                ? `🛡️ Invoice generated! Pay ${amount} sats to stake for ${habitName}.`
                : `🛡️ Successfully staked ${amount} sats for ${habitName}!`,
          })
        );
      }
      // Note: Reward toast is now shown directly in the reward processing above

      // Call success callback
      if (
        onPaymentSuccess &&
        !(
          paymentType === "staking" &&
          result.paymentMethod === "lightning_address"
        )
      ) {
        // Only auto-close for automated payments; for manual invoice let user close
        onPaymentSuccess(result);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setError(error.message);
      setPaymentStep("failed");
      setPaymentProgress(0);

      dispatch(
        addToast({
          type: "error",
          message: `Payment failed: ${error.message}`,
        })
      );

      if (onPaymentFailure) {
        onPaymentFailure(error);
      }
    }
  };

  const resetModal = () => {
    setPaymentStep("preparing");
    setPaymentProgress(0);
    setError(null);
    setPaymentDetails(null);
    setInvoice(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const walletInfo = getWalletInfo(userData);

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-modal">
        <div className="modal-header">
          <div className="payment-header">
            <div className="payment-icon">
              {paymentType === "staking" ? (
                <Shield size={32} className="staking-icon" />
              ) : (
                <Gift size={32} className="reward-icon" />
              )}
            </div>
            <div>
              <h2>
                {paymentType === "staking" ? "Stake Sats" : "Claim Reward"}
              </h2>
              <p className="payment-subtitle">
                {paymentType === "staking"
                  ? `Stake ${amount} sats for ${habitName}`
                  : `${calculateRewardAmount(
                      amount,
                      totalHabitDays
                    )} sats reward for ${totalHabitDays} total days`}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="payment-content">
          {/* Wallet Status */}
          <div className="wallet-status">
            <div className="wallet-info">
              <div className="wallet-icon">
                <Wallet
                  size={20}
                  className={walletConnected ? "connected" : "disconnected"}
                />
              </div>
              <div className="wallet-details">
                <p className="wallet-label">Lightning Wallet</p>
                <p
                  className={`wallet-status-text ${
                    walletConnected ? "connected" : "disconnected"
                  }`}
                >
                  {walletConnected ? "Connected" : "Not Connected"}
                </p>
              </div>
            </div>
            {walletInfo && (
              <div className="wallet-meta">
                {walletInfo.type === "nwc" && (
                  <p className="wallet-relay">NWC Relay: {walletInfo.relay}</p>
                )}
                {walletInfo.type === "lightning_address" && (
                  <p className="wallet-address">
                    ⚡ {walletInfo.lightningAddress}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Payment Progress */}
          {paymentStep === "processing" && (
            <div className="payment-progress-section">
              <div className="progress-header">
                <Timer size={20} />
                <span>Processing Payment...</span>
              </div>
              <div className="payment-progress-bar">
                <div
                  className="payment-progress-fill"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
              <p className="progress-text">{paymentProgress}% complete</p>
            </div>
          )}

          {/* Payment Details */}
          <div className="payment-details">
            <div className="detail-item">
              <span className="detail-label">Amount:</span>
              <span className="detail-value">
                <Zap size={16} />
                {amount} sats
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Habit:</span>
              <span className="detail-value">{habitName}</span>
            </div>
            {paymentType === "reward" && (
              <div className="detail-item">
                <span className="detail-label">Streak:</span>
                <span className="detail-value">
                  <TrendingUp size={16} />
                  {streakDays || totalHabitDays} days
                </span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">
                {paymentType === "staking" ? "Staking" : "Reward"}
              </span>
            </div>
          </div>

          {/* Success State */}
          {paymentStep === "success" && paymentDetails && (
            <div className="payment-success">
              {(() => {
                const isInvoice =
                  paymentDetails.paymentMethod === "lightning_address";
                return (
                  <>
                    <div className="success-icon">
                      <CheckCircle size={48} />
                    </div>
                    <h3>
                      {isInvoice ? "Invoice Generated" : "Payment Successful!"}
                    </h3>
                  </>
                );
              })()}
              <p>
                {paymentType === "staking"
                  ? paymentDetails.paymentMethod === "lightning_address"
                    ? `Your staking invoice has been generated! Pay ${amount} sats to stake for ${habitName}.`
                    : `Your ${amount} sats have been staked for ${habitName}. Complete your daily habits to earn rewards!`
                  : paymentDetails.paymentMethod ===
                    "pending_server_implementation"
                  ? paymentDetails.stakedAmount === 0
                    ? `🎉 Great progress today! Your reward of ${
                        paymentDetails.rewardAmount || amount
                      } sats will reach your wallet soon. Stay tuned!`
                    : `🎉 Great progress today! Your reward of ${
                        paymentDetails.rewardAmount || amount
                      } sats (${paymentDetails.rewardPercentage || 0}% of ${
                        paymentDetails.stakedAmount || amount
                      } staked) will reach your wallet soon. Stay tuned!`
                  : paymentDetails.paymentMethod === "lightning_address"
                  ? `Your reward invoice has been generated! ${
                      paymentDetails.rewardAmount || amount
                    } sats for your ${totalHabitDays} total days on ${habitName}. Copy the invoice below to claim your reward.`
                  : `Congratulations! You've earned ${
                      paymentDetails.rewardAmount || amount
                    } sats for your ${totalHabitDays} total days on ${habitName}.`}
              </p>
              {paymentDetails.invoice &&
                paymentDetails.paymentMethod === "lightning_address" && (
                  <div className="invoice-display">
                    <div className="invoice-qr">
                      <QRCode value={paymentDetails.invoice} size={160} />
                    </div>
                    <p className="invoice-label">Lightning Invoice:</p>
                    <textarea
                      className="invoice-text"
                      readOnly
                      value={paymentDetails.invoice}
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      className="copy-invoice-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentDetails.invoice);
                        dispatch(
                          addToast({
                            type: "success",
                            message: "Invoice copied to clipboard!",
                          })
                        );
                      }}
                    >
                      Copy Invoice
                    </button>
                    <div className="invoice-instructions">
                      <p>
                        Scan the QR with your lightning wallet or paste the
                        invoice to pay. After payment is confirmed your
                        stake/reward will be recorded automatically.
                      </p>
                    </div>
                  </div>
                )}
              {paymentDetails.preimage && (
                <div className="payment-proof">
                  <p className="proof-label">Payment Proof:</p>
                  <p className="proof-value">{paymentDetails.preimage}</p>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {paymentStep === "failed" && error && (
            <div className="payment-error">
              <div className="error-icon">
                <AlertCircle size={48} />
              </div>
              <h3>Payment Failed</h3>
              <p>{error}</p>
              {!walletConnected && (
                <div className="wallet-help">
                  <p>To make payments, you need to:</p>
                  <ul>
                    <li>
                      Add a lightning address (lud16) to your Nostr profile
                    </li>
                    <li>
                      Or connect a NWC-compatible wallet for automated payments
                    </li>
                    <li>Ensure your wallet has sufficient balance</li>
                  </ul>
                  <div className="wallet-help-note">
                    <p>
                      <strong>Note:</strong> With just a lightning address, you
                      can receive rewards but staking requires manual payment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="payment-actions">
            {paymentStep === "preparing" && walletConnected && (
              <button className="payment-btn primary" onClick={processPayment}>
                <Zap size={16} />
                {paymentType === "staking" ? "Stake Sats" : "Claim Reward"}
              </button>
            )}

            {paymentStep === "failed" && walletConnected && (
              <button
                className="payment-btn retry"
                onClick={() => {
                  resetModal();
                  setTimeout(processPayment, 100);
                }}
              >
                Try Again
              </button>
            )}

            {(paymentStep === "success" || paymentStep === "failed") && (
              <button className="payment-btn secondary" onClick={handleClose}>
                {paymentStep === "success" ? "Done" : "Close"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
