import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizService } from "../../../services/quizService";

// ── Particle burst ───────────────────────────────────────────────────────────
function Particles({ active }) {
  if (!active) return null;
  const items = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * 360;
    const dist  = 55 + (i % 3) * 25;
    const size  = 4 + (i % 4);
    const cols  = ["#F26739","#10B981","#3B82F6","#F59E0B","#8B5CF6","#EC4899","#14B8A6"];
    return { angle, dist, size, col: cols[i % cols.length], delay: (i * 0.03).toFixed(2) };
  });
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
      {items.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <div key={i} style={{
            position:"absolute", width:p.size, height:p.size,
            borderRadius: i % 4 === 0 ? "2px" : "50%",
            background: p.col,
            top:"50%", left:"50%",
            "--tx": `${Math.cos(rad) * p.dist}px`,
            "--ty": `${Math.sin(rad) * p.dist}px`,
            animation: `burst 1.4s ${p.delay}s cubic-bezier(0.22,1,0.36,1) both`,
          }} />
        );
      })}
    </div>
  );
}

// ── Floating orbs ────────────────────────────────────────────────────────────
function FloatingOrbs({ color }) {
  const orbs = [
    { s:130, top:"-30px",   left:"-40px",  op:0.09, d:6 },
    { s:90,  top:"0px",     right:"-25px", op:0.07, d:8 },
    { s:70,  bottom:"10px", left:"10px",   op:0.06, d:7 },
    { s:110, bottom:"-20px",right:"0px",   op:0.07, d:9 },
  ];
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", borderRadius:24 }}>
      {orbs.map((o,i) => (
        <div key={i} style={{
          position:"absolute", width:o.s, height:o.s, borderRadius:"50%",
          background: color, opacity: o.op,
          top:o.top, left:o.left, right:o.right, bottom:o.bottom,
          animation: `orbFloat ${o.d}s ${i*0.4}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

// ── Percent ring ─────────────────────────────────────────────────────────────
function PercentRing({ percent, color }) {
  const [cur, setCur] = useState(0);
  const r    = 58;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    let val = 0;
    const steps = 80;
    const inc   = percent / steps;
    const t = setInterval(() => {
      val += inc;
      if (val >= percent) { setCur(percent); clearInterval(t); }
      else setCur(Math.round(val));
    }, 18);
    return () => clearInterval(t);
  }, [percent]);

  const offset = circ - (cur / 100) * circ;

  return (
    <div style={{ position:"relative", width:148, height:148 }}>
      <svg width="148" height="148" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="74" cy="74" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
        <circle cx="74" cy="74" r={r} fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:"stroke-dashoffset 0.018s linear", filter:`drop-shadow(0 0 8px ${color}99)` }}
        />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:34, fontWeight:900, color, lineHeight:1, textShadow:`0 0 24px ${color}55` }}>{cur}</span>
        <span style={{ fontSize:14, fontWeight:700, color:"#9CA3AF" }}>%</span>
      </div>
    </div>
  );
}

// ── Animated number ──────────────────────────────────────────────────────────
function AnimNum({ to }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let c = 0; const t = setInterval(() => {
      c += Math.ceil(to / 30) || 1;
      if (c >= to) { setV(to); clearInterval(t); } else setV(c);
    }, 20);
    return () => clearInterval(t);
  }, [to]);
  return <>{v}</>;
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconCheck = ({ size=16, stroke="#065F46", strokeWidth=2.2 }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);
const IconX = ({ size=16, stroke="#991B1B", strokeWidth=2.2 }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const IconClipboard = ({ size=20, stroke="#374151" }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
  </svg>
);
const IconLightbulb = ({ size=16, stroke="#92400E" }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
  </svg>
);
const IconWarning = ({ size=15, stroke="#9CA3AF" }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
  </svg>
);

// ── Option row ───────────────────────────────────────────────────────────────
function OptionRow({ opt, isAnswer, isChosen }) {
  let bg="#FAFAFA", border="#F3F4F6", tc="#9CA3AF", fw=400, badge=null;
  if (isAnswer && isChosen) {
    bg="#ECFDF5"; border="#86EFAC"; tc="#065F46"; fw=600;
    badge=(
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color:"#10B981", background:"#D1FAE5", padding:"2px 8px", borderRadius:100, whiteSpace:"nowrap" }}>
        <IconCheck size={11} stroke="#10B981" /> Đúng · Bạn chọn
      </span>
    );
  } else if (isAnswer) {
    bg="#ECFDF5"; border="#86EFAC"; tc="#065F46"; fw=600;
    badge=(
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color:"#10B981", background:"#D1FAE5", padding:"2px 8px", borderRadius:100, whiteSpace:"nowrap" }}>
        <IconCheck size={11} stroke="#10B981" /> Đáp án đúng
      </span>
    );
  } else if (isChosen) {
    bg="#FEF2F2"; border="#FCA5A5"; tc="#991B1B"; fw=600;
    badge=(
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color:"#EF4444", background:"#FEE2E2", padding:"2px 8px", borderRadius:100, whiteSpace:"nowrap" }}>
        <IconX size={11} stroke="#EF4444" /> Bạn chọn
      </span>
    );
  }
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, background:bg, border:`1.5px solid ${border}`, borderRadius:10, padding:"10px 14px", marginBottom:8, transition:"all 0.2s" }}>
      <span style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background: isAnswer?"#10B981":isChosen?"#EF4444":"#E5E7EB", boxShadow: isAnswer?`0 0 8px #10B98177`:isChosen?`0 0 8px #EF444477`:"none" }} />
      <span style={{ flex:1, fontSize:13, color:tc, fontWeight:fw, lineHeight:1.5 }}>{opt}</span>
      {badge}
    </div>
  );
}

// ── Question card ────────────────────────────────────────────────────────────
function QuestionCard({ q, i, userAns, delay }) {
  const ci = Number(q.answer);
  const answered = userAns !== undefined && userAns !== null;
  const correct  = answered && Number(userAns) === ci;

  return (
    <div
      style={{
        background:"#fff", borderRadius:18,
        border:`1.5px solid ${!answered?"#E5E7EB":correct?"#BBF7D0":"#FECACA"}`,
        padding:"20px 20px 16px",
        boxShadow:`0 2px 12px ${!answered?"rgba(0,0,0,0.04)":correct?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)"}`,
        animation:`slideUp 0.45s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
        transition:"transform 0.2s, box-shadow 0.2s",
        cursor:"default",
      }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,0.09)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 2px 12px ${!answered?"rgba(0,0,0,0.04)":correct?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)"}`; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, flex:1 }}>
          <span style={{ background:"#F4F6FB", color:"#6B7280", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, flexShrink:0, marginTop:2 }}>
            {i + 1}
          </span>
          <p style={{ fontSize:14, fontWeight:600, color:"#1F2937", lineHeight:1.65, margin:0 }}>{q.question ?? q.q}</p>
        </div>
        <span style={{
          display:"inline-flex", alignItems:"center", gap:4,
          fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100, flexShrink:0,
          background: !answered?"#F3F4F6":correct?"#DCFCE7":"#FEE2E2",
          color:      !answered?"#6B7280":correct?"#166534":"#991B1B",
        }}>
          {!answered
            ? "Chưa làm"
            : correct
              ? <><IconCheck size={11} stroke="#166534"/> Đúng</>
              : <><IconX size={11} stroke="#991B1B"/> Sai</>
          }
        </span>
      </div>

      {q.options.map((opt, j) => (
        <OptionRow key={j} opt={opt} isAnswer={j===ci} isChosen={j===Number(userAns)} />
      ))}

      {/* ĐÃ SỬA: Bỏ điều kiện !correct, luôn hiện giải thích nếu đã trả lời và có data giải thích */}
      {answered && q.explanation && (
        <div style={{ 
          marginTop:12, display:"flex", gap:10, 
          background: correct ? "linear-gradient(135deg,#ECFDF5,#D1FAE5)" : "linear-gradient(135deg,#FFFBEB,#FEF3C7)", 
          border: `1.5px solid ${correct ? "#A7F3D0" : "#FDE68A"}`, 
          borderRadius:12, padding:"12px 14px", animation:"fadeIn 0.3s ease both", alignItems:"flex-start" 
        }}>
          <span style={{ flexShrink:0, marginTop:2 }}>
            <IconLightbulb size={16} stroke={correct ? "#065F46" : "#92400E"}/>
          </span>
          <div style={{ fontSize:13, color: correct ? "#065F46" : "#92400E", lineHeight:1.7, margin:0 }}>
            <strong style={{ display: "block", marginBottom: 2 }}>Giải thích:</strong>
            {q.explanation}
          </div>
        </div>
      )}

      {!answered && (
        <div style={{ marginTop:12, background:"#F9FAFB", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#9CA3AF", display:"flex", alignItems:"center", gap:8 }}>
          <IconWarning size={15} stroke="#9CA3AF"/> Bạn chưa trả lời câu này.
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDetail, setShowDetail] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  const { quiz, answers, score, total, questions: localQs, answered, resultId, documentId } = location.state ?? {};

  const [apiDetail,     setApiDetail]     = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const questions = apiDetail?.questions ?? localQs ?? [];

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  // 1. Sửa gọi API: Gọi đúng hàm getResultDetail
  // 2. Map dữ liệu từ text sang dạng index mảng để Card hiển thị chuẩn
  useEffect(() => {
    if (!resultId) return;
    setLoadingDetail(true);
    quizService.getResultDetail(resultId) // <-- Đã đổi hàm đúng
      .then(res => {
        const raw = res.data?.data ?? res.data;
        
        // Backend trả full câu hỏi bên trong quizId.questions
        const fullQuestions = raw?.quizId?.questions || localQs || [];
        
        // Map data để tìm ra index của đáp án đúng và index của đáp án user đã chọn
        const qs = fullQuestions.map(q => {
          // Tìm index đáp án đúng (từ Text trong DB)
          let correctIdx = q.options.findIndex(opt => opt === q.correctAnswer);
          if (correctIdx === -1) correctIdx = Number(q.correctAnswer || q.answer); // Fallback
          
          // Tìm index đáp án user đã chọn
          let userIdx = null;
          if (raw?.answers) {
            const ansInfo = raw.answers.find(a => String(a.questionId) === String(q._id));
            if (ansInfo && ansInfo.selectedAnswer !== null) {
              userIdx = q.options.findIndex(opt => opt === ansInfo.selectedAnswer);
              if (userIdx === -1) userIdx = Number(ansInfo.selectedAnswer); // Fallback
            }
          }
          
          return {
            _id: q._id,
            question: q.question,
            options: q.options || [],
            answer: correctIdx, // Giờ là index số nguyên (vd: 0,1,2,3)
            explanation: q.explanation || "",
            userAnswer: userIdx // Giờ là index số nguyên
          };
        });

        setApiDetail({
          score: raw?.correctAnswersCount ?? raw?.score ?? score, // Đổi sang lấy số câu đúng
          total: raw?.totalQuestions ?? total,
          answered: raw?.answers?.length ?? answered,
          percent: raw?.percent ?? null,
          questions: qs.length > 0 ? qs : null,
        });
      })
      .catch(err => console.warn("Detail error:", err.message))
      .finally(() => setLoadingDetail(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId]);

  if (!quiz) { navigate(-1); return null; }

  const fs = apiDetail?.score    ?? score    ?? 0;
  const ft = apiDetail?.total    ?? total    ?? 0;
  const fa = apiDetail?.answered ?? answered ?? 0;
  const done = fa > 0;

  const pct = apiDetail?.percent != null
    ? Math.round(apiDetail.percent)
    : fa === 0 ? 0 : Math.round((fs / ft) * 100);

  const color = !done ? "#EF4444" : pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";

  const heroBg = !done
    ? "linear-gradient(140deg,#FEF2F2,#FECACA22)"
    : pct >= 80
      ? "linear-gradient(140deg,#ECFDF5,#D1FAE522)"
      : pct >= 50
        ? "linear-gradient(140deg,#FFFBEB,#FEF3C722)"
        : "linear-gradient(140deg,#FEF2F2,#FECACA22)";

  const msg = !done
    ? { h:"Chưa hoàn thành bài",            s:"Hãy thử lại nhé!" }
    : pct === 100
      ? { h:"Xuất sắc! Hoàn hảo tuyệt đối!", s:"Bạn đã trả lời đúng tất cả câu hỏi 🎉" }
      : pct >= 80
        ? { h:"Rất tốt! Gần hoàn hảo rồi!",  s:"Kiến thức của bạn rất vững chắc 💪" }
        : pct >= 50
          ? { h:"Khá tốt! Cố lên nhé!",       s:"Ôn lại một chút nữa là giỏi thôi 📚" }
          : { h:"Cần cố gắng thêm!",          s:"Xem lại bài và thử lại bạn nhé 🔄" };

  // Generate Map câu trả lời dựa trên list index mới nhất
  const answersMap = (() => {
    if (apiDetail?.questions) return apiDetail.questions.reduce((a,q,i) => {
      if (q.userAnswer != null) a[i] = Number(q.userAnswer); return a;
    }, {});
    return Object.fromEntries(Object.entries(answers ?? {}).map(([k,v]) => [k, Number(v)]));
  })();

  const stats = [
    {
      label:"Hoàn thành", val:fa,
      icon:<IconClipboard size={20} stroke="#374151"/>,
      iconBg:"rgba(243,244,246,0.8)", bg:"rgba(255,255,255,0.75)", tc:"#374151", delay:"0s"
    },
    {
      label:"Câu đúng", val:fs,
      icon:<IconCheck size={20} stroke="#065F46" strokeWidth={2.2}/>,
      iconBg:"rgba(209,250,229,0.8)", bg:"rgba(209,250,229,0.65)", tc:"#065F46", delay:"0.06s"
    },
    {
      label:"Câu sai", val:fa-fs,
      icon:<IconX size={20} stroke="#991B1B" strokeWidth={2.2}/>,
      iconBg:"rgba(254,226,226,0.8)", bg:"rgba(254,226,226,0.65)", tc:"#991B1B", delay:"0.12s"
    },
  ];

  return (
    <>
      <style>{`
        @keyframes slideUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes orbFloat { from{transform:translateY(0) scale(1)} to{transform:translateY(-18px) scale(1.06)} }
        @keyframes burst    { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0);opacity:0} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes badgePop { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes statIn   { from{opacity:0;transform:translateY(16px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
        .qr-stat {
          flex:1; border-radius:16px; padding:16px 12px; text-align:center;
          backdrop-filter:blur(4px); transition:transform 0.2s;
        }
        .qr-stat:hover { transform:translateY(-4px); }
        .qr-toggle {
          width:100%; border:1.5px solid #E5E7EB; background:#fff;
          border-radius:14px; padding:13px 20px; font-size:14px;
          font-weight:600; color:#374151; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all 0.2s; margin-bottom:14px; font-family:inherit;
        }
        .qr-toggle:hover { background:#F9FAFB; border-color:#D1D5DB; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.06); }
        .qr-back {
          width:100%; border:none; border-radius:14px; padding:16px 20px;
          font-size:15px; font-weight:700; color:#fff; cursor:pointer;
          font-family:inherit; letter-spacing:0.02em;
          background:linear-gradient(135deg,#F26739 0%,#f9874a 100%);
          box-shadow:0 4px 18px rgba(242,103,57,0.32);
          transition:all 0.25s;
        }
        .qr-back:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(242,103,57,0.42); }
        .qr-back:active { transform:translateY(0); }
        .chevron { transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#F4F6FB 0%,#EEF2FF 100%)", padding:"28px 16px 52px", fontFamily:"'Be Vietnam Pro','Segoe UI',sans-serif" }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>

          {/* loading */}
          {loadingDetail && (
            <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:14, color:"#9CA3AF", fontSize:12 }}>
              <div style={{ width:14, height:14, border:"2px solid #F26739", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
              Đang tải chi tiết kết quả...
            </div>
          )}

          {/* ── Hero ── */}
          <div style={{
            position:"relative", background:heroBg,
            borderRadius:24, padding:"36px 28px 30px",
            marginBottom:14, textAlign:"center", overflow:"hidden",
            boxShadow:`0 8px 40px ${color}1A, 0 2px 8px rgba(0,0,0,0.05)`,
            opacity: mounted?1:0,
            transform: mounted?"translateY(0)":"translateY(24px)",
            transition:"opacity 0.5s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
          }}>
            {/* top stripe */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:5, borderRadius:"24px 24px 0 0", background:`linear-gradient(90deg,${color},${color}66)` }} />

            <FloatingOrbs color={color} />
            <Particles active={done && pct >= 80} />

            {/* badge */}
            <div style={{ marginBottom:20, animation:"badgePop 0.55s 0.15s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:6,
                fontSize:12, fontWeight:700, padding:"6px 18px",
                borderRadius:100, color:"#fff", letterSpacing:"0.04em",
                background:done?"#10B981":"#EF4444",
                boxShadow:`0 4px 16px ${done?"#10B98155":"#EF444455"}`,
              }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.65)" }} />
                {done ? "Hoàn Thành" : "Không Hoàn Thành"}
              </span>
            </div>

            {/* ring */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:22 }}>
              <PercentRing percent={pct} color={color} />
            </div>

            {/* message */}
            <div style={{ marginBottom:22, animation:"slideUp 0.5s 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
              <p style={{ fontSize:18, fontWeight:800, color:"#1F2937", marginBottom:5 }}>{msg.h}</p>
              <p style={{ fontSize:13, color:"#6B7280", fontWeight:500 }}>{msg.s}</p>
            </div>

            {/* stat cards */}
            <div style={{ display:"flex", gap:10, animation:"slideUp 0.5s 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
              {stats.map((s,i) => (
                <div key={i} className="qr-stat" style={{ background:s.bg, animation:`statIn 0.5s ${s.delay} cubic-bezier(0.22,1,0.36,1) both` }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:s.iconBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize:24, fontWeight:900, color:s.tc, lineHeight:1 }}>
                    <AnimNum to={s.val} />
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:s.tc, opacity:0.65, marginTop:5 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize:11, color:"#9CA3AF", fontWeight:500, marginTop:16, letterSpacing:"0.02em" }}>{quiz.title}</p>

            {resultId && (
              <span style={{ position:"absolute", top:14, right:14, fontSize:10, color:"#9CA3AF", fontFamily:"monospace", background:"rgba(255,255,255,0.8)", border:"1px solid #E5E7EB", padding:"3px 8px", borderRadius:8 }}>
                #{String(resultId).slice(-6)}
              </span>
            )}
          </div>

          {/* ── Toggle ── */}
          <button className="qr-toggle" onClick={() => setShowDetail(p => !p)} disabled={loadingDetail}>
            <svg className="chevron" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              style={{ transform: showDetail ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {loadingDetail ? "Đang tải..." : showDetail ? "Ẩn chi tiết" : "Xem chi tiết đúng / sai"}
            {!showDetail && questions.length > 0 && (
              <span style={{ marginLeft:4, fontSize:11, fontWeight:700, background:"#F3F4F6", color:"#6B7280", padding:"2px 8px", borderRadius:100 }}>
                {questions.length} câu
              </span>
            )}
          </button>

          {/* ── Questions ── */}
          {showDetail && (
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:14 }}>
              {questions.map((q, i) => (
                <QuestionCard key={i} q={q} i={i} userAns={answersMap[i]} delay={i * 0.045} />
              ))}
            </div>
          )}

          {/* ── Back ── */}
          <button className="qr-back" onClick={() => {
            if (documentId) navigate(`/teacher/documents/${documentId}`, { state:{ activeTab:"Quizz" } });
            else navigate(-1);
          }}>
            Quay lại danh sách
          </button>

        </div>
      </div>
    </>
  );
}