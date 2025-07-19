import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import SWHandler from "smart-widget-handler";
import { addToast } from "../Store/toastSlice";
import { createHabitWithPayment } from "../Helpers/PaymentHelpers";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function CreateHabitWithPayment({
  isOpen,
  onClose,
  amount,
  habitName,
  userData,
  hostUrl = null,
  onHabitCreated,
  onHabitCreationFailed,
}) {
  const dispatch = useDispatch();
  const [paymentStatus, setPaymentStatus] = useState("waiting");
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  // Start payment request when modal opens
  useEffect(() => {
    if (isOpen && !isProcessing) {
      console.log("Modal opened, starting payment request");
      handleCreateHabit();
    }
  }, [isOpen]);

  // Add debugging for payment status changes
  useEffect(() => {
    console.log(
      "Payment status changed:",
      paymentStatus,
      "Time remaining:",
      timeRemaining
    );
  }, [paymentStatus, timeRemaining]);

  // Handle visibility changes when user returns from wallet
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOpen) {
        console.log(
          "App became visible again, modal is open:",
          isOpen,
          "status:",
          paymentStatus
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOpen, paymentStatus]);

  const handleCreateHabit = async () => {
    if (!userData?.pubkey) {
      dispatch(addToast({ type: "error", message: "User data not available" }));
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("waiting");
    setTimeRemaining(10);

    let countdownInterval;
    let paymentCompleted = false;

    try {
      countdownInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);

            // If payment hasn't completed by timeout, show options
            if (!paymentCompleted) {
              setIsProcessing(false);
              setPaymentStatus("timeout");
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      await createHabitWithPayment(
        userData.pubkey,
        amount,
        habitName,
        hostUrl,
        (paymentResult) => {
          paymentCompleted = true;
          if (countdownInterval) clearInterval(countdownInterval);
          setIsProcessing(false);

          if (paymentResult.success) {
            setPaymentStatus("success");
            dispatch(
              addToast({
                type: "success",
                message: `✅ Habit "${habitName}" created! Payment of ${amount} sats received.`,
              })
            );

            if (onHabitCreated) {
              onHabitCreated(paymentResult);
            }
          }
          // Note: We don't handle payment failure here anymore
          // We let the timeout handle it to wait the full 10 seconds
        },
        (timeoutResult) => {
          // This will be called after 10 seconds if no successful payment
          paymentCompleted = true;
          if (countdownInterval) clearInterval(countdownInterval);
          setIsProcessing(false);
          setPaymentStatus("timeout");
        }
      );
    } catch (error) {
      paymentCompleted = true;
      if (countdownInterval) clearInterval(countdownInterval);
      setIsProcessing(false);
      setPaymentStatus("failed");

      console.error("Habit creation failed:", error);
      dispatch(
        addToast({
          type: "error",
          message: `❌ Habit creation failed: ${error.message}`,
        })
      );

      if (onHabitCreationFailed) {
        onHabitCreationFailed({ success: false, error: error.message });
      }
    }
  };

  const handleTryAgain = () => {
    handleCreateHabit();
  };

  const handleCreateWithoutStake = () => {
    dispatch(
      addToast({
        type: "success",
        message: `✅ Habit "${habitName}" created without stake. You can stake later!`,
      })
    );

    if (onHabitCreated) {
      onHabitCreated({
        success: true,
        purpose: "habit_creation",
        habitName,
        amount: 0,
        paymentMethod: "no_stake",
        message: "Habit created without stake",
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "waiting":
        return <Clock size={24} className="text-blue-500" />;
      case "success":
        return <CheckCircle size={24} className="text-green-500" />;
      case "failed":
        return <XCircle size={24} className="text-red-500" />;
      case "timeout":
        return <Clock size={24} className="text-orange-500" />;
      default:
        return <Loader size={24} className="text-blue-500 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "waiting":
        return `Waiting for payment... (${timeRemaining}s)`;
      case "success":
        return "Payment successful! Habit created.";
      case "failed":
        return "Payment failed.";
      case "timeout":
        return "Payment timeout.";
      default:
        return "Processing...";
    }
  };

  const getFailureMessage = () => {
    // This can be used to show specific failure reasons in the UI
    return paymentStatus === "failed"
      ? "Don't worry! You can try again or create the habit without staking for now."
      : "You can try the payment again or create the habit without staking.";
  };

  if (!isOpen) return null;

  console.log("Rendering CreateHabitWithPayment modal:", {
    isOpen,
    paymentStatus,
    timeRemaining,
    isProcessing,
    habitName,
    amount,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">{getStatusIcon()}</div>

          <h3 className="text-lg font-semibold mb-2">
            Create Habit: {habitName}
          </h3>

          <p className="text-gray-600 mb-4">{getStatusMessage()}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stake Amount:</span>
              <span className="font-medium">{amount} sats</span>
            </div>
          </div>

          {paymentStatus === "waiting" && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((10 - timeRemaining) / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Complete payment in your wallet
              </p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  ✅ Habit created successfully!
                </p>
              </div>
            </div>
          )}

          {(paymentStatus === "failed" || paymentStatus === "timeout") && (
            <div className="mb-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm font-medium mb-1">
                  {paymentStatus === "timeout"
                    ? "⏰ Payment timeout"
                    : "❌ Payment failed"}
                </p>
                <p className="text-orange-700 text-xs">{getFailureMessage()}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {paymentStatus === "waiting" && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

            {paymentStatus === "success" && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Done
              </button>
            )}

            {(paymentStatus === "failed" || paymentStatus === "timeout") && (
              <>
                <button
                  onClick={handleTryAgain}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
                <button
                  onClick={handleCreateWithoutStake}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Create Without Stake
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
