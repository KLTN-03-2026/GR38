import { useState } from "react";

export default function CountPickerDialog({ action, onConfirm, onCancel, dark, T }) {
  const isQuiz = action === "quiz";

  const [count,     setCount]     = useState(10);
  const [title,     setTitle]     = useState("");
  const [timeLimit, setTimeLimit] = useState(30);

  const maxCount = isQuiz ? 50 : 100;
  const minCount = 5;

  const accent  = isQuiz ? "#f97316" : "#8b5cf6";
  const gradBg  = isQuiz ? "linear-gradient(135deg,#f97316,#ef4444)" : "linear-gradient(135deg,#8b5cf6,#6366f1)";
  const bg      = dark ? "#1a1a2e" : "#fff";
  const surface = dark ? "#12122a" : "#f9fafb";
  const border  = dark ? "#2d2d4a" : "#e5e7eb";
  const textPrimary   = dark ? "#f1f5f9" : "#111827";
  const textSecondary = dark ? "#94a3b8" : "#6b7280";
  const textMuted     = dark ? "#64748b" : "#9ca3af";

  const StepBtn = ({ onClick, children }) => (
    <button onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        border: `1.5px solid ${border}`, background: surface,
        color: textSecondary, fontSize: 22, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1, transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; e.currentTarget.style.background = dark ? "#1c1c35" : "#fff7ed"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textSecondary; e.currentTarget.style.background = surface; }}
    >{children}</button>
  );

  const BigInput = ({ value, onChange, onBlur }) => (
    <input
      type="number"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={e => e.target.style.borderColor = accent}
      style={{
        width: "100%", textAlign: "center", fontSize: 28, fontWeight: 800,
        color: textPrimary, border: `1.5px solid ${border}`,
        borderRadius: 12, padding: "10px 0", background: surface,
        outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
        boxSizing: "border-box",
      }}
    />
  );

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
            <div style={{ width: 58, height: 58, borderRadius: 18, background: dark ? "#1c1c35" : "#fff7ed", border: `1.5px solid ${dark ? "#2d2d4a" : "#fed7aa"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isQuiz ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="2"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3"/>
                  <path d="M12 4v16M2 12h20"/>
                </svg>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: 0 }}>
                Tạo {isQuiz ? "bài kiểm tra" : "Flashcard"} bằng AI
              </p>
              <p style={{ fontSize: 12.5, color: textSecondary, marginTop: 5, lineHeight: 1.6 }}>
                AI phân tích tài liệu và tạo {isQuiz ? "câu hỏi kiểm tra" : "thẻ ghi nhớ"} tự động.
              </p>
            </div>
          </div>

          {/* Tiêu đề */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
              Tiêu đề {isQuiz ? "bài kiểm tra" : "bộ thẻ"}
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`Nhập tiêu đề ${isQuiz ? "bài kiểm tra" : "bộ thẻ"}...`}
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

          {/* Số câu */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Số {isQuiz ? "câu hỏi" : "thẻ"}
              </label>
              <span style={{ fontSize: 11, color: textMuted, background: dark ? "#12122a" : "#f3f4f6", padding: "2px 8px", borderRadius: 20 }}>
                {minCount} – {maxCount}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", gap: 10, alignItems: "center" }}>
              <StepBtn onClick={() => setCount(c => Math.max(minCount, Number(c) - 5))}>−</StepBtn>
              <BigInput
                value={count}
                onChange={e => {
                  const v = e.target.value;
                  if (v === "") { setCount(""); return; }
                  if (Number(v) > maxCount) { setCount(maxCount); return; }
                  setCount(Number(v));
                }}
                onBlur={e => {
                  const v = Number(e.target.value);
                  setCount(Math.min(maxCount, Math.max(minCount, isNaN(v) || e.target.value === "" ? minCount : v)));
                  e.target.style.borderColor = border;
                }}
              />
              <StepBtn onClick={() => setCount(c => Math.min(maxCount, Number(c) + 5))}>+</StepBtn>
            </div>
          </div>

          {/* Thời gian */}
          {isQuiz && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Thời gian làm bài
                </label>
                <span style={{ fontSize: 11, color: textMuted, background: dark ? "#12122a" : "#f3f4f6", padding: "2px 8px", borderRadius: 20 }}>
                  15 – 45 phút
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", gap: 10, alignItems: "center" }}>
                <StepBtn onClick={() => setTimeLimit(t => Math.max(15, Number(t) - 5))}>−</StepBtn>
                <BigInput
                  value={timeLimit}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === "") { setTimeLimit(""); return; }
                    if (Number(v) > 45) { setTimeLimit(45); return; }
                    setTimeLimit(Number(v));
                  }}
                  onBlur={e => {
                    const v = Number(e.target.value);
                    setTimeLimit(Math.min(45, Math.max(15, isNaN(v) || e.target.value === "" ? 15 : v)));
                    e.target.style.borderColor = border;
                  }}
                />
                <StepBtn onClick={() => setTimeLimit(t => Math.min(45, Number(t) + 5))}>+</StepBtn>
              </div>

              {/* Preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "10px 14px", borderRadius: 12, background: dark ? "#1c1c35" : "#fff7ed", border: `1.5px solid ${dark ? "#2d2d4a" : "#fed7aa"}` }}>
                <svg width="14" height="14" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span style={{ fontSize: 12, color: dark ? "#fb923c" : "#c2410c", fontWeight: 500 }}>
                  Thời gian: <strong>{timeLimit} phút</strong> · Kết thúc lúc{" "}
                  {(() => { const n = new Date(); n.setMinutes(n.getMinutes() + Number(timeLimit)); return n.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }); })()}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onCancel}
              style={{ flex: 1, padding: "13px 0", borderRadius: 14, border: `1.5px solid ${border}`, background: "transparent", color: textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = textSecondary; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = border; }}
            >Huỷ</button>
            <button
              onClick={() => onConfirm({ count: Number(count), title: title.trim(), timeLimit: isQuiz ? Number(timeLimit) : undefined })}
              style={{ flex: 2, padding: "13px 0", borderRadius: 14, border: "none", background: gradBg, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 18px ${accent}44`, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              Tạo ngay
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cpFadeIn {
          from { opacity: 0; transform: scale(0.94) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}