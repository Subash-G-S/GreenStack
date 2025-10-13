// client/src/components/EfficiencyGauge.jsx
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function EfficiencyGauge({ value = 0 }) {
  return (
    <div style={{ width: 150, height: 150 }}>
      <CircularProgressbar
        value={value}
        text={`${value}/100`}
        strokeWidth={12}
        styles={buildStyles({
          textSize: "16px",
          textColor: "#0b1720",
          pathColor:
            value > 80 ? "#2bb673" : value > 50 ? "#f1c40f" : "#e74c3c",
          trailColor: "rgba(0,0,0,0.08)",
          pathTransitionDuration: 1.2, // smooth animation
        })}
      />
    </div>
  );
}
