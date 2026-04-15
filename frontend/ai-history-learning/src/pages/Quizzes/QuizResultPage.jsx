import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
export default function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDetail, setShowDetail] = useState(false);
  const [animPercent, setAnimPercent] = useState(0);
  const detailRef = useRef(null);
  const { quiz, answers, score, total, questions, answered } = location.state ?? {};
  const isCompleted = !!quiz && answered > 0;
  const percent = !quiz || answered === 0 ? 0 : Math.round((score / total) * 100);
  const colorClass =
    !isCompleted ? "red" : percent >= 80 ? "green" : percent >= 50 ? "yellow" : "red";
  const colors = {
    green:  { text: "#10B981", fill: "#10B981" },
    yellow: { text: "#F59E0B", fill: "#F59E0B" },
    red:    { text: "#EF4444", fill: "#EF4444" },
  };
  const c = colors[colorClass];
  const resultIcon = !isCompleted ? "😔" : percent >= 80 ? "👑" : percent >= 50 ? "🎯" : "💪";
  useEffect(() => {
    if (!quiz) return;
    let start = null;
    const duration = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimPercent(Math.round(ease * percent));
      if (p < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), 400);
    return () => clearTimeout(timer);
  }, [percent, quiz]);

  if (!quiz) {
    navigate("/teacher/quizzes");
    return null;
  }
  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        @keyframes qr-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes qr-scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes qr-pillPop {
          0%   { opacity: 0; transform: scale(0.75) translateY(6px); }
          70%  { transform: scale(1.06) translateY(-1px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes qr-iconBounce {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(6deg); opacity: 1; }
          80%  { transform: scale(0.92) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes qr-progressFill {
          from { width: 0%; }
        }
        @keyframes qr-slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes qr-cardReveal {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .qr-back-btn {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #6B7280; font-weight: 500;
          background: none; border: none; cursor: pointer;
          padding: 6px 10px; border-radius: 8px;
          transition: background 0.15s, color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .qr-back-btn:hover { background: #F3F4F6; color: #111827; }
        .qr-toggle-btn {
          width: 100%;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          background: #fff;
          padding: 12px 16px;
          font-size: 13px; font-weight: 500; color: #374151;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 14px;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .qr-toggle-btn:hover { background: #FFF9F7; border-color: #F26739; color: #F26739; }
        .qr-toggle-chevron {
          display: flex; align-items: center;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .qr-toggle-chevron.open { transform: rotate(180deg); }
        .qr-q-card {
          background: #fff;
          border: 1px solid #F0EDE8;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 10px;
          animation: qr-cardReveal 0.3s ease both;
        }

        .qr-opt {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px; border: 1px solid;
          font-size: 13px; margin-bottom: 6px;
        }
        .qr-opt.answer { border-color: #6EE7B7; background: #F0FDF9; color: #065F46; }
        .qr-opt.chosen { border-color: #FCA5A5; background: #FFF5F5; color: #991B1B; }
        .qr-opt.neutral{ border-color: #F3F4F6; background: transparent; color: #9CA3AF; }
        .qr-back-main {
          width: 100%; background: #F26739;
          border: none; border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 500;
          padding: 13px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, transform 0.1s;
          animation: qr-fadeUp 0.35s ease 0.65s both;
        }
        .qr-back-main:hover  { background: #E05530; }
        .qr-back-main:active { transform: scale(0.98); }
      `}</style>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #F0EDE8",
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "qr-fadeUp 0.3s ease both",
      }}>
        <button className="qr-back-btn" onClick={() => navigate(-1)}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Trở về
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>

        {/* Summary Card */}
        <div style={{
          background: "#fff", border: "1px solid #F0EDE8",
          borderRadius: 20, padding: "28px 24px 22px",
          textAlign: "center", position: "relative", overflow: "hidden",
          animation: "qr-scaleIn 0.4s cubic-bezier(0.34,1.36,0.64,1) 0.1s both",
          marginBottom: 14,
        }}>
          {/* Status badge */}
          <span style={{
            position: "absolute", top: 14, left: 14,
            fontSize: 11, fontWeight: 600, color: "#fff",
            padding: "4px 12px", borderRadius: 999,
            background: isCompleted ? "#10B981" : "#EF4444",
            animation: "qr-pillPop 0.45s cubic-bezier(0.34,1.36,0.64,1) 0.35s both",
          }}>
            {isCompleted ? "Hoàn Thành" : "Không Hoàn Thành"}
          </span>

          {/* Icon */}
          <div style={{ fontSize: 44, marginBottom: 10, animation: "qr-iconBounce 0.6s cubic-bezier(0.34,1.36,0.64,1) 0.2s both" }}>
            {resultIcon}
          </div>

          {/* Title */}
          <p style={{
            fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 14,
            animation: "qr-fadeUp 0.4s ease 0.3s both",
          }}>
            {quiz.title}
          </p>

          {/* Percent */}
          <p style={{
            fontSize: 52, fontWeight: 600, lineHeight: 1,
            color: c.text, marginBottom: 4,
            animation: "qr-fadeUp 0.4s ease 0.4s both",
          }}>
            {animPercent}%
          </p>
          <p style={{
            fontSize: 12, color: "#9CA3AF", marginBottom: 18,
            animation: "qr-fadeUp 0.3s ease 0.45s both",
          }}>
            Điểm số của bạn
          </p>

          {/* Progress bar */}
          <div style={{
            height: 6, background: "#F3F0EA", borderRadius: 999,
            overflow: "hidden", marginBottom: 20,
            animation: "qr-fadeUp 0.3s ease 0.45s both",
          }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: c.fill, width: `${percent}%`,
              animation: "qr-progressFill 0.8s cubic-bezier(0.4,0,0.2,1) 0.6s both",
            }} />
          </div>

          {/* Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: `Hoàn thành ${answered}/${total} câu`, bg: "#FEF9C3", color: "#854D0E", delay: "0.6s" },
              { label: `Đúng ${score} câu`, bg: "#D1FAE5", color: "#065F46", delay: "0.7s" },
              { label: `Sai ${answered - score} câu`, bg: "#FEE2E2", color: "#991B1B", delay: "0.8s" },
            ].map((p) => (
              <span key={p.label} style={{
                fontSize: 12, fontWeight: 500,
                padding: "6px 14px", borderRadius: 999,
                background: p.bg, color: p.color,
                animation: `qr-pillPop 0.4s cubic-bezier(0.34,1.36,0.64,1) ${p.delay} both`,
              }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Toggle detail */}
        <button className="qr-toggle-btn" onClick={() => setShowDetail(!showDetail)}>
          <span>{showDetail ? "Ẩn chi tiết" : "Xem chi tiết đúng / sai"}</span>
          <span className={`qr-toggle-chevron${showDetail ? " open" : ""}`}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {/* Detail cards */}
        {showDetail && (
          <div ref={detailRef} style={{ animation: "qr-slideDown 0.3s ease both", marginBottom: 14 }}>
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const isAnswered = userAnswer !== undefined;
              const isCorrect = isAnswered && userAnswer === q.answer;

              return (
                <div key={i} className="qr-q-card" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#111827", lineHeight: 1.5 }}>
                      Câu {i + 1}: {q.q}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
                      background: !isAnswered ? "#F3F4F6" : isCorrect ? "#D1FAE5" : "#FEE2E2",
                      color: !isAnswered ? "#6B7280" : isCorrect ? "#065F46" : "#991B1B",
                    }}>
                      {!isAnswered ? "Chưa làm" : isCorrect ? "Đúng ✓" : "Sai ✗"}
                    </span>
                  </div>

                  {q.options.map((opt, j) => {
                    const isAnswer = j === q.answer;
                    const isChosen = j === userAnswer;
                    const cls = isAnswer ? "answer" : isChosen ? "chosen" : "neutral";
                    return (
                      <div key={j} className={`qr-opt ${cls}`}>
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: isAnswer ? "#10B981" : isChosen ? "#EF4444" : "#D1D5DB",
                        }} />
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isAnswer && isChosen && (
                          <span style={{ fontSize: 11, color: "#10B981", marginLeft: "auto", fontWeight: 500 }}>✓ Đáp án · Bạn chọn</span>
                        )}
                        {isAnswer && !isChosen && (
                          <span style={{ fontSize: 11, color: "#10B981", marginLeft: "auto", fontWeight: 500 }}>✓ Đáp án đúng</span>
                        )}
                        {isChosen && !isAnswer && (
                          <span style={{ fontSize: 11, color: "#EF4444", marginLeft: "auto", fontWeight: 500 }}>✗ Bạn chọn</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        <button className="qr-back-main" onClick={() => navigate("/teacher/quizzes")}>
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
}