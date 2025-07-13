import React, { useState } from "react";
import { X, Target, Zap, Type, Shield } from "lucide-react";
import PaymentModal from "./PaymentModal";

const HABIT_EMOJIS = [
  "🎯",
  "💪",
  "🏃",
  "📚",
  "🧘",
  "💧",
  "🥗",
  "🏋️",
  "⏰",
  "🌅",
  "🚫",
  "💤",
];

export default function CreateHabitModal({ onClose, onSubmit, userData }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emoji: "🎯",
    stakingAmount: 0,
    category: "health",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCreatingHabit, setIsCreatingHabit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // If staking amount is set, show payment modal first
    if (formData.stakingAmount > 0) {
      setShowPaymentModal(true);
    } else {
      // No staking, create habit directly
      createHabit();
    }
  };

  const createHabit = (stakingResult = null) => {
    setIsCreatingHabit(true);

    const habitData = {
      ...formData,
      stakingResult, // Include staking payment result if available
      createdAt: new Date().toISOString(),
    };

    onSubmit(habitData);
    setIsCreatingHabit(false);
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log("Staking payment successful:", paymentResult);
    setShowPaymentModal(false);
    createHabit(paymentResult);
  };

  const handlePaymentFailure = (error) => {
    console.error("Staking payment failed:", error);
    setShowPaymentModal(false);
    // Optionally create habit without staking or show error
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Create New Habit</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="habit-form">
            <div className="form-group">
              <label htmlFor="name">
                <Type size={16} />
                Habit Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Why is this habit important to you?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Choose Emoji</label>
              <div className="emoji-grid">
                {HABIT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`emoji-btn ${
                      formData.emoji === emoji ? "selected" : ""
                    }`}
                    onClick={() => handleInputChange("emoji", emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="stakingAmount">
                <Zap size={16} />
                Staking Amount (sats)
              </label>
              <input
                id="stakingAmount"
                type="number"
                value={formData.stakingAmount}
                onChange={(e) =>
                  handleInputChange(
                    "stakingAmount",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="0"
                min="0"
                max="1000000"
              />
              <div className="staking-info">
                <small className="form-hint">
                  {formData.stakingAmount > 0 ? (
                    <>
                      <Shield size={14} className="staking-icon" />
                      Stake {formData.stakingAmount} sats to increase
                      commitment. You'll earn them back plus rewards on
                      successful streaks!
                    </>
                  ) : (
                    "Optional: Stake sats to increase commitment and earn rewards!"
                  )}
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">
                <Target size={16} />
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="health">Health & Fitness</option>
                <option value="productivity">Productivity</option>
                <option value="learning">Learning</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="creative">Creative</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isCreatingHabit}
              >
                {formData.stakingAmount > 0 ? (
                  <>
                    <Shield size={16} />
                    {isCreatingHabit ? "Creating..." : "Stake & Create"}
                  </>
                ) : isCreatingHabit ? (
                  "Creating..."
                ) : (
                  "Create Habit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal for Staking */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentType="staking"
        amount={formData.stakingAmount}
        habitName={formData.name}
        userData={userData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </>
  );
}
