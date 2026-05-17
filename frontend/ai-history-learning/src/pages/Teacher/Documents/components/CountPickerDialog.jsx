import { useState } from "react";

export default function ConceptPickerDialog({ onConfirm, onCancel, dark, T }) {
  const [concept, setConcept] = useState("");
  const [depth,   setDepth]   = useState("normal"); // "basic" | "normal" | "deep"

  const accent  = "#10b981";
  const gradBg  = "linear-gradient(135deg,#10b981,#06b6d4)";
  const bg      = dark ? "#1a1a2e" : "#fff";
  const surface = dark ? "#12122a" : "#f9fafb";
  const border  = dark ? "#2d2d4a" : "#e5e7eb";
  const textPrimary   = dark ? "#f1f5f9" : "#111827";
  const textSecondary = dark ? "#94a3b8" : "#6b7280";
  const textMuted     = dark ? "#64748b" : "#9ca3af";

  const DEPTH_OPTIONS = [
    { value: "basic",  label: "Cơ bản",   desc: "Giải thích ngắn gọn, dễ hiểu" },
    { value: "normal", label: "Thường",    desc: "Có ví dụ minh hoạ rõ ràng"    },
    { value: "deep",   label: "Chuyên sâu", desc: "Phân tích chi tiết, học thuật" },
  ];

  const canConfirm = concept.trim().length > 0;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div style={{ background: bg, borderRadius: 24, width: "100%", maxWidth: 430, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.28)", animation: "cpFadeIn 0.22s cubic-bezier(0.22,1,0.36,1) both" }}>

        {/* Top bar */}
        <div style={{ height: 4, background: gradBg }} />

        <div style={{ padding: "28px 26px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: dark ? "#0d2a22" : "#ecfdf5", border: `1.5px solid ${dark ? "#1a4a38" : "#a7f3d0"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: 0 }}>
                Giải thích khái niệm bằng AI
              </p>
              <p style={{ fontSize: 12.5, color: textSecondary, marginTop: 5, lineHeight: 1.6 }}>
                AI tra cứu trong tài liệu và giải thích khái niệm bạn chọn.
              </p>
            </div>
          </div>

          {/* Nhập khái niệm */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
              Khái niệm cần giải thích
            </label>
            <input
              value={concept}
              onChange={e => setConcept(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && canConfirm) onConfirm({ concept: concept.trim(), depth }); }}
              placeholder="VD: Chủ nghĩa Marx, DNA, Quang hợp..."
              autoFocus
              onFocus={e  => e.target.style.borderColor = accent}
              onBlur={e   => e.target.style.borderColor = border}
              style={{
                width: "100%", boxSizing: "border-box",
                border: `1.5px solid ${border}`, borderRadius: 12,
                padding: "11px 14px", fontSize: 13,
                color: textPrimary, background: surface,
                outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Mức độ */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 9 }}>
              Mức độ giải thích
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {DEPTH_OPTIONS.map(opt => {
                const isActive = depth === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setDepth(opt.value)}
                    style={{
                      flex: 1, padding: "10px 8px", borderRadius: 12, cursor: "pointer",
                      border: `1.5px solid ${isActive ? accent : border}`,
                      background: isActive ? (dark ? "#0d2a22" : "#ecfdf5") : surface,
                      transition: "all 0.15s", fontFamily: "inherit", textAlign: "center",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = dark ? "#0d2a22" : "#f0fdf4"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = surface; } }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? accent : textPrimary, marginBottom: 3 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 10, color: isActive ? (dark ? "#6ee7b7" : "#059669") : textMuted, lineHeight: 1.4 }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hint */}
          {canConfirm && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, padding: "10px 14px", borderRadius: 12, background: dark ? "#0d2a22" : "#ecfdf5", border: `1.5px solid ${dark ? "#1a4a38" : "#a7f3d0"}` }}>
              <svg width="14" height="14" fill="none" stroke={accent} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ fontSize: 12, color: dark ? "#6ee7b7" : "#065f46", fontWeight: 500 }}>
                Giải thích <strong>"{concept.trim()}"</strong> · Mức{" "}
                <strong>{DEPTH_OPTIONS.find(o => o.value === depth)?.label}</strong>
              </span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onCancel}
              style={{ flex: 1, padding: "13px 0", borderRadius: 14, border: `1.5px solid ${border}`, background: "transparent", color: textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = textSecondary; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = border; }}
            >Huỷ</button>
            <button
              disabled={!canConfirm}
              onClick={() => onConfirm({ concept: concept.trim(), depth })}
              style={{ flex: 2, padding: "13px 0", borderRadius: 14, border: "none", background: canConfirm ? gradBg : (dark ? "#1e1e30" : "#e5e7eb"), color: canConfirm ? "#fff" : textMuted, fontSize: 13, fontWeight: 700, cursor: canConfirm ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: canConfirm ? `0 4px 18px ${accent}44` : "none", transition: "all 0.15s" }}
              onMouseEnter={e => { if (canConfirm) { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={canConfirm ? "#fff" : textMuted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              Giải thích ngay
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cpFadeIn {
          from { opacity: 0; transform: scale(0.94) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}