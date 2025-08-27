import React, { useEffect } from "react";
import Curations from "../Components/Curations";

export default function Main() {
  return (
    <div className="fit-container fx-centered">
      <div style={{ width: "min(100%, 600px)" }}>
        <Curations />
      </div>
    </div>
  );
}
