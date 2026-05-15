import React from "react";

export function SidebarItem({ Icon, label, sub, active, onClick, T }) {
  return (
    <button onClick={onClick} className="chatai-hbtn"
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8,
        padding: "7px 8px", borderRadius: 8, cursor: "pointer",
        border: "none", textAlign: "left",
        background: active ? "rgba(91,94,244,0.16)" : "transparent",
        outline: active ? "0.5px solid rgba(91,94,244,0.28)" : "0.5px solid transparent",
        transition: "background 0.15s",
      }}>
      <Icon size={14} style={{ color: active ? "#818cf8" : T.sbMuted, flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11.5, fontWeight: active ? 500 : 400,
          color: active ? T.sbBright : T.sbDim,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{label}</div>
        {sub && (
          <div style={{
            fontSize: 10, color: T.sbMuted,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{sub}</div>
        )}
      </div>
      {active && (
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#5b5ef4", flexShrink: 0 }}/>
      )}
    </button>
  );
}

export function ActionItem({ Icon, label, grad, onClick, T }) {
  return (
    <button onClick={onClick} className="chatai-action"
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 9,
        padding: "7px 8px", borderRadius: 8, cursor: "pointer",
        border: "none", background: "transparent", transition: "background 0.15s",
      }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7, background: grad, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={12} style={{ color: "#fff" }}/>
      </div>
      <span style={{ fontSize: 11.5, color: T.sbDim, fontWeight: 400 }}>{label}</span>
    </button>
  );
}