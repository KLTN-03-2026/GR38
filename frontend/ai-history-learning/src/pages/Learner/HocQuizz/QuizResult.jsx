import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizService } from "../../../services/quizService";

function Particles({ active }) {
  if (!active) return null;
  const items = Array.from({ length: 25 }, (_, i) => ({
    angle: (i / 25) * 360,
    dist: 60 + (i % 3) * 30,
    size: 4 + (i % 4),
    col: ["#F26739", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"][i % 7],
    delay: (i * 0.04).toFixed(2),
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {items.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <div key={i} style={{
            position: "absolute", width: p.size, height: p.size, borderRadius: i % 4 === 0 ? "2px" : "50%",
            background: p.col, top: "50%", left: "50%",
            "--tx": `${Math.cos(rad) * p.dist}px`, "--ty": `${Math.sin(rad) * p.dist}px`,
            animation: `burst 1.5s ${p.delay}s cubic-bezier(0.22,1,0.36,1) both`,
          }} />
        );
      })}
    </div>
  );
}

function PercentRing({ percent, color }) {
  const [cur, setCur] = useState(0);
  const r = 58; const circ = 2 * Math.PI * r;
  
  useEffect(() => {
    setCur(0); // Reset khi percent thay đổi
    let val = 0; 
    const target = Number(percent) || 0;
    if (target === 0) return;
    
    const steps = 60; 
    const inc = target / steps;
    const t = setInterval(() => {
      val += inc; 
      if (val >= target) { 
        setCur(target); 
        clearInterval(t); 
      } else {
        setCur(Math.round(val));
      }
    }, 20);
    return () => clearInterval(t);
  }, [percent]);

  const offset = circ - (cur / 100) * circ;
  return (
    <div style={{ position: "relative", width: 148, height: 148, margin: "0 auto" }}>
      <svg width="148" height="148" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="74" cy="74" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
        <circle cx="74" cy="74" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{cur}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#9CA3AF" }}>%</span>
      </div>
    </div>
  );
}

function OptionRow({ opt, isAnswer, isChosen }) {
  let bg = "#FAFAFA", border = "#F3F4F6", tc = "#6B7280", fw = 400, badge = null;
  if (isAnswer) {
    bg = "#ECFDF5"; border = "#10B981"; tc = "#065F46"; fw = 600;
    badge = <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", background: "#D1FAE5", padding: "2px 8px", borderRadius: 100 }}>{isChosen ? "✓ Đúng · Bạn chọn" : "✓ Đáp án đúng"}</span>;
  } else if (isChosen) {
    bg = "#FEF2F2"; border = "#EF4444"; tc = "#991B1B"; fw = 600;
    badge = <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", background: "#FEE2E2", padding: "2px 8px", borderRadius: 100 }}>✕ Bạn chọn sai</span>;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
      <span style={{ flex: 1, fontSize: 14, color: tc, fontWeight: fw }}>{opt}</span>
      {badge}
    </div>
  );
}

function QuestionCard({ q, i, userAns, delay }) {
  const ci = Number(q.answer);
  const uAns = (userAns !== undefined && userAns !== null) ? Number(userAns) : null;
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #E5E7EB", padding: "20px", animation: `slideUp 0.5s ${delay}s both` }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <span style={{ background: "#F3F4F6", color: "#6B7280", fontSize: 12, fontWeight: 800, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>{i + 1}</span>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1F2937", margin: 0 }}>{q.question}</p>
      </div>
      {q.options.map((opt, j) => <OptionRow key={j} opt={opt} isAnswer={j === ci} isChosen={j === uAns} />)}
      {q.explanation && <div style={{ marginTop: 12, background: "#F9FAFB", borderRadius: 10, padding: "12px", fontSize: 13, color: "#4B5563", borderLeft: "4px solid #3B82F6" }}><strong>Giải thích:</strong> {q.explanation}</div>}
    </div>
  );
}

