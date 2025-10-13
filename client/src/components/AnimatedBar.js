import React, { useEffect, useState } from "react";

export default function AnimatedBar({ value = 0, max = 1, color = "#2bb673", label = "" }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const pct = Math.min((value / max) * 100, 100);
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [value, max]);

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: 14, marginBottom: 4, fontWeight: "600" }}>
        {label}: {value} kg CO₂
      </div>
      <div
        style={{
          height: 14,
          background: "#e9ecef",
          borderRadius: 7,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: color,
            transition: "width 1.2s ease",
          }}
        />
      </div>
    </div>
  );
}
