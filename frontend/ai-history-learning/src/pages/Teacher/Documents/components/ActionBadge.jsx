import React from "react";
import { ACTION_BADGE } from "../constants/chatConstants";

export default function ActionBadge({ label, dark }) {
  const cfg = ACTION_BADGE[label];
  if (!cfg) return null;
  const { Icon } = cfg;
  const color  = dark ? cfg.darkColor  : cfg.color;
  const bg     = dark ? cfg.darkBg     : cfg.bg;
  const border = dark ? cfg.darkBorder : cfg.border;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 600, marginBottom: 9,
      padding: "4px 10px", borderRadius: 99,
      background: bg, color, border: `0.5px solid ${border}`,
      letterSpacing: "0.01em",
    }}>
      <Icon size={12} style={{ color, flexShrink: 0 }}/>
      {label}
    </div>
  );
}