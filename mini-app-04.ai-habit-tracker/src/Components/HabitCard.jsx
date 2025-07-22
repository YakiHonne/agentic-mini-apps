import React from "react";
import { useDispatch } from "react-redux";
import {
  Flame,
  Calendar,
  Zap,
  MessageCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { updateHabitStreak } from "../Store/habitTrackerSlice";
import { addToast } from "../Store/toastSlice";
import {
  canCheckInToday,
  calculateStreakStatus,
  getHabitCompletionStatus,
  calculateDailyRewardAmount,
} from "../Helpers/PaymentHelpers";

export default function HabitCard({ habit, onPostUpdate }) {
  const dispatch = useDispatch();

  // Calculate reward info at the top so it's always defined
  const rewardInfo = calculateDailyRewardAmount(
    habit.stakingAmount || 0,
    habit.totalCompletions + 1,
    habit.currentStreak + 1
  );

  const handleMarkComplete = () => {
    // Check if user can check-in today
    if (!canCheckInToday(habit.lastCompletedAt)) {
      dispatch(
        addToast({
          type: "info",
          message: `✅ Already completed "${habit.name}" today! Come back tomorrow.`,
        })
      );
      return;
    }

    // Check streak status
    const streakStatus = calculateStreakStatus(
      habit.lastCompletedAt,
      habit.currentStreak
    );

    // Calculate new streak value
    let newStreak;
    if (streakStatus.streakBroken) {
      newStreak = 1; // Reset to 1 if streak was broken
      dispatch(
        addToast({
          type: "warning",
          message: `Streak reset for "${habit.name}". Starting fresh at day 1! 💪`,
        })
      );
    } else {
      newStreak = habit.currentStreak + 1; // Continue or start streak
    }

    // Calculate daily reward
    const rewardInfo = calculateDailyRewardAmount(
      habit.stakingAmount || 0,
      habit.totalCompletions + 1,
      newStreak
    );

    dispatch(
      updateHabitStreak({
        habitId: habit.id,
        success: true,
        newStreak: newStreak,
      })
    );

    // Show success message with reward info
    let message = `🎉 Great job! You completed "${habit.name}"`;
    if (rewardInfo.streakBonus > 0) {
      message += ` - ${rewardInfo.totalReward} sats (${rewardInfo.baseReward} base + ${rewardInfo.streakBonus} streak bonus) will reach your wallet automatically!`;
    } else {
      message += ` - ${rewardInfo.totalReward} sats will reach your wallet automatically!`;
    }

    dispatch(
      addToast({
        type: "success",
        message,
      })
    );
  };

  const isCompletedToday = () => {
    return !canCheckInToday(habit.lastCompletedAt);
  };

  const getStreakColor = () => {
    if (habit.currentStreak === 0) return "#6b7280";
    if (habit.currentStreak < 3) return "#f59e0b";
    if (habit.currentStreak < 7) return "#f97316";
    return "#dc2626";
  };

  // Get habit completion status
  const completionStatus = getHabitCompletionStatus(habit.totalCompletions);

  return (
    <div
      className={`habit-card ${
        completionStatus.status === "completed" ? "completed-habit" : ""
      }`}
    >
      <div className="habit-header">
        <div className="habit-emoji">{habit.emoji || "🎯"}</div>
        <div className="habit-info">
          <h3>{habit.name}</h3>
          <p className="habit-description">{habit.description}</p>
          {completionStatus.status === "completed" && (
            <div className="completion-badge">
              <Trophy size={16} />
              <span>Habit Formed!</span>
            </div>
          )}
        </div>
        <div className="habit-status">
          {isCompletedToday() ? (
            <div className="completed-today">
              <CheckCircle className="completed-icon" size={24} />
              <span className="completed-text">Done Today</span>
            </div>
          ) : completionStatus.status === "completed" ? (
            <div className="habit-completed">
              <Trophy className="trophy-icon" size={24} />
            </div>
          ) : (
            // Manual check-in disabled: Only AI can check in habits
            <div
              className="manual-checkin-disabled"
              title="Manual check-in disabled. Use AI update."
            >
              <CheckCircle
                size={20}
                style={{ opacity: 0.3, cursor: "not-allowed" }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="habit-stats">
        <div className="stat-item">
          <Flame size={16} style={{ color: getStreakColor() }} />
          <span className="stat-value" style={{ color: getStreakColor() }}>
            {habit.currentStreak}
          </span>
          <span className="stat-label">streak</span>
        </div>

        <div className="stat-item">
          <Calendar size={16} />
          <span className="stat-value">{habit.totalCompletions}</span>
          <span className="stat-label">total</span>
        </div>

        {habit.stakingAmount > 0 && (
          <div className="stat-item">
            <Zap size={16} />
            <span className="stat-value">{habit.stakingAmount}</span>
            <span className="stat-label">staked</span>
          </div>
        )}
      </div>

      <div className="habit-actions">
        <button
          className="post-update-btn"
          onClick={() => onPostUpdate(habit.id)}
          disabled={completionStatus.status === "completed"}
        >
          <MessageCircle size={16} />
          {completionStatus.status === "completed"
            ? "Habit Complete"
            : "Post Update"}
        </button>

        {habit.lastCompletedAt && (
          <span className="last-completed">
            Last: {format(new Date(habit.lastCompletedAt), "MMM d")}
          </span>
        )}
      </div>

      <div className="habit-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${completionStatus.progress}%`,
              backgroundColor:
                completionStatus.status === "completed" ? "#10b981" : "#3b82f6",
            }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-text">
            {completionStatus.status === "completed"
              ? "🎉 Habit Formed!"
              : `${habit.totalCompletions}/30 days (${completionStatus.progress}%)`}
          </span>
          {completionStatus.status === "active" && (
            <span className="days-remaining">
              {completionStatus.daysRemaining} days left
            </span>
          )}
        </div>
      </div>

      {/* Reward Status */}
      {/* Removed reward-status section as per new requirements */}
    </div>
  );
}
