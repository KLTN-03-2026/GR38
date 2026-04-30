import React from "react";

export default function ThemeToggle({ dark, onToggle, T }) {
  return (
    <button onClick={onToggle} className="chatai-bulb"
      title={dark ? "Chế độ sáng" : "Chế độ tối"}
      style={{
        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        border: `0.5px solid ${dark ? "rgba(250,204,21,0.35)" : T.btnBorder}`,
        background: dark ? "rgba(250,204,21,0.10)" : T.btnBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
      {dark ? (
        // Sun — click to go light
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.5"/>
          <line x1="12" y1="2"     x2="12" y2="4.5"/>
          <line x1="12" y1="19.5"  x2="12" y2="22"/>
          <line x1="4.22" y1="4.22"   x2="5.98"  y2="5.98"/>
          <line x1="18.02" y1="18.02" x2="19.78" y2="19.78"/>
          <line x1="2"    y1="12"  x2="4.5"  y2="12"/>
          <line x1="19.5" y1="12"  x2="22"   y2="12"/>
          <line x1="4.22"  y1="19.78" x2="5.98"  y2="18.02"/>
          <line x1="18.02" y1="5.98"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // Moon — click to go dark
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={T.btnIcon} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}