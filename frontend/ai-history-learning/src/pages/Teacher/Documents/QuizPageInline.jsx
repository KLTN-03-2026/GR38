import { useState, useEffect, useRef } from "react";
import { quizService } from "../../../services/quizService";

/* ─── helpers ─────────────────────────────────────────────────── */
const shuffle     = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const shuffleOpts = (q)   => ({ ...q, options: shuffle(q.options) });
const isCorrect   = (q,i) => i!=null && q.options[i]===q.correctAnswer;
const fmtTime     = (s)   => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

const INDIGO = "#6366f1";
const ORANGE = "#F26739";

/* ─── shared styles ───────────────────────────────────────────── */
const CSS = `
.qpi-card{background:#fff;border-radius:18px;border:.5px solid rgba(0,0,0,.08);box-shadow:0 2px 20px rgba(0,0,0,.06);overflow:hidden}
.qpi-input{width:100%;box-sizing:border-box;padding:11px 14px;font-size:14px;border:1.5px solid #e5e7eb;border-radius:12px;outline:none;font-family:inherit;color:#111;background:#fafafa;transition:border-color .2s,box-shadow .2s}
.qpi-input:focus{border-color:${INDIGO};box-shadow:0 0 0 3px rgba(99,102,241,.1);background:#fff}
.qpi-ghost{display:flex;align-items:center;gap:6px;background:none;border:1.5px solid #e5e7eb;border-radius:12px;padding:9px 16px;font-size:13px;font-weight:500;color:#555;cursor:pointer;transition:all .15s}
.qpi-ghost:hover{background:#f5f5ff;border-color:${INDIGO};color:${INDIGO}}
.qpi-ghost:disabled{opacity:.35;cursor:not-allowed}
.qpi-primary{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;border:none;border-radius:14px;font-size:15px;font-weight:600;color:#fff;cursor:pointer;background:linear-gradient(135deg,${INDIGO},#818cf8);transition:opacity .15s,transform .1s}
.qpi-primary:hover{opacity:.92}
.qpi-primary:active{transform:scale(.99)}
.qpi-primary:disabled{opacity:.4;cursor:not-allowed}
.qpi-opt{width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid #e9eaf0;border-radius:14px;text-align:left;background:#fff;cursor:pointer;transition:all .15s}
.qpi-opt:hover{border-color:#c7d2fe;background:#f5f5ff}
.qpi-opt.sel{border-color:${INDIGO};background:#eef2ff}
.qpi-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;letter-spacing:.04em;padding:4px 12px;border-radius:20px}
.anim-l{animation:slideL .2s ease both}
.anim-r{animation:slideR .2s ease both}
@keyframes slideL{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideR{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes orbFloat{from{transform:translateY(0) scale(1)}to{transform:translateY(-16px) scale(1.06)}}
@keyframes burst{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0);opacity:0}}
@keyframes badgePop{0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes statIn{from{opacity:0;transform:translateY(14px) scale(0.92)}to{opacity:1;transform:translateY(0) scale(1)}}
`;

/* ─── tiny shared components ──────────────────────────────────── */
const ChevLeft  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const CheckIcon = ({color="#fff",size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon     = ({color="#991B1B",size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const BackBtn = ({ onClick, label="Danh sách bài kiểm tra" }) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#999",fontSize:13,cursor:"pointer",padding:"0 0 4px",transition:"color .15s"}}
    onMouseEnter={e=>e.currentTarget.style.color="#111"} onMouseLeave={e=>e.currentTarget.style.color="#999"}>
    <ChevLeft/>{label}
  </button>
);

const TopBar = ({ color=INDIGO }) => <div style={{height:4,background:`linear-gradient(90deg,${color},${color}88)`}}/>;

const StatCard = ({ icon, value, label }) => (
  <div style={{background:"#f8f8fc",borderRadius:14,padding:"16px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,border:".5px solid #ebebf5"}}>
    {icon}
    <div style={{fontSize:22,fontWeight:800,color:"#111",lineHeight:1}}>{value}</div>
    <div style={{fontSize:12,color:"#999"}}>{label}</div>
  </div>
);

/* ── Particle burst ─────────────────────────────────────────────── */
function Particles({ active }) {
  if (!active) return null;
  const items = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * 360;
    const dist  = 50 + (i % 3) * 22;
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
            background: p.col, top:"50%", left:"50%",
            "--tx": `${Math.cos(rad) * p.dist}px`,
            "--ty": `${Math.sin(rad) * p.dist}px`,
            animation: `burst 1.4s ${p.delay}s cubic-bezier(0.22,1,0.36,1) both`,
          }} />
        );
      })}
    </div>
  );
}

