import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Target, Zap, Type, Shield, Lightbulb } from "lucide-react";
import { addToast } from "../Store/toastSlice";
import { createHabitWithPayment } from "../Helpers/PaymentHelpers";

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

const PREDEFINED_AMOUNTS = [
  { value: 1000, label: "1K" },
  { value: 10000, label: "10K" },
  { value: 100000, label: "100K" },
  { value: "custom", label: "Custom" },
];

// Habit description suggestions based on common keywords
const HABIT_SUGGESTIONS = {
  // Exercise & Fitness
  run: "Building cardiovascular endurance and mental resilience through consistent running practice.",
  workout:
    "Strengthening my body and mind through regular exercise to improve overall health and energy.",
  gym: "Committing to regular gym sessions to build strength, discipline, and physical confidence.",
  exercise:
    "Maintaining physical fitness and mental well-being through consistent exercise routine.",
  walk: "Improving daily movement, clearing my mind, and boosting energy through regular walks.",
  yoga: "Enhancing flexibility, mindfulness, and inner peace through regular yoga practice.",
  stretch:
    "Improving flexibility and reducing tension through daily stretching routine.",

  // Health & Wellness
  water:
    "Staying properly hydrated to support optimal body function and energy levels.",
  drink:
    "Maintaining proper hydration for better health, energy, and mental clarity.",
  sleep:
    "Prioritizing quality rest to improve focus, mood, and overall well-being.",
  meditate:
    "Cultivating mindfulness, reducing stress, and improving mental clarity through meditation.",
  vitamins:
    "Supporting my health with consistent vitamin intake for optimal nutrition.",
  healthy:
    "Building sustainable healthy habits that support long-term wellness and vitality.",

  // Productivity & Learning
  read: "Expanding knowledge, improving focus, and developing a consistent learning habit.",
  study:
    "Dedicating time to learning and skill development for personal and professional growth.",
  write:
    "Developing writing skills and creative expression through regular practice.",
  journal:
    "Reflecting on daily experiences and thoughts to improve self-awareness and mental clarity.",
  learn:
    "Committing to continuous learning and skill development for personal growth.",
  code: "Improving programming skills through consistent practice and project work.",
  practice: "Developing mastery through regular, focused practice sessions.",

  // Mindfulness & Mental Health
  gratitude:
    "Cultivating a positive mindset by regularly acknowledging things I'm grateful for.",
  breathe:
    "Improving mental clarity and reducing stress through conscious breathing exercises.",
  mindful:
    "Developing present-moment awareness and reducing anxiety through mindfulness practice.",
  positive:
    "Building a more optimistic outlook and resilient mindset through positive thinking.",

  // Social & Personal
  call: "Maintaining important relationships and social connections through regular communication.",
  family:
    "Strengthening family bonds and creating meaningful moments with loved ones.",
  friend: "Nurturing friendships and building stronger social connections.",
  clean:
    "Maintaining an organized, peaceful living space that supports mental clarity.",
  organize:
    "Creating order and efficiency in my environment to reduce stress and increase productivity.",

  // Creative & Hobbies
  draw: "Developing artistic skills and creative expression through regular drawing practice.",
  music:
    "Enhancing musical abilities and finding joy through consistent practice.",
  create:
    "Nurturing creativity and bringing ideas to life through regular creative work.",
  art: "Expressing creativity and developing artistic skills through consistent practice.",

  // Habits to Break
  quit: "Breaking free from this habit to improve my health, focus, and quality of life.",
  stop: "Eliminating this behavior to create space for more positive habits and growth.",
  avoid:
    "Staying away from this to protect my well-being and maintain healthy boundaries.",
  reduce:
    "Gradually decreasing this habit to improve my overall health and well-being.",
};

