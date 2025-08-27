import React, { useState } from "react";
import { nip19 } from "nostr-tools";
import MentionSuggestions from "./MentionSuggestions";

export default function UserSearchBar({ onClick, full = false, placeholder }) {
  const [keyword, setKeyword] = useState("");

  const handleKeyword = (e) => {
    let value = e.target.value;

    try {
      if (value.includes("nprofile")) {
        let data = nip19.decode(value);
        onClick(data.data.pubkey);
        return;
      }
      if (value.includes("npub")) {
        let hex = nip19.decode(value);
        onClick(hex.data);
        return;
      }
      setKeyword(value);
    } catch (err) {
      setKeyword(value);
    }
  };

  const setSelectedMention = (data) => {
    onClick(nip19.decode(data).data);
    setKeyword("");
  };

  return (
    <div
      className={full ? "fx-centered fit-container" : "fx-centered"}
      style={{ position: "relative", zIndex: "101" }}
    >
      <label
        className="fx-centered fx-start-h if search-if"
        htmlFor="search-input"
        style={{
          width: full ? "100%" : "450px",
          cursor: "default",
          position: "relative",
          paddingRight: "0",
        }}
      >
        <div className="search-24"></div>
        <input
          id="search-input"
          type="search"
          className="if ifs-full"
          placeholder={placeholder || "Search by name, npub, nprofile"}
          value={keyword}
          style={{ paddingLeft: ".5rem" }}
          onChange={handleKeyword}
        />
        {keyword && (
          <MentionSuggestions
            mention={keyword}
            setSelectedMention={setSelectedMention}
          />
        )}
      </label>
    </div>
  );
}
