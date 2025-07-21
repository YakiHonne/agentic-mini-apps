import React from "react";
import { Brain, TrendingUp, Zap, Target, Award, Eye } from "lucide-react";
import { calculateDailyRewardAmount } from "../Helpers/PaymentHelpers";

export default function AIAnalysisSection({ analysis, habit }) {
  if (!analysis) return null;

  // Calculate the reward amount using the same logic as PostUpdateModal
  const calculateRewardAmount = () => {
    if (!habit || analysis.rewardRecommendation !== "approved") {
      return 0;
    }

    // Calculate new streak (same logic as PostUpdateModal)
    const totalHabitDays = habit.totalCompletions + 1; // +1 for current completion
    const newStreak = habit.currentStreak + 1; // Assuming this is a new completion

    const rewardInfo = calculateDailyRewardAmount(
      habit.stakingAmount || 0,
      totalHabitDays,
      newStreak
    );

    return rewardInfo.totalReward;
  };

  const calculatedReward = calculateRewardAmount();

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "var(--success-color)";
      case "negative":
        return "var(--error-color)";
      default:
        return "var(--warning-color)";
    }
  };

  const getRewardStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "var(--success-color)";
      case "rejected":
        return "var(--error-color)";
      default:
        return "var(--warning-color)";
    }
  };

  return (
    <div className="ai-analysis-section">
      <div className="analysis-header">
        <Brain size={20} />
        <h3>AI Analysis Results</h3>
      </div>

      <div className="analysis-grid">
        <div className="analysis-item">
          <div className="analysis-label">Sentiment</div>
          <div className="analysis-value">
            <div
              className="sentiment-indicator"
              style={{ backgroundColor: getSentimentColor(analysis.sentiment) }}
            />
            <span style={{ textTransform: "capitalize" }}>
              {analysis.sentiment}
            </span>
            <span className="confidence">({analysis.confidence}%)</span>
          </div>
        </div>

        <div className="analysis-item">
          <div className="analysis-label">Habit Relevance</div>
          <div className="analysis-value">
            <Target size={16} />
            <span style={{ textTransform: "capitalize" }}>
              {analysis.habitRelevance}
            </span>
          </div>
        </div>

        <div className="analysis-item">
          <div className="analysis-label">Reward Status</div>
          <div className="analysis-value">
            <Award size={16} />
            <span
              className="reward-status"
              style={{
                color: getRewardStatusColor(analysis.rewardRecommendation),
                textTransform: "capitalize",
              }}
            >
              {analysis.rewardRecommendation}
            </span>
          </div>
        </div>

        {analysis.mediaAnalysis && (
          <div className="analysis-item">
            <div className="analysis-label">Media Evidence</div>
            <div className="analysis-value">
              <Eye size={16} />
              <span style={{ textTransform: "capitalize" }}>
                {analysis.mediaAnalysis.mediaRelevance}
              </span>
            </div>
          </div>
        )}
      </div>

      {analysis.suggestion && (
        <div className="ai-suggestion">
          <div className="suggestion-header">
            <TrendingUp size={16} />
            AI Insight
          </div>
          <p>{analysis.suggestion}</p>
        </div>
      )}

      {analysis.rewardRecommendation && habit.stakingAmount > 0 && (
        <div className="reward-breakdown">
          <div className="reward-info">
            <div className="reward-amount">
              <Zap size={16} />
              <span className={analysis.rewardRecommendation}>
                {analysis.rewardRecommendation === "approved"
                  ? `+${calculatedReward} sats`
                  : "Reward Pending"}
              </span>
            </div>
            <div className="reward-description">
              {analysis.rewardRecommendation === "approved"
                ? "Congratulations! Your progress has been verified."
                : "Complete the habit to earn your reward."}
            </div>
          </div>
        </div>
      )}

      {analysis.keywords && analysis.keywords.length > 0 && (
        <div className="keywords-section">
          <span className="keywords-label">Keywords:</span>
          <div className="keywords">
            {analysis.keywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.mediaAnalysis && (
        <div className="media-analysis-section">
          <div className="analysis-label">Media Analysis</div>
          <div className="media-analysis-details">
            <div className="media-stat">
              <span className="stat-label">Type:</span>
              <span className="stat-value">
                {analysis.mediaAnalysis.mediaType}
              </span>
            </div>
            <div className="media-stat">
              <span className="stat-label">Count:</span>
              <span className="stat-value">
                {analysis.mediaAnalysis.mediaCount}
              </span>
            </div>
            <div className="media-stat">
              <span className="stat-label">Relevance:</span>
              <span className="stat-value">
                {analysis.mediaAnalysis.mediaRelevance}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
