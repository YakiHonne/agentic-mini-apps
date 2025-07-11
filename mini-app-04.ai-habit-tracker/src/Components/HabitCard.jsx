import React from "react";
import { useDispatch } from "react-redux";
import { Flame, Calendar, Zap, MessageCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { updateHabitStreak } from "../Store/habitTrackerSlice";
import { addToast } from "../Store/toastSlice";

export default function HabitCard({ habit, onPostUpdate }) {
  const dispatch = useDispatch();

  const handleMarkComplete = () => {
    dispatch(updateHabitStreak({ habitId: habit.id, success: true }));
    dispatch(
      addToast({
        type: "success",
        message: `Great job! You completed "${habit.name}" 🎉`,
      })
    );
  };

  const isCompletedToday = () => {
    if (!habit.lastCompletedAt) return false;
    const today = new Date().toDateString();
    const lastCompleted = new Date(habit.lastCompletedAt).toDateString();
    return today === lastCompleted;
  };

  const getStreakColor = () => {
    if (habit.currentStreak === 0) return "#6b7280";
    if (habit.currentStreak < 7) return "#f59e0b";
    if (habit.currentStreak < 30) return "#f97316";
    return "#dc2626";
  };

  return (
    <div className="habit-card">
      <div className="habit-header">
        <div className="habit-emoji">{habit.emoji || "🎯"}</div>
        <div className="habit-info">
          <h3>{habit.name}</h3>
          <p className="habit-description">{habit.description}</p>
        </div>
        <div className="habit-status">
          {isCompletedToday() ? (
            <CheckCircle className="completed-icon" size={24} />
          ) : (
            <button
              className="complete-btn"
              onClick={handleMarkComplete}
              title="Mark as complete"
            >
              <CheckCircle size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="habit-stats">
        <div className="stat-item">
          <Flame size={16} style={{ color: getStreakColor() }} />
          <span className="stat-value">{habit.currentStreak}</span>
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
            <span className="stat-label">sats</span>
          </div>
        )}
      </div>

      <div className="habit-actions">
        <button
          className="post-update-btn"
          onClick={() => onPostUpdate(habit.id)}
        >
          <MessageCircle size={16} />
          Post Update
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
              width: `${Math.min((habit.currentStreak / 30) * 100, 100)}%`,
            }}
          />
        </div>
        <span className="progress-text">{habit.currentStreak}/30 days</span>
      </div>
    </div>
  );
}
