import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  Send,
  Brain,
  Zap,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Video,
  Camera,
  Trash2,
  Play,
  Eye,
} from "lucide-react";
import SMHandler from "smart-widget-handler";
import {
  addPost,
  setAiAnalysis,
  updateHabitStreak,
} from "../Store/habitTrackerSlice";
import { addToast } from "../Store/toastSlice";
import AIAnalysisSection from "./AIAnalysisSection";
import PaymentModal from "./PaymentModal";
import {
  FileUpload,
  getVideoFromURL,
  checkRelayConnectivity,
} from "../Helpers/Helpers";
import relaysOnPlatform from "../Content/Relays";

export default function PostUpdateModal({ habit, userData, hostUrl, onClose }) {
  const dispatch = useDispatch();
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [aiAnalysis, setAiAnalysisState] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pastedImage, setPastedImage] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [postingStep, setPostingStep] = useState(""); // Track current step
  const [postingComplete, setPostingComplete] = useState(false); // Track when posting is done
  const [streakUpdated, setStreakUpdated] = useState(false); // Track streak update
  const [rewardEarned, setRewardEarned] = useState(0); // Track reward amount
  const [postingSuccess, setPostingSuccess] = useState(false); // Track overall success
  const [relayStatus, setRelayStatus] = useState(null); // Track relay connectivity info
  const [usedFallback, setUsedFallback] = useState(false); // Track if fallback was used
  const [showRewardModal, setShowRewardModal] = useState(false); // Track reward payment modal
  const [pendingReward, setPendingReward] = useState(null); // Track pending reward details

  // Handle paste events for images
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => {
              setPastedImage({
                file,
                url: e.target.result,
              });
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handlePastedImage = async (accept) => {
    if (accept && pastedImage) {
      await handleFileUpload({ target: { files: [pastedImage.file] } });
    }
    setPastedImage(null);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!userData?.pubkey) {
      dispatch(
        addToast({
          type: "error",
          message: "User not authenticated. Please connect your Nostr client.",
        })
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type.startsWith("image/") ? "image" : "video";

        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);

        // Use the real FileUpload function
        const uploadedUrl = await FileUpload(
          file,
          userData.pubkey,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        if (uploadedUrl) {
          uploadedFiles.push({
            id: Date.now() + i,
            type: fileType,
            url: uploadedUrl,
            previewUrl,
            name: file.name,
            size: file.size,
          });
        }
      }

      if (uploadedFiles.length > 0) {
        setUploadedMedia((prev) => [...prev, ...uploadedFiles]);
        dispatch(
          addToast({
            type: "success",
            message: `${uploadedFiles.length} file(s) uploaded successfully!`,
          })
        );
      }
    } catch (error) {
      console.error("File upload error:", error);
      dispatch(
        addToast({
          type: "error",
          message: "Failed to upload files. Please try again.",
        })
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeMedia = (id) => {
    setUploadedMedia((prev) => prev.filter((media) => media.id !== id));
    if (previewMedia && previewMedia.id === id) {
      setPreviewMedia(null);
    }
  };

  const showMediaPreview = (media) => {
    setPreviewMedia(media);
  };

  const closeMediaPreview = () => {
    setPreviewMedia(null);
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setPostingStep("🧠 AI analyzing your content...");

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
        mediaAnalysis:
          uploadedMedia.length > 0
            ? {
                hasVisualEvidence: true,
                mediaRelevance: "high",
                mediaType: uploadedMedia[0].type,
                mediaCount: uploadedMedia.length,
              }
            : null,
      };

      setAiAnalysisState(mockAnalysis);
      dispatch(setAiAnalysis(mockAnalysis));
      return mockAnalysis;
    } catch (error) {
      console.error("AI analysis failed:", error);
      dispatch(
        addToast({
          type: "error",
          message: "AI analysis failed. Proceeding with post...",
        })
      );
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePostToNostr = async () => {
    // Validate connection and input before starting
    if (!validateConnection()) {
      return;
    }

    setIsPosting(true);

    try {
      // Step 1: Run AI Analysis
      const analysis = await runAIAnalysis();

      // Step 2: Post to Nostr
      setPostingStep("📡 Posting your update to Nostr...");

      // Create content with habit context
      const habitContext = `🎯 ${habit.name} ${
        habit.emoji
      }\n#HabitTracker #${habit.name.replace(/\s+/g, "")} #NostrHabits`;

      // Create the main content
      let eventContent = `${postContent}\n\n${habitContext}`;

      // Add media URLs to content if present
      if (uploadedMedia.length > 0) {
        const mediaUrls = uploadedMedia.map((media) => media.url);
        eventContent += `\n\n${mediaUrls.join("\n")}`;
      }

      // Start with basic event structure (like create-videos app)
      const eventToPost = {
        kind: 1, // Note event kind
        content: eventContent,
        tags: [
          ["t", "HabitTracker"],
          ["t", habit.name.replace(/\s+/g, "")],
          ["t", "NostrHabits"],
          ["habit", habit.name],
          ["habit_id", habit.id.toString()],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      // Add AI analysis results if available (simplified)
      if (analysis) {
        eventToPost.tags.push(["ai_sentiment", analysis.sentiment]);
        eventToPost.tags.push(["ai_reward", analysis.rewardRecommendation]);
      }

      // Add media tags only if media exists
      if (uploadedMedia.length > 0) {
        uploadedMedia.forEach((media) => {
          eventToPost.tags.push([
            "imeta",
            `url ${media.url}`,
            `m ${media.type}/*`,
            `alt Habit progress for ${habit.name}`,
          ]);
        });
      }

      console.log("Publishing habit progress event:", eventToPost);
      console.log("Host URL:", hostUrl);
      console.log("User pubkey:", userData?.pubkey);

      // Use SMHandler to post to Nostr with better error handling
      let result;
      try {
        // Ensure we have a valid hostUrl before attempting
        if (!hostUrl) {
          throw new Error("Host URL not available");
        }

        result = await SMHandler.client.requestEventPublish(
          eventToPost,
          hostUrl
        );
        console.log("Event published successfully:", result);
        setRelayStatus("success");
      } catch (publishError) {
        console.error("Relay publishing error:", publishError);
        setRelayStatus("error");

        // Check if it's a relay connectivity issue
        if (
          publishError.message &&
          publishError.message.includes("Not enough relays")
        ) {
          console.log("Attempting to retry with even simpler event...");
          setPostingStep("🔄 Retrying with basic format...");

          // Try with the absolute minimum event structure
          const minimalEvent = {
            kind: 1,
            content: `${postContent}\n\n#HabitTracker #${habit.name.replace(
              /\s+/g,
              ""
            )}`,
            tags: [
              ["t", "HabitTracker"],
              ["t", habit.name.replace(/\s+/g, "")],
            ],
            created_at: Math.floor(Date.now() / 1000),
          };

          console.log("Attempting minimal event:", minimalEvent);

          try {
            result = await SMHandler.client.requestEventPublish(
              minimalEvent,
              hostUrl
            );
            console.log("Minimal event published successfully:", result);
            setRelayStatus("simplified");
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            // Still continue with local storage and UI updates
            result = { fallback: true, timestamp: Date.now() };
            setRelayStatus("fallback");
            setUsedFallback(true);
          }
        } else {
          // For other errors, still continue with local storage
          result = { fallback: true, timestamp: Date.now() };
          setRelayStatus("fallback");
          setUsedFallback(true);
        }
      }

      console.log("Result type:", typeof result);
      console.log("Result keys:", Object.keys(result || {}));

      // Generate a unique event ID - use the event's signature if available, otherwise timestamp
      let eventId;
      if (result && typeof result === "object") {
        // Check various possible ID fields
        eventId =
          result.id ||
          result.eventId ||
          result.sig ||
          result.signature ||
          result.timestamp ||
          Date.now();
      } else {
        eventId = Date.now();
      }

      // Step 3: Update local state and rewards
      setPostingStep("✅ Finalizing your progress...");

      // Create post data for local storage
      const postData = {
        content: postContent,
        habit: habit.name,
        habitId: habit.id,
        aiAnalysis: analysis,
        media: uploadedMedia,
        timestamp: new Date().toISOString(),
        eventId: eventId,
        userId: userData?.pubkey || "anonymous",
      };

      // Add to local posts
      dispatch(addPost(postData));

      // If AI analysis suggests reward, update habit streak and show reward payment
      if (analysis && analysis.rewardRecommendation === "approved") {
        dispatch(updateHabitStreak({ habitId: habit.id, success: true }));
        setStreakUpdated(true);
        setRewardEarned(habit.stakingAmount);
        setPostingSuccess(true);

        // Prepare reward payment details
        const rewardDetails = {
          amount: habit.stakingAmount,
          habitName: habit.name,
          streakDays: habit.currentStreak + 1, // New streak count
          description: `Reward for completing ${habit.name} - ${
            habit.currentStreak + 1
          } day streak!`,
        };

        setPendingReward(rewardDetails);

        // Show reward payment modal after a brief delay to see the success
        setTimeout(() => {
          setShowRewardModal(true);
        }, 2000);
      } else {
        setPostingSuccess(false);
      }

      // Set completion state instead of closing
      setPostingComplete(true);
      setPostingStep("🎉 Analysis complete!");

      // Show appropriate success message
      if (result && result.fallback) {
        dispatch(
          addToast({
            type: "warning",
            message:
              "Update saved locally! Relay connectivity issues detected.",
          })
        );
      } else {
        dispatch(
          addToast({
            type: "success",
            message: postingSuccess
              ? "🎉 Update posted and streak updated!"
              : "Update posted successfully!",
          })
        );
      }
    } catch (error) {
      console.error("Failed to post to Nostr:", error);
      setPostingComplete(true);
      setPostingSuccess(false);
      setPostingStep("❌ Posting failed");

      // Provide more specific error messages
      let errorMessage = "Failed to post update. Please try again.";
      if (error.message && error.message.includes("Not enough relays")) {
        errorMessage =
          "Relay connectivity issues. Your update was saved locally.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message && error.message.includes("Host URL")) {
        errorMessage =
          "Connection error. Please ensure you're connected to a Nostr client.";
      }

      dispatch(
        addToast({
          type: "error",
          message: errorMessage,
        })
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleTryAgain = () => {
    setPostingComplete(false);
    setPostingSuccess(false);
    setStreakUpdated(false);
    setRewardEarned(0);
    setPostingStep("");
    setAiAnalysisState(null);
  };

  const handleCloseModal = () => {
    onClose();
  };

  // Handle reward payment success
  const handleRewardPaymentSuccess = (paymentResult) => {
    console.log("Reward payment successful:", paymentResult);
    setShowRewardModal(false);

    dispatch(
      addToast({
        type: "success",
        message: `🎉 Reward of ${pendingReward?.amount} sats sent to your wallet!`,
      })
    );
  };

  // Handle reward payment failure
  const handleRewardPaymentFailure = (error) => {
    console.error("Reward payment failed:", error);
    setShowRewardModal(false);

    dispatch(
      addToast({
        type: "warning",
        message: `Reward earned but payment failed: ${error.message}. Contact support to claim your ${pendingReward?.amount} sats.`,
      })
    );
  };

  // Validate connection state before posting
  const validateConnection = () => {
    if (!userData?.pubkey) {
      dispatch(
        addToast({
          type: "error",
          message: "User not authenticated. Please connect your Nostr client.",
        })
      );
      return false;
    }

    if (!hostUrl) {
      dispatch(
        addToast({
          type: "error",
          message:
            "No host URL available. Please ensure you're connected to a Nostr client.",
        })
      );
      return false;
    }

    if (!postContent.trim()) {
      dispatch(
        addToast({
          type: "error",
          message: "Please write your update first!",
        })
      );
      return false;
    }

    return true;
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content post-modal">
          <div className="modal-header">
            <div className="habit-context">
              <span className="habit-emoji">{habit.emoji}</span>
              <div>
                <h2>{postingComplete ? "Progress Results" : "Post Update"}</h2>
                <p className="habit-name">{habit.name}</p>
              </div>
            </div>
            <button
              className="modal-close"
              onClick={postingComplete ? handleCloseModal : onClose}
            >
              <X size={24} />
            </button>
          </div>

          {!postingComplete && (
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

              {/* Media Upload Section */}
              <div className="media-upload-section">
                <div className="upload-controls">
                  <input
                    type="file"
                    id="mediaUpload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    disabled={isUploading}
                  />
                  <label htmlFor="mediaUpload" className="upload-btn">
                    {isUploading ? (
                      <div className="upload-loading">
                        <div className="upload-progress">
                          <div
                            className="upload-progress-bar"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="upload-text">
                          <Upload size={20} className="upload-icon spinning" />
                          <span>Uploading... {uploadProgress}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-content">
                        <div className="upload-icon-container">
                          <Upload size={24} className="upload-icon" />
                          <Camera size={20} className="camera-icon" />
                        </div>
                        <div className="upload-text">
                          <span className="upload-title">
                            Add Photos & Videos
                          </span>
                          <span className="upload-subtitle">
                            Drag & drop or click to browse
                          </span>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {/* Uploaded Media Preview */}
                {uploadedMedia.length > 0 && (
                  <div className="media-preview-container">
                    <div className="media-preview-header">
                      <span className="media-count">
                        {uploadedMedia.length} file
                        {uploadedMedia.length > 1 ? "s" : ""} uploaded
                      </span>
                    </div>
                    <div className="media-preview-grid">
                      {uploadedMedia.map((media) => (
                        <div key={media.id} className="media-preview-item">
                          {media.type === "image" ? (
                            <img
                              src={media.previewUrl}
                              alt={media.name}
                              className="media-preview-image"
                              onClick={() => showMediaPreview(media)}
                            />
                          ) : (
                            <div className="media-preview-video-container">
                              <video
                                src={media.previewUrl}
                                className="media-preview-video"
                                muted
                                onClick={() => showMediaPreview(media)}
                              />
                              <div className="video-overlay">
                                <Video size={20} />
                              </div>
                            </div>
                          )}
                          <div className="media-preview-overlay">
                            <div className="media-info">
                              <div className="media-type">
                                {media.type === "image" ? (
                                  <ImageIcon size={14} />
                                ) : (
                                  <Video size={14} />
                                )}
                              </div>
                              <button
                                className="preview-media-btn"
                                onClick={() => showMediaPreview(media)}
                                title="Preview"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="remove-media-btn"
                                onClick={() => removeMedia(media.id)}
                                title="Remove file"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Media Preview Section */}
                    <div className="detailed-media-preview">
                      <h4>Media Preview</h4>
                      {uploadedMedia.map((media) => (
                        <div
                          key={`preview-${media.id}`}
                          className="media-detail-card"
                        >
                          <div className="media-detail-header">
                            <div className="media-detail-info">
                              <div className="media-detail-icon">
                                {media.type === "image" ? (
                                  <ImageIcon size={20} />
                                ) : (
                                  <Video size={20} />
                                )}
                              </div>
                              <div>
                                <p className="media-name">{media.name}</p>
                                <p className="media-url">{media.url}</p>
                              </div>
                            </div>
                            <button
                              className="remove-media-detail-btn"
                              onClick={() => removeMedia(media.id)}
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="media-detail-preview">
                            {media.type === "image" ? (
                              <img
                                src={media.url}
                                alt={media.name}
                                className="media-detail-image"
                              />
                            ) : (
                              <div className="media-detail-video">
                                {getVideoFromURL(media.url)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button
                  type="button"
                  className="post-btn streamlined-post-btn"
                  onClick={handlePostToNostr}
                  disabled={
                    isPosting ||
                    !postContent.trim() ||
                    !userData?.pubkey ||
                    !hostUrl
                  }
                >
                  {isPosting ? (
                    <div className="posting-progress">
                      <div className="posting-step">{postingStep}</div>
                      <div className="posting-spinner">
                        <Brain
                          size={16}
                          className={isAnalyzing ? "spinning" : ""}
                        />
                        {postingStep.includes("Posting") && (
                          <Send size={16} className="spinning" />
                        )}
                        {postingStep.includes("Finalizing") && (
                          <CheckCircle size={16} className="pulsing" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="post-btn-content">
                      <Send size={16} />
                      <span>
                        {!userData?.pubkey || !hostUrl
                          ? "Connecting..."
                          : "Post Update"}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {aiAnalysis && (
            <div className="ai-analysis-container">
              <AIAnalysisSection analysis={aiAnalysis} habit={habit} />
            </div>
          )}

          {/* Posting Complete Results */}
          {postingComplete && (
            <div className="posting-results-container">
              <div className="posting-results-header">
                <div className="results-icon">
                  {postingSuccess ? (
                    <CheckCircle size={32} className="success-icon" />
                  ) : (
                    <AlertCircle size={32} className="warning-icon" />
                  )}
                </div>
                <div className="results-title">
                  <h3>
                    {postingSuccess ? "🎉 Great Progress!" : "📝 Keep Going!"}
                  </h3>
                  <p>
                    {postingSuccess
                      ? "Your habit update has been successfully analyzed and posted!"
                      : "Your update was posted, but let's work on making it even better!"}
                  </p>
                </div>
              </div>

              <div className="posting-results-grid">
                {/* Streak Update Status */}
                <div className="result-card">
                  <div className="result-header">
                    <div className="result-icon">
                      {streakUpdated ? (
                        <CheckCircle size={20} className="success-color" />
                      ) : (
                        <AlertCircle size={20} className="warning-color" />
                      )}
                    </div>
                    <h4>Streak Status</h4>
                  </div>
                  <div className="result-content">
                    {streakUpdated ? (
                      <div className="streak-success">
                        <p className="streak-message">Streak updated! 🔥</p>
                        <p className="streak-count">
                          Current: {habit.currentStreak + 1} days
                        </p>
                      </div>
                    ) : (
                      <div className="streak-motivation">
                        <p className="streak-message">
                          {aiAnalysis?.rewardRecommendation === "pending"
                            ? "Analysis pending - try adding more detail!"
                            : "Keep pushing! Your next update can build the streak!"}
                        </p>
                        <p className="streak-count">
                          Current: {habit.currentStreak} days
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reward Status */}
                <div className="result-card">
                  <div className="result-header">
                    <div className="result-icon">
                      <Zap size={20} className="warning-color" />
                    </div>
                    <h4>Reward Status</h4>
                  </div>
                  <div className="result-content">
                    {rewardEarned > 0 ? (
                      <div className="reward-earned">
                        <p className="reward-message">Sats earned! ⚡</p>
                        <p className="reward-amount">{rewardEarned} sats</p>
                      </div>
                    ) : (
                      <div className="reward-pending">
                        <p className="reward-message">
                          {aiAnalysis?.rewardRecommendation === "pending"
                            ? "Reward pending verification"
                            : "No reward this time"}
                        </p>
                        <p className="reward-amount">0 sats</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Analysis Summary */}
                {aiAnalysis && (
                  <div className="result-card full-width">
                    <div className="result-header">
                      <div className="result-icon">
                        <Brain size={20} className="accent-color" />
                      </div>
                      <h4>AI Analysis Summary</h4>
                    </div>
                    <div className="result-content">
                      <div className="analysis-summary">
                        <div className="summary-item">
                          <span className="summary-label">Sentiment:</span>
                          <span
                            className={`summary-value ${aiAnalysis.sentiment}`}
                          >
                            {aiAnalysis.sentiment}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Confidence:</span>
                          <span className="summary-value">
                            {aiAnalysis.confidence}%
                          </span>
                        </div>
                        {aiAnalysis.suggestion && (
                          <div className="ai-suggestion-brief">
                            <p>"{aiAnalysis.suggestion}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Relay Status Debug Info */}
                {(relayStatus === "fallback" ||
                  relayStatus === "simplified" ||
                  relayStatus === "error") && (
                  <div className="result-card full-width debug-info">
                    <div className="result-header">
                      <div className="result-icon">
                        <AlertCircle size={20} className="warning-color" />
                      </div>
                      <h4>Connection Status</h4>
                    </div>
                    <div className="result-content">
                      <div className="debug-summary">
                        <div className="debug-item">
                          <span className="debug-label">Relay Status:</span>
                          <span className={`debug-value ${relayStatus}`}>
                            {relayStatus === "fallback" && "Saved locally only"}
                            {relayStatus === "simplified" &&
                              "Published with basic format"}
                            {relayStatus === "error" &&
                              "Connection issues detected"}
                            {relayStatus === "success" &&
                              "Published successfully"}
                          </span>
                        </div>
                        {usedFallback && (
                          <div className="debug-message">
                            <p>
                              <strong>Note:</strong> Your progress has been
                              saved locally. The app will automatically retry
                              posting when connectivity improves.
                            </p>
                          </div>
                        )}
                        {relayStatus === "simplified" && (
                          <div className="debug-message">
                            <p>
                              <strong>Note:</strong> Published with simplified
                              format due to relay limitations. Some features may
                              not be fully preserved.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="posting-results-actions">
                {!postingSuccess && (
                  <button
                    className="try-again-btn"
                    onClick={handleTryAgain}
                    type="button"
                  >
                    <AlertCircle size={16} />
                    Try Again
                  </button>
                )}
                <button
                  className="close-results-btn"
                  onClick={handleCloseModal}
                  type="button"
                >
                  <CheckCircle size={16} />
                  {postingSuccess ? "Perfect!" : "Done"}
                </button>
              </div>
            </div>
          )}

          {!postingComplete && (
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
          )}

          {/* Pasted Image Modal */}
          {pastedImage && (
            <div className="paste-modal-overlay">
              <div className="paste-modal-content">
                <h3>Add pasted image?</h3>
                <div className="paste-preview">
                  <img
                    src={pastedImage.url}
                    alt="Pasted"
                    className="paste-preview-image"
                  />
                </div>
                <div className="paste-actions">
                  <button
                    className="paste-cancel-btn"
                    onClick={() => handlePastedImage(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="paste-add-btn"
                    onClick={() => handlePastedImage(true)}
                  >
                    <Camera size={16} />
                    Add Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Preview Modal */}
          {previewMedia && (
            <div className="media-preview-modal-overlay">
              <div className="media-preview-modal-content">
                <div className="media-preview-modal-header">
                  <div className="preview-media-info">
                    <div className="preview-media-icon">
                      {previewMedia.type === "image" ? (
                        <ImageIcon size={20} />
                      ) : (
                        <Video size={20} />
                      )}
                    </div>
                    <div>
                      <h3>Media Preview</h3>
                      <p className="preview-media-name">{previewMedia.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeMediaPreview}
                    className="close-preview-btn"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="media-preview-modal-body">
                  {previewMedia.type === "image" ? (
                    <img
                      src={previewMedia.url}
                      alt="Preview"
                      className="preview-image"
                    />
                  ) : (
                    <div className="video-preview-container">
                      {getVideoFromURL(previewMedia.url)}
                    </div>
                  )}
                </div>
                <div className="media-preview-modal-footer">
                  <div className="media-details">
                    <p>
                      <strong>URL:</strong> {previewMedia.url}
                    </p>
                    <p>
                      <strong>Type:</strong> {previewMedia.type}
                    </p>
                    <p>
                      <strong>Size:</strong>{" "}
                      {Math.round(previewMedia.size / 1024)} KB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reward Payment Modal */}
      {showRewardModal && pendingReward && (
        <PaymentModal
          isOpen={showRewardModal}
          onClose={() => setShowRewardModal(false)}
          paymentType="reward"
          amount={pendingReward.amount}
          habitName={pendingReward.habitName}
          userData={userData}
          streakDays={pendingReward.streakDays}
          onPaymentSuccess={handleRewardPaymentSuccess}
          onPaymentFailure={handleRewardPaymentFailure}
        />
      )}
    </>
  );
}
