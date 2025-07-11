import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  Send,
  Brain,
  Zap,
  MessageCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import SMHandler from "smart-widget-handler";
import {
  addPost,
  setAiAnalysis,
  updateHabitStreak,
} from "../Store/habitTrackerSlice";
import { addToast } from "../Store/toastSlice";
import AIAnalysisSection from "./AIAnalysisSection";

export default function PostUpdateModal({ habit, userData, hostUrl, onClose }) {
  const dispatch = useDispatch();
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [aiAnalysis, setAiAnalysisState] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    if (!postContent.trim()) {
      dispatch(
        addToast({
          type: "error",
          message: "Please write your update first!",
        })
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      // Mock AI analysis for now - in real implementation, this would call an AI service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAnalysis = {
        sentiment: Math.random() > 0.3 ? "positive" : "neutral",
        confidence: Math.floor(Math.random() * 20) + 80,
        keywords: ["progress", "commitment", "habit", "growth"],
        suggestion:
          "Great progress! Your commitment to this habit is showing through your consistent updates.",
        habitRelevance: Math.random() > 0.2 ? "high" : "medium",
        rewardRecommendation: Math.random() > 0.4 ? "approved" : "pending",
      };

      setAiAnalysisState(mockAnalysis);
      dispatch(setAiAnalysis(mockAnalysis));

      dispatch(
        addToast({
          type: "success",
          message: "AI analysis completed!",
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: "Failed to analyze post. Please try again.",
        })
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePostToNostr = async () => {
    if (!postContent.trim()) {
      dispatch(
        addToast({
          type: "error",
          message: "Please write your update first!",
        })
      );
      return;
    }

    if (!hostUrl) {
      dispatch(
        addToast({
          type: "error",
          message: "No host URL available for posting",
        })
      );
      return;
    }

    setIsPosting(true);
    try {
      // Create the Nostr event
      const eventToPost = {
        kind: 1, // Note event kind
        content: `${postContent}\n\n🎯 ${habit.name} ${
          habit.emoji
        }\n#HabitTracker #${habit.name.replace(/\s+/g, "")} #NostrHabits`,
        tags: [
          ["t", "HabitTracker"],
          ["t", habit.name.replace(/\s+/g, "")],
          ["t", "NostrHabits"],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      console.log("Publishing event:", eventToPost);

      // Use SMHandler to post to Nostr
      const result = await SMHandler.client.requestEventPublish(
        eventToPost,
        hostUrl
      );

      console.log("Event published successfully:", result);

      // Create post data for local storage
      const postData = {
        content: postContent,
        habit: habit.name,
        habitId: habit.id,
        aiAnalysis: aiAnalysis,
        timestamp: new Date().toISOString(),
        eventId: result.id || Date.now(),
        userId: userData?.pubkey || "anonymous",
      };

      // Add to local posts
      dispatch(addPost(postData));

      // If AI analysis suggests reward, update habit streak
      if (aiAnalysis && aiAnalysis.rewardRecommendation === "approved") {
        dispatch(updateHabitStreak({ habitId: habit.id, success: true }));
        dispatch(
          addToast({
            type: "success",
            message: `🎉 Habit progress recorded! You've earned ${habit.stakingAmount} sats!`,
          })
        );
      } else {
        dispatch(
          addToast({
            type: "success",
            message: "Update posted to Nostr successfully!",
          })
        );
      }

      onClose();
    } catch (error) {
      console.error("Failed to post to Nostr:", error);
      dispatch(
        addToast({
          type: "error",
          message: "Failed to post update. Please try again.",
        })
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content post-modal">
        <div className="modal-header">
          <div className="habit-context">
            <span className="habit-emoji">{habit.emoji}</span>
            <div>
              <h2>Post Update</h2>
              <p className="habit-name">{habit.name}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="post-form">
          <div className="form-group">
            <label htmlFor="postContent">
              <MessageCircle size={16} />
              Share your progress
            </label>
            <textarea
              id="postContent"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={`Tell us about your progress with "${habit.name}". What did you accomplish today? How are you feeling about your journey?`}
              rows="4"
              className="post-textarea"
            />
          </div>

          <div className="post-actions">
            <button
              type="button"
              className="ai-analyze-btn"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || !postContent.trim()}
            >
              <Brain size={16} />
              {isAnalyzing ? "Analyzing..." : "AI Analysis"}
            </button>

            <button
              type="button"
              className="post-btn"
              onClick={handlePostToNostr}
              disabled={isPosting || !postContent.trim()}
            >
              <Send size={16} />
              {isPosting ? "Posting..." : "Post to Nostr"}
            </button>
          </div>
        </div>

        {aiAnalysis && (
          <AIAnalysisSection analysis={aiAnalysis} habit={habit} />
        )}

        <div className="post-info">
          <div className="info-item">
            <Zap size={16} />
            <span>Staked: {habit.stakingAmount} sats</span>
          </div>
          <div className="info-item">
            <CheckCircle size={16} />
            <span>Streak: {habit.currentStreak} days</span>
          </div>
          <div className="info-item">
            <AlertCircle size={16} />
            <span>AI will analyze your post for authenticity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
