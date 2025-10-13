import React, { useEffect, useState } from "react";

export default function AnimatedCounter({ value = 0, duration = 1000, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (isNaN(end)) return;

    const increment = end / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <div style={{ fontSize: "24px", fontWeight: "700" }}>
      {count.toFixed(3)} {suffix}
    </div>
  );
}
