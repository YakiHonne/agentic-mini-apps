import React, { useEffect } from "react";
import ZapPoll from "../Components/ZapPoll";

export default function Main() {
  return (
    <div className="fit-container fx-centered">
      <div style={{ width: "min(100%, 600px)" }}>
        <ZapPoll />
      </div>
    </div>
  );
}
