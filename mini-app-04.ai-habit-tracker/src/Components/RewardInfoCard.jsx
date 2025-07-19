import React from "react";
import { Zap, TrendingUp, Calendar, Gift, Target, Flame } from "lucide-react";
import {
  calculateDailyRewardAmount,
  getHabitCompletionStatus,
} from "../Helpers/PaymentHelpers";

export default function RewardInfoCard({
  stakedAmount,
  totalHabitDays,
  habitName,
  currentStreak = 1,
}) {
  const rewardInfo = calculateDailyRewardAmount(
    stakedAmount,
    totalHabitDays,
    currentStreak
  );
  const completionStatus = getHabitCompletionStatus(totalHabitDays);

  const getRewardMessage = () => {
    if (stakedAmount === 0) {
      return "Default daily reward: 30 sats per completion";
    } else {
      const dailyBase = Math.floor(stakedAmount / 30);
      return `Daily reward: ${dailyBase} sats (${stakedAmount} ÷ 30 days)`;
    }
  };

  const getStreakMessage = () => {
    if (currentStreak >= 7) {
      return "🔥 High streak: +50% bonus reward!";
    } else if (currentStreak >= 3) {
      return "⚡ Good streak: +25% bonus reward!";
    } else {
      return "💫 Build a 3+ day streak for bonus rewards!";
    }
  };

  const getRewardColor = () => {
    if (rewardInfo.streakLevel === "high") return "#dc2626"; // red
    if (rewardInfo.streakLevel === "medium") return "#f97316"; // orange
    return "#3b82f6"; // blue
  };

  const getRewardIcon = () => {
    if (rewardInfo.streakLevel === "high") return "🔥";
    if (rewardInfo.streakLevel === "medium") return "⚡";
    return "💫";
  };

  return (
    <div className="reward-info-card">
      <div className="reward-header">
        <div className="reward-title">
          <span className="reward-icon">{getRewardIcon()}</span>
          <h3>Daily Reward System</h3>
        </div>
        <div className="habit-status">
          <span className={`status-badge ${completionStatus.status}`}>
            {completionStatus.status === "completed"
              ? "🏆 Formed"
              : "🎯 Building"}
          </span>
        </div>
      </div>

      <div className="reward-breakdown">
        <div className="reward-row">
          <div className="reward-label">
            <Target size={16} />
            <span>Base Reward</span>
          </div>
          <div className="reward-value">
            <span className="base-reward">{rewardInfo.baseReward} sats</span>
          </div>
        </div>

        {rewardInfo.streakBonus > 0 && (
          <div className="reward-row">
            <div className="reward-label">
              <Flame size={16} />
              <span>Streak Bonus</span>
            </div>
            <div className="reward-value">
              <span
                className="streak-bonus"
                style={{ color: getRewardColor() }}
              >
                +{rewardInfo.streakBonus} sats
              </span>
            </div>
          </div>
        )}

        <div className="reward-row total-row">
          <div className="reward-label">
            <Zap size={16} />
            <span>Total Daily Reward</span>
          </div>
          <div className="reward-value">
            <span className="total-reward" style={{ color: getRewardColor() }}>
              {rewardInfo.totalReward} sats
            </span>
          </div>
        </div>

        <div className="reward-row">
          <div className="reward-label">
            <Calendar size={16} />
            <span>Progress</span>
          </div>
          <div className="reward-value">
            <span className="progress-text">
              {completionStatus.status === "completed"
                ? "Habit Formed!"
                : `${totalHabitDays}/30 days`}
            </span>
          </div>
        </div>
      </div>

      <div className="reward-explanation">
        <div className="explanation-item">
          <div className="explanation-icon">💡</div>
          <div className="explanation-content">
            <strong>How it works:</strong>
            <p>{getRewardMessage()}</p>
          </div>
        </div>

        <div className="explanation-item">
          <div className="explanation-icon">{getRewardIcon()}</div>
          <div className="explanation-content">
            <strong>Streak Bonus:</strong>
            <p>{getStreakMessage()}</p>
          </div>
        </div>

        {completionStatus.status === "active" && (
          <div className="explanation-item">
            <div className="explanation-icon">🎯</div>
            <div className="explanation-content">
              <strong>Goal:</strong>
              <p>
                Complete 30 days to form your habit!{" "}
                {completionStatus.daysRemaining} days remaining.
              </p>
            </div>
          </div>
        )}

        {completionStatus.status === "completed" && (
          <div className="explanation-item">
            <div className="explanation-icon">🏆</div>
            <div className="explanation-content">
              <strong>Congratulations!</strong>
              <p>
                You've successfully formed this habit! Amazing dedication! 🎉
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .reward-info-card {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin: 16px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .reward-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .reward-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reward-icon {
          font-size: 1.5rem;
          color: #f59e0b; /* Amber color for the icon */
        }

        .reward-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .habit-status {
          display: flex;
          align-items: center;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }

        .status-badge.active {
          background-color: #10b981; /* Green for active */
        }

        .status-badge.completed {
          background-color: #f59e0b; /* Amber for completed */
        }

        .reward-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .reward-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .reward-row.total-row {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-color: #f59e0b;
        }

        .reward-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-weight: 500;
        }

        .reward-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .base-reward {
          color: #1e293b;
        }

        .streak-bonus {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .total-reward {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .progress-text {
          font-size: 1.125rem;
          color: #64748b;
        }

        .reward-explanation {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .explanation-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .explanation-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .explanation-content strong {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
          display: block;
        }

        .explanation-content p {
          margin: 0;
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
