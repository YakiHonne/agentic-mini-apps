import React from "react";
import {
  Brain,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";

export default function AIAnalysisSection({ analysis, habit }) {
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "#10b981";
      case "neutral":
        return "#6b7280";
      case "negative":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getRelevanceColor = (relevance) => {
    switch (relevance) {
      case "high":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getRewardStatus = (recommendation) => {
    switch (recommendation) {
      case "approved":
        return {
          icon: <CheckCircle size={16} />,
          color: "#10b981",
          text: "Reward Approved",
          description: "Great job! Your update shows genuine progress.",
        };
      case "pending":
        return {
          icon: <Clock size={16} />,
          color: "#f59e0b",
          text: "Under Review",
          description: "Your update is being reviewed for authenticity.",
        };
      case "rejected":
        return {
          icon: <AlertCircle size={16} />,
          color: "#ef4444",
          text: "Needs Improvement",
          description:
            "Please provide more specific details about your progress.",
        };
      default:
        return {
          icon: <AlertCircle size={16} />,
          color: "#6b7280",
          text: "Analyzing...",
          description: "AI is analyzing your update.",
        };
    }
  };

  const rewardStatus = getRewardStatus(analysis.rewardRecommendation);

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
            <span
              className="sentiment-indicator"
              style={{ backgroundColor: getSentimentColor(analysis.sentiment) }}
            />
            {analysis.sentiment}
            <span className="confidence">({analysis.confidence}%)</span>
          </div>
        </div>

        <div className="analysis-item">
          <div className="analysis-label">Habit Relevance</div>
          <div className="analysis-value">
            <TrendingUp
              size={16}
              style={{ color: getRelevanceColor(analysis.habitRelevance) }}
            />
            {analysis.habitRelevance}
          </div>
        </div>

        <div className="analysis-item">
          <div className="analysis-label">Reward Status</div>
          <div
            className="analysis-value reward-status"
            style={{ color: rewardStatus.color }}
          >
            {rewardStatus.icon}
            {rewardStatus.text}
          </div>
        </div>
      </div>

      {analysis.suggestion && (
        <div className="ai-suggestion">
          <div className="suggestion-header">
            <Award size={16} />
            AI Suggestion
          </div>
          <p>{analysis.suggestion}</p>
        </div>
      )}

      <div className="reward-breakdown">
        <div className="reward-info">
          <div className="reward-amount">
            {analysis.rewardRecommendation === "approved" ? (
              <span className="approved">+{habit.stakingAmount} sats</span>
            ) : (
              <span className="pending">0 sats</span>
            )}
          </div>
          <div className="reward-description">{rewardStatus.description}</div>
        </div>
      </div>

      {analysis.keywords && analysis.keywords.length > 0 && (
        <div className="keywords-section">
          <div className="keywords-label">Key Topics:</div>
          <div className="keywords">
            {analysis.keywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