/* ── Floating orbs ──────────────────────────────────────────────── */
function FloatingOrbs({ color }) {
  const orbs = [
    { s:110, top:"-25px",   left:"-35px",  op:0.09, d:6 },
    { s:80,  top:"0px",     right:"-20px", op:0.07, d:8 },
    { s:60,  bottom:"8px",  left:"8px",    op:0.06, d:7 },
    { s:95,  bottom:"-18px",right:"0px",   op:0.07, d:9 },
  ];
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", borderRadius:20 }}>
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

/* ── Percent ring ───────────────────────────────────────────────── */
function PercentRing({ percent, color }) {
  const [cur, setCur] = useState(0);
  const r    = 52;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    let val = 0;
    const steps = 70;
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
    <div style={{ position:"relative", width:132, height:132 }}>
      <svg width="132" height="132" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="66" cy="66" r={r} fill="none" stroke="#E5E7EB" strokeWidth="11" />
        <circle cx="66" cy="66" r={r} fill="none"
          stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:"stroke-dashoffset 0.018s linear", filter:`drop-shadow(0 0 7px ${color}99)` }}
        />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:30, fontWeight:900, color, lineHeight:1, textShadow:`0 0 20px ${color}55` }}>{cur}</span>
        <span style={{ fontSize:13, fontWeight:700, color:"#9CA3AF" }}>%</span>
      </div>
    </div>
  );
}

/* ── AnimNum ────────────────────────────────────────────────────── */
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

/* ── Option row (result detail) ─────────────────────────────────── */
function OptionRow({ opt, isAnswer, isChosen }) {
  let bg="#FAFAFA", border="#F3F4F6", tc="#9CA3AF", fw=400, badge=null;
  if (isAnswer && isChosen) {
    bg="#ECFDF5"; border="#86EFAC"; tc="#065F46"; fw=600;
    badge=<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color:"#10B981",background:"#D1FAE5",padding:"2px 8px",borderRadius:100,whiteSpace:"nowrap"}}><CheckIcon size={11} color="#10B981"/> Đúng · Bạn chọn</span>;
  } else if (isAnswer) {
    bg="#ECFDF5"; border="#86EFAC"; tc="#065F46"; fw=600;
    badge=<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color:"#10B981",background:"#D1FAE5",padding:"2px 8px",borderRadius:100,whiteSpace:"nowrap"}}><CheckIcon size={11} color="#10B981"/> Đáp án đúng</span>;
  } else if (isChosen) {
    bg="#FEF2F2"; border="#FCA5A5"; tc="#991B1B"; fw=600;
    badge=<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color:"#EF4444",background:"#FEE2E2",padding:"2px 8px",borderRadius:100,whiteSpace:"nowrap"}}><XIcon size={11} color="#EF4444"/> Bạn chọn</span>;
  }
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,background:bg,border:`1.5px solid ${border}`,borderRadius:10,padding:"10px 14px",marginBottom:8,transition:"all 0.2s"}}>
      <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:isAnswer?"#10B981":isChosen?"#EF4444":"#E5E7EB",boxShadow:isAnswer?`0 0 8px #10B98177`:isChosen?`0 0 8px #EF444477`:"none"}}/>
      <span style={{flex:1,fontSize:13,color:tc,fontWeight:fw,lineHeight:1.5}}>{opt}</span>
      {badge}
    </div>
  );
}

