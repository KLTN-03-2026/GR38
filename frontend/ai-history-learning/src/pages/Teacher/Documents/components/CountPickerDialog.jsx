// CountPickerDialog.jsx
import { useState } from "react";

const TIME_OPTIONS = [15, 20, 25, 30, 35, 40, 45];

export default function CountPickerDialog({ action, onConfirm, onCancel, dark, T }) {
  const isQuiz = action === "quiz";

  const [count, setCount] = useState(10);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);

  const maxCount = isQuiz ? 50 : 100;
  const minCount = 5;

  const handleConfirm = () => {
    onConfirm({ count, title: title.trim(), timeLimit: isQuiz ? timeLimit : undefined });
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: dark ? "#1a1a2e" : "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          animation: "dialogFadeIn 0.2s ease both",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 4, background: isQuiz ? "linear-gradient(90deg,#f97316,#ef4444)" : "linear-gradient(90deg,#8b5cf6,#6366f1)" }} />

        <div style={{ padding: "24px 24px 20px" }}>
          {/* Icon + Title */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: isQuiz ? "#fff7ed" : "#f5f3ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
              border: `1.5px solid ${isQuiz ? "#fed7aa" : "#ede9fe"}`,
            }}>
              {isQuiz ? "📋" : "🃏"}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f1f5f9" : "#111827", margin: 0 }}>
                Tạo {isQuiz ? "bài kiểm tra" : "Flashcard"} bằng AI?
              </p>
              <p style={{ fontSize: 12, color: dark ? "#94a3b8" : "#6b7280", marginTop: 4 }}>
                AI sẽ tự động phân tích và tạo {isQuiz ? "câu hỏi kiểm tra" : "thẻ ghi nhớ"} phù hợp.
              </p>
            </div>
          </div>

          {/* Tiêu đề */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: dark ? "#94a3b8" : "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Tiêu đề {isQuiz ? "bài kiểm tra" : "bộ thẻ"}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Nhập tiêu đề ${isQuiz ? "bài kiểm tra" : "bộ thẻ"}...`}
              style={{
                width: "100%", boxSizing: "border-box",
                border: `1.5px solid ${dark ? "#2d2d4a" : "#e5e7eb"}`,
                borderRadius: 12, padding: "10px 14px",
                fontSize: 13, color: dark ? "#f1f5f9" : "#111827",
                background: dark ? "#12122a" : "#f9fafb",
                outline: "none", transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => e.target.style.borderColor = isQuiz ? "#f97316" : "#8b5cf6"}
              onBlur={(e) => e.target.style.borderColor = dark ? "#2d2d4a" : "#e5e7eb"}
            />
          </div>

          {/* Số câu / thẻ */}
          <div style={{ marginBottom: isQuiz ? 18 : 24 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: dark ? "#94a3b8" : "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Số {isQuiz ? "câu hỏi" : "thẻ"}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setCount((c) => Math.max(minCount, c - 5))}
                style={{
                  width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${dark ? "#2d2d4a" : "#e5e7eb"}`,
                  background: dark ? "#12122a" : "#f9fafb", color: dark ? "#94a3b8" : "#374151",
                  fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, lineHeight: 1,
                }}
              >−</button>
              <div style={{
                flex: 1, textAlign: "center", fontSize: 22, fontWeight: 800,
                color: dark ? "#f1f5f9" : "#111827",
                border: `1.5px solid ${dark ? "#2d2d4a" : "#e5e7eb"}`,
                borderRadius: 12, padding: "8px 0",
                background: dark ? "#12122a" : "#f9fafb",
              }}>
                {count}
              </div>
              <button
                onClick={() => setCount((c) => Math.min(maxCount, c + 5))}
                style={{
                  width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${dark ? "#2d2d4a" : "#e5e7eb"}`,
                  background: dark ? "#12122a" : "#f9fafb", color: dark ? "#94a3b8" : "#374151",
                  fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, lineHeight: 1,
                }}
              >+</button>
            </div>
            <p style={{ fontSize: 11, color: dark ? "#64748b" : "#9ca3af", marginTop: 5, textAlign: "center" }}>
              Tối đa {maxCount} {isQuiz ? "câu" : "thẻ"} · Tối thiểu {minCount} {isQuiz ? "câu" : "thẻ"}
            </p>
          </div>

          {/* Thời gian — chỉ cho quiz */}
          {isQuiz && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: dark ? "#94a3b8" : "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Thời gian làm bài
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {TIME_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setTimeLimit(v)}
                    style={{
                      padding: "8px 0", borderRadius: 10,
                      fontSize: 11, fontWeight: 700,
                      border: `2px solid ${timeLimit === v ? "#f97316" : (dark ? "#2d2d4a" : "#e5e7eb")}`,
                      background: timeLimit === v ? "#fff7ed" : (dark ? "#12122a" : "#f9fafb"),
                      color: timeLimit === v ? "#f97316" : (dark ? "#94a3b8" : "#6b7280"),
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {v}p
                  </button>
                ))}
              </div>

              {/* Preview thời gian */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginTop: 10, padding: "9px 12px",
                borderRadius: 10, background: dark ? "#1c1c35" : "#fff7ed",
                border: `1px solid ${dark ? "#2d2d4a" : "#fed7aa"}`,
              }}>
                <svg width="14" height="14" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: 12, color: dark ? "#fb923c" : "#c2410c", fontWeight: 500 }}>
                  Thời gian: <strong>{timeLimit} phút</strong> · Kết thúc lúc{" "}
                  {(() => {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() + timeLimit);
                    return now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                  })()}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 12,
                border: `1.5px solid ${dark ? "#2d2d4a" : "#e5e7eb"}`,
                background: "transparent",
                color: dark ? "#94a3b8" : "#6b7280",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s",
                fontFamily: "inherit",
              }}
            >
              Huỷ
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 2, padding: "12px 0", borderRadius: 12,
                border: "none",
                background: isQuiz
                  ? "linear-gradient(90deg,#f97316,#ef4444)"
                  : "linear-gradient(90deg,#8b5cf6,#6366f1)",
                color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontFamily: "inherit",
                transition: "opacity 0.15s",
              }}
            >
              ✨ Tạo ngay
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dialogFadeIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}