export default function CreateHabitModal({
  onClose,
  onSubmit,
  userData,
  hostUrl,
}) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emoji: "🎯",
    stakingAmount: 0,
    category: "health",
  });

  const [isCreatingHabit, setIsCreatingHabit] = useState(false);
  const [selectedAmountOption, setSelectedAmountOption] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Generate description suggestions based on habit name
  useEffect(() => {
    if (formData.name.length > 2) {
      const suggestions = generateDescriptionSuggestions(formData.name);
      setDescriptionSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0 && !formData.description);
    } else {
      setDescriptionSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.name, formData.description]);

  const generateDescriptionSuggestions = (habitName) => {
    const name = habitName.toLowerCase();
    const suggestions = [];

    // Check for keyword matches
    Object.keys(HABIT_SUGGESTIONS).forEach((keyword) => {
      if (name.includes(keyword)) {
        suggestions.push(HABIT_SUGGESTIONS[keyword]);
      }
    });

    // Remove duplicates and limit to 3 suggestions
    return [...new Set(suggestions)].slice(0, 3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // If staking amount is set, handle payment with toasts
    if (formData.stakingAmount > 0) {
      setPaymentInProgress(true);
      setCountdown(10);

      // Show initial toast
      dispatch(
        addToast({
          type: "info",
          message: `💳 Payment request sent for ${formData.stakingAmount} sats. Complete in your wallet (10s)...`,
        })
      );

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      try {
        await createHabitWithPayment(
          userData.pubkey,
          formData.stakingAmount,
          formData.name,
          hostUrl,
          // Payment success callback
          (paymentResult) => {
            clearInterval(countdownInterval);
            setPaymentInProgress(false);

            if (paymentResult.success) {
              dispatch(
                addToast({
                  type: "success",
                  message: `✅ Payment successful! Creating habit "${formData.name}"...`,
                })
              );

              // Create habit with payment result
              createHabit(paymentResult);
            }
          },
          // Payment timeout callback
          (timeoutResult) => {
            clearInterval(countdownInterval);
            setPaymentInProgress(false);

            // Automatically create habit without stake on timeout
            dispatch(
              addToast({
                type: "success",
                message: `✅ Habit "${formData.name}" created without stake. You can stake later!`,
              })
            );

            // Create habit without payment
            const habitDataWithoutStake = {
              ...formData,
              stakingAmount: 0,
              stakingResult: {
                success: true,
                paymentMethod: "no_stake",
                message: "Habit created without stake due to payment timeout",
              },
              createdAt: new Date().toISOString(),
            };

            onSubmit(habitDataWithoutStake);
            onClose(); // Return to main screen
          }
        );
      } catch (error) {
        clearInterval(countdownInterval);
        setPaymentInProgress(false);

        dispatch(
          addToast({
            type: "error",
            message: `❌ Payment failed: ${error.message}`,
          })
        );
      }
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
    onClose(); // Close modal after creating habit
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Hide suggestions when user starts typing description
    if (field === "description" && value.length > 0) {
      setShowSuggestions(false);
    }
  };

  const handleAmountSelection = (amount) => {
    if (amount === "custom") {
      setSelectedAmountOption("custom");
      setShowCustomInput(true);
      // Keep the current amount or set to 0 if not set
      if (formData.stakingAmount === 0) {
        handleInputChange("stakingAmount", 0);
      }
    } else {
      setSelectedAmountOption(amount);
      setShowCustomInput(false);
      handleInputChange("stakingAmount", amount);
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    handleInputChange("stakingAmount", value);
  };

  const handleSuggestionClick = (suggestion) => {
    handleInputChange("description", suggestion);
    setShowSuggestions(false);
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

              {showSuggestions && descriptionSuggestions.length > 0 && (
                <div className="description-suggestions">
                  <div className="suggestions-header">
                    <Lightbulb size={14} />
                    <span>Suggested descriptions:</span>
                  </div>
                  {descriptionSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
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
              <label>
                <Zap size={16} />
                Staking Amount (sats)
              </label>
              <div className="amount-selection">
                <div className="amount-grid">
                  {PREDEFINED_AMOUNTS.map((amount) => (
                    <button
                      key={amount.value}
                      type="button"
                      className={`amount-btn ${
                        selectedAmountOption === amount.value ? "selected" : ""
                      }`}
                      onClick={() => handleAmountSelection(amount.value)}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>

                {showCustomInput && (
                  <div className="custom-amount-input">
                    <input
                      type="number"
                      value={formData.stakingAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      min="0"
                      max="1000000"
                    />
                  </div>
                )}
              </div>

              <div className="staking-info">
                <small className="form-hint">
                  {formData.stakingAmount > 0 ? (
                    <>
                      <Shield size={14} className="staking-icon" />
                      Stake {formData.stakingAmount.toLocaleString()} sats to
                      increase commitment. You'll earn them back plus rewards on
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
                disabled={isCreatingHabit || paymentInProgress}
              >
                {paymentInProgress ? (
                  <>
                    <Shield size={16} />
                    {countdown > 0
                      ? `Payment... (${countdown}s)`
                      : "Payment timeout"}
                  </>
                ) : formData.stakingAmount > 0 ? (
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

      {/* Payment status display */}
      {paymentInProgress && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "2px solid #3b82f6",
            zIndex: 1000,
            minWidth: "300px",
          }}
        >
          {countdown > 0 ? (
            <div>
              <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>
                💳 Complete payment in your wallet
              </p>
              <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                Time remaining: {countdown}s
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: "0", fontWeight: "600", color: "#10b981" }}>
                ✅ Creating habit without stake...
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