/* ── Question card (result detail) ─────────────────────────────── */
function QuestionCard({ q, i, userAns, delay }) {
  const ci       = q.options.findIndex(o => o === q.correctAnswer);
  const answered = userAns !== undefined && userAns !== null;
  const correct  = answered && userAns === ci;

  return (
    <div style={{
      background:"#fff", borderRadius:18,
      border:`1.5px solid ${!answered?"#E5E7EB":correct?"#BBF7D0":"#FECACA"}`,
      padding:"20px 20px 16px",
      boxShadow:`0 2px 12px ${!answered?"rgba(0,0,0,0.04)":correct?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)"}`,
      animation:`slideUp 0.42s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1}}>
          <span style={{background:"#F4F6FB",color:"#6B7280",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,flexShrink:0,marginTop:2}}>{i+1}</span>
          <p style={{fontSize:14,fontWeight:600,color:"#1F2937",lineHeight:1.65,margin:0}}>{q.question}</p>
        </div>
        <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:100,flexShrink:0,
          background:!answered?"#F3F4F6":correct?"#DCFCE7":"#FEE2E2",
          color:!answered?"#6B7280":correct?"#166534":"#991B1B"}}>
          {!answered ? "Chưa làm" : correct ? <><CheckIcon size={11} color="#166534"/>Đúng</> : <><XIcon size={11} color="#991B1B"/>Sai</>}
        </span>
      </div>
      {q.options.map((opt,j) => (
        <OptionRow key={j} opt={opt} isAnswer={j===ci} isChosen={j===userAns}/>
      ))}
      {answered && q.explanation && (
        <div style={{marginTop:12,display:"flex",gap:10,
          background:correct?"linear-gradient(135deg,#ECFDF5,#D1FAE5)":"linear-gradient(135deg,#FFFBEB,#FEF3C7)",
          border:`1.5px solid ${correct?"#A7F3D0":"#FDE68A"}`,borderRadius:12,padding:"12px 14px",alignItems:"flex-start"}}>
          <span style={{fontSize:16,flexShrink:0}}>💡</span>
          <div style={{fontSize:13,color:correct?"#065F46":"#92400E",lineHeight:1.7,margin:0}}>
            <strong style={{display:"block",marginBottom:2}}>Giải thích:</strong>{q.explanation}
          </div>
        </div>
      )}
      {!answered && (
        <div style={{marginTop:12,background:"#F9FAFB",border:"1.5px solid #E5E7EB",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#9CA3AF",display:"flex",alignItems:"center",gap:8}}>
          ⚠️ Bạn chưa trả lời câu này.
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function QuizPageInline({ quiz, onBack }) {
  const [questions,   setQuestions]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [resultStats, setResultStats] = useState({ correctCount:0, total:0 });
  const [started,     setStarted]     = useState(false);
  const [quizName,    setQuizName]    = useState("");
  const [timeLimit]                   = useState(quiz.timeLimit||quiz.timeLimitMinutes||quiz.time||quiz.duration||30);
  const [currentQ,    setCurrentQ]    = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [showWarn,    setShowWarn]    = useState(false);
  const [animDir,     setAnimDir]     = useState(null);
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [showResult,  setShowResult]  = useState(false);
  const [showDetail,  setShowDetail]  = useState(false);
  const [mounted,     setMounted]     = useState(false);

  const animRef  = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const qid = quiz._id ?? quiz.id;
        const res  = await quizService.getQuizForPlay(qid);
        const d    = res.data?.data ?? res.data ?? res;
        const raw  = d.questions ?? [];
        if (!raw.length) { alert("Quiz này chưa có câu hỏi!"); onBack(); return; }
        setQuizName(d.title ?? quiz.title ?? "");
        setQuestions(shuffle(raw.map(q=>({ _id:q._id, question:q.question??q.q, options:q.options??[] }))).map(shuffleOpts));
      } catch (e) { alert("Không tải được câu hỏi: "+e.message); onBack(); }
      finally     { setLoading(false); }
    })();
  }, [quiz._id]);

  useEffect(() => {
    if (!started) return;
    setTimeLeft(timeLimit*60);
    timerRef.current = setInterval(()=>setTimeLeft(p=>{ if(p<=1){clearInterval(timerRef.current);handleSubmit();return 0;} return p-1; }),1000);
    return ()=>clearInterval(timerRef.current);
  }, [started]);

  // Animate in result hero
  useEffect(() => {
    if (showResult) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [showResult]);

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    try {
      const qid = quiz._id ?? quiz.id;
      const res = await quizService.submit(qid,
        questions.map((q,i)=>({ questionId:q._id, selectedAnswer:answers[i]!=null?q.options[answers[i]]:null })),
        timeLimit*60-timeLeft);
      const r = res.data?.data ?? res.data ?? {};
      setResultStats({ correctCount:r.score??0, total:r.totalQuestions??questions.length });
    } catch { setResultStats({ correctCount:0, total:questions.length }); }
    finally  { setShowResult(true); }
  };

  // Only allow going back; going forward requires answering current question
  const goTo = (next, dir) => {
    if (next < 0 || next >= total) return;
    // Can always go BACK to previous questions
    if (next < currentQ) {
      setAnimDir(dir);
      clearTimeout(animRef.current);
      animRef.current = setTimeout(()=>{ setCurrentQ(next); setAnimDir(null); setShowWarn(false); },180);
      return;
    }
    // Going forward: must answer current question first
    if (answers[currentQ] == null) { setShowWarn(true); return; }
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(()=>{ setCurrentQ(next); setAnimDir(null); setShowWarn(false); },180);
  };

  const handleNext = () => {
    if (answers[currentQ] == null) { setShowWarn(true); return; }
    goTo(currentQ+1, "left");
  };

  const loadDetailAnswers = async () => {
    if (questions.some(q=>q.correctAnswer)) return;
    try {
      const qid = quiz._id ?? quiz.id;
      const res = await quizService.getById(qid, { includeAnswers:true });
      const d   = res.data?.data ?? res.data ?? res;
      const map = new Map((d.questions??[]).map(q=>[String(q._id),q]));
      setQuestions(prev=>prev.map(q=>{ const f=map.get(String(q._id)); return f?{...q,correctAnswer:f.correctAnswer,explanation:f.explanation}:q; }));
    } catch { /* ignore */ }
  };

  const total        = questions?.length ?? 0;
  const q            = questions?.[currentQ];
  const selected     = answers[currentQ];
  const progress     = total ? ((currentQ+1)/total)*100 : 0;
  const correctCount = resultStats.correctCount;
  const scorePercent = total ? Math.round((correctCount/total)*100) : 0;
  const slideClass   = animDir==="left"?"anim-l":animDir==="right"?"anim-r":"";

  /* ── LOADING ── */
  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 0",gap:12}}>
      <style>{CSS}</style>
      <div style={{width:20,height:20,border:`2.5px solid ${INDIGO}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <span style={{fontSize:14,color:"#888"}}>Đang tải câu hỏi...</span>
    </div>
  );

  /* ══ SETUP ══════════════════════════════════════════════════════ */
  if (!started) {
    const diffLabel = {EASY:"Dễ",MEDIUM:"Trung bình",HARD:"Khó"}[quiz.difficulty] ?? "—";
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <style>{CSS}</style>
        <BackBtn onClick={onBack}/>
        <div className="qpi-card">
          <TopBar/>
          <div style={{padding:"20px 24px",borderBottom:".5px solid #f0f0f5",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:13,background:"#eef2ff",border:"1px solid #c7d2fe",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"#111"}}>Cài đặt bài quiz</div>
              <div style={{fontSize:12,color:"#999",marginTop:3}}>{total} câu hỏi · {timeLimit} phút</div>
            </div>
          </div>
          <div style={{padding:24}}>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"#aaa",display:"block",marginBottom:8}}>Tên bài kiểm tra</label>
              <input className="qpi-input" value={quizName} onChange={e=>setQuizName(e.target.value)} placeholder="Nhập tên bài kiểm tra..."/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28}}>
              <StatCard label="Câu hỏi" value={total}     icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO}   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}/>
              <StatCard label="Phút"    value={timeLimit}  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}/>
              <StatCard label="Độ khó"  value={diffLabel}  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>}/>
            </div>
            <button className="qpi-primary" onClick={()=>setStarted(true)} disabled={!quizName.trim()}>
              Bắt đầu làm bài <ChevRight/>
            </button>
          </div>
        </div>
      </div>
    );
  }
  /* ══ RESULT ═════════════════════════════════════════════════════ */
  if (showResult) {
    const wrongCount = Object.keys(answers).length - correctCount;
    const answeredCount = Object.keys(answers).length;
    const color  = scorePercent>=80?"#10B981":scorePercent>=50?"#F59E0B":"#EF4444";
    const heroBg = scorePercent>=80
      ? "linear-gradient(140deg,#ECFDF5,#D1FAE522)"
      : scorePercent>=50
        ? "linear-gradient(140deg,#FFFBEB,#FEF3C722)"
        : "linear-gradient(140deg,#FEF2F2,#FECACA22)";
    const msg = scorePercent===100
      ? { h:"Xuất sắc! Hoàn hảo tuyệt đối!", s:"Bạn đã trả lời đúng tất cả câu hỏi 🎉" }
      : scorePercent>=80
        ? { h:"Rất tốt! Gần hoàn hảo rồi!",  s:"Kiến thức của bạn rất vững chắc 💪" }
        : scorePercent>=50
          ? { h:"Khá tốt! Cố lên nhé!",       s:"Ôn lại một chút nữa là giỏi thôi 📚" }
          : { h:"Cần cố gắng thêm!",           s:"Xem lại bài và thử lại bạn nhé 🔄" };

    const statItems = [
      { label:"Hoàn thành", val:answeredCount, iconBg:"rgba(243,244,246,0.8)", bg:"rgba(255,255,255,0.75)", tc:"#374151", delay:"0s",
        icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
      { label:"Câu đúng",   val:correctCount,  iconBg:"rgba(209,250,229,0.8)", bg:"rgba(209,250,229,0.65)", tc:"#065F46", delay:"0.06s",
        icon:<CheckIcon size={20} color="#065F46"/> },
      { label:"Câu sai",    val:wrongCount,    iconBg:"rgba(254,226,226,0.8)", bg:"rgba(254,226,226,0.65)", tc:"#991B1B", delay:"0.12s",
        icon:<XIcon size={20} color="#991B1B"/> },
    ];

    return (
      <div style={{display:"flex",flexDirection:"column",gap:14,fontFamily:"'Be Vietnam Pro','Segoe UI',sans-serif"}}>
        <style>{CSS}</style>

        {/* ── Hero card ── */}
        <div style={{
          position:"relative", background:heroBg, borderRadius:20,
          padding:"32px 24px 26px", textAlign:"center", overflow:"hidden",
          boxShadow:`0 8px 40px ${color}1A, 0 2px 8px rgba(0,0,0,0.05)`,
          opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(22px)",
          transition:"opacity 0.5s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
        }}>
          {/* top stripe */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,borderRadius:"20px 20px 0 0",background:`linear-gradient(90deg,${color},${color}66)`}}/>
          <FloatingOrbs color={color}/>
          <Particles active={scorePercent>=80}/>

          {/* badge */}
          <div style={{marginBottom:18,animation:"badgePop 0.55s 0.15s cubic-bezier(0.34,1.56,0.64,1) both"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,padding:"5px 16px",borderRadius:100,color:"#fff",letterSpacing:"0.04em",
              background:"#10B981",boxShadow:"0 4px 14px #10B98155"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.65)"}}/>
              Hoàn Thành · {quizName}
            </span>
          </div>

          {/* ring */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <PercentRing percent={scorePercent} color={color}/>
          </div>

          {/* message */}
          <div style={{marginBottom:20,animation:"slideUp 0.5s 0.3s cubic-bezier(0.22,1,0.36,1) both"}}>
            <p style={{fontSize:17,fontWeight:800,color:"#1F2937",marginBottom:5}}>{msg.h}</p>
            <p style={{fontSize:13,color:"#6B7280",fontWeight:500}}>{msg.s}</p>
          </div>

          {/* stat cards */}
          <div style={{display:"flex",gap:10,animation:"slideUp 0.5s 0.4s cubic-bezier(0.22,1,0.36,1) both"}}>
            {statItems.map((s,i) => (
              <div key={i} style={{flex:1,borderRadius:14,padding:"14px 10px",textAlign:"center",backdropFilter:"blur(4px)",transition:"transform 0.2s",
                background:s.bg,animation:`statIn 0.5s ${s.delay} cubic-bezier(0.22,1,0.36,1) both`}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{width:34,height:34,borderRadius:10,background:s.iconBg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:900,color:s.tc,lineHeight:1}}><AnimNum to={s.val}/></div>
                <div style={{fontSize:11,fontWeight:600,color:s.tc,opacity:0.65,marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Toggle detail ── */}
        <button className="qpi-ghost" style={{width:"100%",justifyContent:"center",borderRadius:14,padding:"13px 20px",fontSize:14,fontWeight:600,color:"#374151"}}
          onClick={async()=>{ const n=!showDetail; setShowDetail(n); if(n) await loadDetailAnswers(); }}>
          <svg style={{transition:"transform 0.3s",transform:showDetail?"rotate(180deg)":"rotate(0deg)"}} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
          {showDetail ? "Ẩn chi tiết" : "Xem chi tiết đúng / sai"}
          {!showDetail && questions.length > 0 && (
            <span style={{marginLeft:4,fontSize:11,fontWeight:700,background:"#F3F4F6",color:"#6B7280",padding:"2px 8px",borderRadius:100}}>{questions.length} câu</span>
          )}
        </button>

        {/* ── Question detail ── */}
        {showDetail && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {questions.map((question, idx) => (
              <QuestionCard key={idx} q={question} i={idx} userAns={answers[idx] ?? null} delay={idx * 0.04}/>
            ))}
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{display:"flex",gap:12,paddingBottom:8}}>
          <button className="qpi-ghost" style={{flex:1,justifyContent:"center",borderRadius:14,padding:13}}
            onClick={()=>{ setShowResult(false);setStarted(false);setAnswers({});setCurrentQ(0);setShowDetail(false);setMounted(false); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
            Làm lại
          </button>
          <button onClick={onBack} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:13,border:"none",borderRadius:14,fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",background:ORANGE,
            boxShadow:"0 4px 16px rgba(242,103,57,0.32)",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(242,103,57,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 16px rgba(242,103,57,0.32)";}}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  /* ══ QUIZ ════════════════════════════════════════════════════════ */
  const urgent = timeLeft<=60;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{CSS}</style>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <BackBtn onClick={onBack} label="Quay lại"/>
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:24,fontSize:14,fontWeight:700,color:"#fff",
          background:urgent?"#ef4444":INDIGO,
          animation:urgent?"pulse 1s infinite":"none",
          boxShadow:urgent?"0 0 0 4px rgba(239,68,68,.2)":"0 0 0 4px rgba(99,102,241,.15)",
          transition:"background .3s,box-shadow .3s"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{fontVariantNumeric:"tabular-nums"}}>{fmtTime(timeLeft)}</span>
        </div>
      </div>

      <div className={`qpi-card ${slideClass}`} style={{padding:24}}>
        <div style={{marginBottom:16}}>
          <span className="qpi-badge" style={{background:"#eef2ff",color:INDIGO}}>Câu {currentQ+1} / {total}</span>
        </div>
        <p style={{fontSize:15,fontWeight:600,color:"#111",lineHeight:1.7,margin:"0 0 6px"}}>{q.question}</p>
        <p style={{fontSize:12,color:"#bbb",margin:"0 0 18px"}}>Chọn 1 đáp án đúng</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {q.options.map((opt,i)=>(
            <button key={i} className={`qpi-opt${selected===i?" sel":""}`}
              onClick={()=>{ setAnswers(p=>({...p,[currentQ]:i})); setShowWarn(false); }}>
              <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:700,transition:"all .15s",
                background:selected===i?INDIGO:"#f0f0f5",color:selected===i?"#fff":"#888"}}>
                {["A","B","C","D"][i]}
              </div>
              <span style={{fontSize:14,color:selected===i?INDIGO:"#333",fontWeight:selected===i?500:400}}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:12,color:"#aaa",fontVariantNumeric:"tabular-nums"}}>{currentQ+1} / {total}</span>
          <div style={{flex:1,height:6,background:"#f0f0f5",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${INDIGO},#818cf8)`,borderRadius:99,transition:"width .3s",width:`${progress}%`}}/>
          </div>
          <span style={{fontSize:12,color:"#aaa"}}>{Math.round(progress)}%</span>
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          {/* Back button — always allowed */}
          <button className="qpi-ghost" onClick={()=>goTo(currentQ-1,"right")} disabled={currentQ===0}>
            <ChevLeft/>Trước
          </button>

          {/* Page dots */}
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {Array.from({length:total},(_,i)=>i)
              .filter(i=>i===0||i===total-1||Math.abs(i-currentQ)<=1)
              .map((i,ai,arr)=>(
                <span key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                  {ai>0&&arr[ai]-arr[ai-1]>1&&<span style={{color:"#ccc",fontSize:12}}>…</span>}
                  <button
                    onClick={()=>goTo(i,i>currentQ?"left":"right")}
                    style={{width:30,height:30,fontSize:12,fontWeight:600,borderRadius:9,border:"1.5px solid",transition:"all .15s",
                      // Forward jump locked if current not answered
                      cursor: i > currentQ && answers[currentQ]==null ? "not-allowed" : "pointer",
                      opacity: i > currentQ && answers[currentQ]==null ? 0.35 : 1,
                      background:currentQ===i?INDIGO:answers[i]!=null?"#eef2ff":"#fff",
                      color:     currentQ===i?"#fff" :answers[i]!=null?INDIGO   :"#888",
                      borderColor:currentQ===i?INDIGO:answers[i]!=null?"#c7d2fe":"#e5e7eb"}}>
                    {i+1}
                  </button>
                </span>
              ))}
          </div>

          {currentQ<total-1 ? (
            <button onClick={handleNext} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:12,border:"none",fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",
              background:showWarn?"#ef4444":selected!=null?INDIGO:"#d1d5db",
              animation:showWarn?"shake .4s ease both":"none"}}>
              {showWarn?"Chọn đáp án!":"Câu tiếp"}<ChevRight/>
            </button>
          ) : (
            <button onClick={handleSubmit} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:12,border:"none",fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",background:ORANGE}}>
              Nộp bài<CheckIcon/>
            </button>
          )}
        </div>

        {/* Chỉ còn nút "Làm lại từ đầu", bỏ "Nộp bài ngay" */}
        <div style={{display:"flex",justifyContent:"flex-start",marginTop:10}}>
          <button onClick={()=>{ setCurrentQ(0);setAnswers({}); }}
            style={{fontSize:12,color:"#bbb",background:"none",border:"none",cursor:"pointer",transition:"color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.color="#555"} onMouseLeave={e=>e.currentTarget.style.color="#bbb"}>
            Làm lại từ đầu
          </button>
        </div>
      </div>
    </div>
  );
}