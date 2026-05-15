import { useState, useEffect } from "react";

// ==========================================
// PERCENT RING - Vòng tròn hiển thị % có animation đếm lên
// ==========================================
export default function PercentRing({ percent, color }) {
  const [cur, setCur] = useState(0);
  const r    = 58;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    let val = 0;
    const steps = 80;
    const inc   = percent / steps;
    const t = setInterval(() => {
      val += inc;
      if (val >= percent) { setCur(percent); clearInterval(t); }
      else setCur(Math.round(val));
    }, 18);
    return () => clearInterval(t);
  }, [percent]);

  const offset = circ - (cur / 100) * circ;

  return (
    <div style={{ position: "relative", width: 148, height: 148 }}>
      <svg width="148" height="148" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="74" cy="74" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
        <circle
          cx="74" cy="74" r={r} fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.018s linear",
            filter: `drop-shadow(0 0 8px ${color}99)`,
          }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 34, fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 24px ${color}55` }}>
          {cur}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#9CA3AF" }}>%</span>
      </div>
    </div>
  );
}