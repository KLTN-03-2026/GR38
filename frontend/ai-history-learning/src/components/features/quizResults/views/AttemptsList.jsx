import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Clock } from "lucide-react";

// ── Score color (giống teacher) ───────────────────────────────────────────────
const scoreColor = (pct) =>
  pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

// ── Circle progress (copy từ Teacher HistoryModal) ────────────────────────────
function ScoreCircle({ score, total }) {
  const pct  = total > 0 ? Math.round((score / total) * 100) : 0;
  const col  = scoreColor(pct);
  const r    = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: col }}>{pct}%</span>
      </div>
    </div>
  );
}

// ==========================================
// ATTEMPTS LIST - giống hệt Teacher HistoryModal
// ==========================================
export default function AttemptsList({ attemptsList, onSelectAttempt }) {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(155deg,#F4F6FB 0%,#EEF2FF 100%)",
      padding: "32px 16px",
      fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
    }}>
      <div style={{ maxWidth: 580, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer",
            color: "#6b7280", fontWeight: 600, fontSize: 14,
            padding: 0, marginBottom: 14, fontFamily: "inherit",
          }}>
            <ArrowLeft size={16} /> Quay lại
          </button>

          {/* Title giống teacher: icon clock + text */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Clock size={16} style={{ color: "#f26739" }} />
            <h1 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: 0 }}>
              Lịch sử —{" "}
              <span style={{ color: "#f26739" }}>
                {attemptsList[0]?.totalQuestions ?? 0} câu
              </span>
            </h1>
          </div>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
            Bạn đã hoàn thành bài thi này {attemptsList.length} lần
          </p>
        </div>

        {/* List - giống hệt teacher rows */}
        <div style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #f3f4f6",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {attemptsList.map((attempt, idx) => {
            const score = attempt.score          ?? 0;
            const total = attempt.totalQuestions ?? 0;
            const pct   = total > 0 ? Math.round((score / total) * 100) : 0;
            const col   = scoreColor(pct);
            const dt    = new Date(attempt.createdAt);

            return (
              <div
                key={attempt._id}
                onClick={() => onSelectAttempt(attempt._id)}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px 20px",
                  borderBottom: idx < attemptsList.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Circle % */}
                <ScoreCircle score={score} total={total} />

                {/* Ngày giờ */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                    {dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    {" "}
                    {dt.toLocaleDateString("vi-VN")}
                  </p>
                </div>

                {/* Điểm bên phải */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: col, margin: 0 }}>
                    {score}/{total}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>câu đúng</p>
                </div>

                <ChevronRight size={14} style={{ color: "#d1d5db", flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}