export default function QuizResultPage({ quiz: pQuiz, resultId: pResultId, score: pScore, total: pTotal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDetail, setShowDetail] = useState(false);
  const [apiDetail, setApiDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const quiz = pQuiz ?? location.state?.quiz;
  const resultId = pResultId ?? location.state?.resultId;
  const score = pScore ?? location.state?.score;
  const total = pTotal ?? location.state?.total;

  useEffect(() => {
    if (!resultId) return;
    setLoading(true);
    quizService.getResultDetail(resultId)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        const fullQuestions = raw?.quizId?.questions || [];
        const qs = fullQuestions.map(q => {
          const correctIdx = q.options.findIndex(opt => opt === q.correctAnswer);
          let userIdx = null;
          if (raw?.answers) {
            const ansInfo = raw.answers.find(a => String(a.questionId) === String(q._id));
            if (ansInfo) userIdx = q.options.findIndex(opt => opt === ansInfo.selectedAnswer);
          }
          return { ...q, answer: correctIdx, userAnswer: userIdx };
        });
        setApiDetail({ 
          score: raw?.correctAnswersCount, 
          total: raw?.totalQuestions, 
          questions: qs, 
          percent: raw?.percent 
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [resultId]);

  const fScore = apiDetail?.score ?? score ?? 0;
  const fTotal = apiDetail?.total ?? total ?? 0;
  const fWrong = fTotal - fScore;
  const pct = apiDetail?.percent ?? (fTotal > 0 ? Math.round((fScore/fTotal)*100) : 0);
  const color = pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";

  if (!resultId && !quiz) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "40px 16px", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes burst { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0);opacity:0} }
      `}</style>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 28, padding: "40px 32px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", position: "relative", overflow: "hidden", marginBottom: 24 }}>
          <Particles active={pct >= 80} />
          <PercentRing percent={pct} color={color} />
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1F2937", marginTop: 20, marginBottom: 8 }}>{pct === 100 ? "Tuyệt đỉnh!" : pct >= 80 ? "Xuất sắc!" : pct >= 50 ? "Làm tốt lắm!" : "Cố gắng hơn nhé!"}</h2>
          
          {/* Thống kê dạng Button Style (Div) */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <div style={{ flex: 1, background: "#F0FDF4", border: "1.5px solid #DCFCE7", padding: "12px", borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", textTransform: "uppercase" }}>Đúng</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#16A34A" }}>{fScore}</div>
            </div>
            <div style={{ flex: 1, background: "#FEF2F2", border: "1.5px solid #FEE2E2", padding: "12px", borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", textTransform: "uppercase" }}>Sai</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#DC2626" }}>{fWrong}</div>
            </div>
            <div style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #F1F5F9", padding: "12px", borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Tổng</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#475569" }}>{fTotal}</div>
            </div>
          </div>
        </div>

        <button onClick={() => setShowDetail(!showDetail)} style={{ width: "100%", padding: "18px", background: "#fff", border: "2px solid #E2E8F0", borderRadius: 20, fontWeight: 700, color: "#475569", cursor: "pointer", marginBottom: 16 }}>
          {loading ? "Đang tải..." : showDetail ? "Ẩn chi tiết đáp án" : "Xem chi tiết bài làm"}
        </button>

        {showDetail && apiDetail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {apiDetail.questions.map((q, idx) => <QuestionCard key={idx} q={q} i={idx} userAns={q.userAnswer} delay={idx * 0.08} />)}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/")} style={{ flex: 1, padding: "18px", background: "#1F2937", color: "#fff", border: "none", borderRadius: 20, fontWeight: 800, cursor: "pointer" }}>Trang chủ</button>
          <button onClick={() => window.location.reload()} style={{ flex: 1, padding: "18px", background: "#F26739", color: "#fff", border: "none", borderRadius: 20, fontWeight: 800, cursor: "pointer" }}>Làm lại</button>
        </div>
      </div>
    </div>
  );
}