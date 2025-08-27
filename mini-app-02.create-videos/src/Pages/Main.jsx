import React, { useEffect } from "react";
import Videos from "../Components/Videos";

export default function Main() {
  return (
    <div className="fit-container fx-centered">
      <div style={{ width: "min(100%, 600px)" }}>
        <Videos />
      </div>
    </div>
  );
}
