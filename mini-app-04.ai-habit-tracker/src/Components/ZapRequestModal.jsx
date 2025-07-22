import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  Zap,
  Send,
  AlertCircle,
  CheckCircle,
  User,
  MessageSquare,
} from "lucide-react";
import { addToast } from "../Store/toastSlice";
import {
  requestZapPayment,
  getLightningAddress,
} from "../Helpers/PaymentHelpers";

export default function ZapRequestModal({
  isOpen,
  onClose,
  recipientPubkey,
  recipientName = "User",
  defaultAmount = 100,
  defaultContent = "",
  hostUrl = null,
  onZapSuccess,
  onZapFailure,
}) {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState(defaultAmount);
  const [content, setContent] = useState(defaultContent);
  const [zapStep, setZapStep] = useState("preparing"); // preparing, processing, success, failed
  const [zapProgress, setZapProgress] = useState(0);
  const [error, setError] = useState(null);
  const [recipientLnAddress, setRecipientLnAddress] = useState(null);

  React.useEffect(() => {
    if (isOpen && recipientPubkey) {
      loadRecipientInfo();
    }
  }, [isOpen, recipientPubkey]);

  const loadRecipientInfo = async () => {
    try {
      setZapStep("preparing");
      setError(null);

      // Get recipient's lightning address
      const lnAddress = await getLightningAddress(recipientPubkey);
      setRecipientLnAddress(lnAddress);

      if (!lnAddress) {
        setError("Recipient has no lightning address for ZAPs");
        setZapStep("failed");
      } else {
        setZapStep("preparing");
      }
    } catch (error) {
      console.error("Failed to load recipient info:", error);
      setError("Failed to load recipient information");
      setZapStep("failed");
    }
  };

  const handleZapRequest = async () => {
    if (!recipientLnAddress) {
      setError("Recipient has no lightning address");
      return;
    }

    if (amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setZapStep("processing");
    setZapProgress(10);
    setError(null);

    try {
      setZapProgress(30);

      // Request ZAP payment through SWHandler
      const result = await requestZapPayment(
        recipientPubkey,
        amount,
        content,
        [], // relays - could be made configurable
        hostUrl
      );

      setZapProgress(100);
      setZapStep("success");

      // Show success message
      dispatch(
        addToast({
          type: "success",
          message: `⚡ ZAP request sent! ${amount} sats to ${recipientName}`,
        })
      );

      // Call success callback
      if (onZapSuccess) {
        onZapSuccess(result);
      }
    } catch (error) {
      console.error("ZAP request failed:", error);
      setError(error.message);
      setZapStep("failed");
      setZapProgress(0);

      dispatch(
        addToast({
          type: "error",
          message: `ZAP request failed: ${error.message}`,
        })
      );

      if (onZapFailure) {
        onZapFailure(error);
      }
    }
  };

  const resetModal = () => {
    setZapStep("preparing");
    setZapProgress(0);
    setError(null);
    setAmount(defaultAmount);
    setContent(defaultContent);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content zap-modal">
        <div className="modal-header">
          <div className="zap-header">
            <div className="zap-icon">
              <Zap size={24} className="zap-icon-color" />
            </div>
            <div className="zap-title">
              <h3>Send ZAP</h3>
              <p>Lightning payment to {recipientName}</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {zapStep === "preparing" && (
            <div className="zap-form">
              <div className="form-group">
                <label htmlFor="amount">Amount (sats)</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="Enter amount in sats"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Message (optional)</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a message with your ZAP..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              {recipientLnAddress && (
                <div className="recipient-info">
                  <div className="info-item">
                    <User size={16} />
                    <span>{recipientName}</span>
                  </div>
                  <div className="info-item">
                    <Zap size={16} />
                    <span>{recipientLnAddress}</span>
                  </div>
                </div>
              )}

              <button
                className="zap-button"
                onClick={handleZapRequest}
                disabled={!recipientLnAddress || amount <= 0}
              >
                <Zap size={16} />
                Send ZAP
              </button>
            </div>
          )}

          {zapStep === "processing" && (
            <div className="zap-processing">
              <div className="processing-icon">
                <div className="spinner"></div>
              </div>
              <h4>Processing ZAP Request...</h4>
              <p>Requesting payment through SWHandler</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${zapProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {zapStep === "success" && (
            <div className="zap-success">
              <div className="success-icon">
                <CheckCircle size={48} className="success-color" />
              </div>
              <h4>ZAP Request Sent!</h4>
              <p>
                Your ZAP request for {amount} sats has been sent to{" "}
                {recipientName}
              </p>
              {content && (
                <div className="zap-message">
                  <MessageSquare size={16} />
                  <span>"{content}"</span>
                </div>
              )}
              <button className="close-success-button" onClick={handleClose}>
                Close
              </button>
            </div>
          )}

          {zapStep === "failed" && (
            <div className="zap-failed">
              <div className="error-icon">
                <AlertCircle size={48} className="error-color" />
              </div>
              <h4>ZAP Request Failed</h4>
              <p>{error}</p>
              <button className="retry-button" onClick={resetModal}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .zap-modal {
          max-width: 500px;
        }

        .zap-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .zap-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
        }

        .zap-icon-color {
          color: #1a1a1a;
        }

        .zap-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .zap-title p {
          margin: 4px 0 0 0;
          color: #666;
          font-size: 0.875rem;
        }

        .zap-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 500;
          color: #333;
        }

        .form-input,
        .form-textarea {
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #ffd700;
        }

        .recipient-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 0.875rem;
        }

        .zap-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #1a1a1a;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .zap-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }

        .zap-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .zap-processing,
        .zap-success,
        .zap-failed {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          padding: 32px 0;
        }

        .processing-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #ffd700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .success-icon,
        .error-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-color {
          color: #10b981;
        }

        .error-color {
          color: #ef4444;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e1e5e9;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          transition: width 0.3s ease;
        }

        .zap-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #ffd700;
          font-style: italic;
          color: #666;
        }

        .close-success-button,
        .retry-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .close-success-button {
          background: #10b981;
          color: white;
        }

        .close-success-button:hover {
          background: #059669;
        }

        .retry-button {
          background: #3b82f6;
          color: white;
        }

        .retry-button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}
