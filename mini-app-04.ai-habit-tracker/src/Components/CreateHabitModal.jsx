import React, { useState } from "react";
import { X, Target, Zap, Type } from "lucide-react";

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

export default function CreateHabitModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emoji: "🎯",
    stakingAmount: 0,
    category: "health",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
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
              onChange={(e) => handleInputChange("description", e.target.value)}
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
            />
            <small className="form-hint">
              Stake sats to increase commitment. You'll earn them back on
              successful streaks!
            </small>
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
            <button type="submit" className="submit-btn">
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
