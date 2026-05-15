import React from "react";
import { IconBot } from "../icons";
import { GRAD } from "../constants/chatConstants";

export default function TypingDots({ T }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: GRAD.indigo,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <IconBot size={14} style={{ color: "#fff" }}/>
      </div>
      <div style={{
        padding: "13px 16px", borderRadius: 16, borderBottomLeftRadius: 4,
        background: T.msgAiBg, border: `0.5px solid ${T.msgAiBorder}`,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#a5b4fc",
            display: "inline-block",
            animation: `chatai-bounce 1.2s ${i * 0.18}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}