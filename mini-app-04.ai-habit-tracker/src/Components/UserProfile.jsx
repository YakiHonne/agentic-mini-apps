import React from "react";
import { User, Zap, CheckCircle } from "lucide-react";

export default function UserProfile({ userData, hostUrl }) {
  if (!userData) {
    return (
      <div className="user-profile-card">
        <div className="user-avatar-placeholder"></div>
        <div className="user-info">
          <div className="user-name">Loading...</div>
          <div className="user-status">Connecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-section">
      <div className="user-profile-card">
        <div className="user-avatar-container">
          {userData.picture ? (
            <img
              src={userData.picture}
              alt="User avatar"
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              <User size={24} />
            </div>
          )}
        </div>

        <div className="user-info">
          <div className="user-name">
            {userData.display_name || userData.name || "Anonymous"}
          </div>
          <div className="user-status">
            <span className="status-indicator"></span>
            Connected to Nostr
          </div>
          {userData.nip05 && (
            <div className="user-handle">@{userData.nip05}</div>
          )}
        </div>

        <div className="user-badges">
          <div className="connection-badge">
            <CheckCircle size={16} />
            <span>Connected</span>
          </div>
          <div className="lightning-badge">
            <Zap size={16} />
            <span>Lightning Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
