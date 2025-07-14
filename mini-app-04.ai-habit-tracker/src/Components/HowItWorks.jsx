import React, { useState } from "react";
import { Zap, Target, CheckCircle, MoreHorizontal } from "lucide-react";

export default function HowItWorks() {
  const [open, setOpen] = useState(false);
  const steps = [
    {
      icon: <Target size={20} />,
      title: "Stake",
      desc: "Choose a habit and lock in some sats to stay committed.",
    },
    {
      icon: <Zap size={20} />,
      title: "Post",
      desc: "Share daily progress – AI quickly checks authenticity.",
    },
    {
      icon: <CheckCircle size={20} />,
      title: "Zap Reward",
      desc: "Succeed and receive your stake plus a bonus back!",
    },
  ];

  return (
    <div className="how-it-works">
      <button className="how-toggle" onClick={() => setOpen((o) => !o)}>
        <MoreHorizontal size={18} />
        <span>{open ? "Hide How it works?" : "Show How it works?"}</span>
      </button>

      {open && (
        <div className="how-steps">
          {steps.map((s, i) => (
            <div key={i} className="how-card">
              <div className="how-icon">{s.icon}</div>
              <div className="how-info">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
