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
`;

/* ─── tiny shared components ──────────────────────────────────── */
const ChevLeft  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const CheckIcon = ({color="#fff",size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

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

  const goTo = (next, dir) => {
    if (next<0||next>=total) return;
    // chặn nhảy tới câu chưa trả lời (chỉ cho phép quay lại hoặc tới câu đã làm)
    if (next > currentQ && answers[currentQ]==null) { setShowWarn(true); return; }
    if (next > currentQ && answers[next-1]==null && next > Object.keys(answers).length) { setShowWarn(true); return; }
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(()=>{ setCurrentQ(next); setAnimDir(null); setShowWarn(false); },180);
  };

  const handleNext = () => { if(answers[currentQ]==null){setShowWarn(true);return;} goTo(currentQ+1,"left"); };

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
    const ringColor  = scorePercent>=80?"#22c55e":scorePercent>=50?"#f59e0b":"#ef4444";
    const mot        = scorePercent>=80 ? {text:"Xuất sắc! 🎉",sub:"Bạn đã làm rất tốt"}
                     : scorePercent>=50 ? {text:"Khá tốt! 💪",sub:"Cố gắng thêm một chút nữa nhé"}
                     :                   {text:"Cần cố gắng thêm! 📚",sub:"Xem lại bài và thử lại bạn nhé"};
    const C = 2*Math.PI*36;

    const loadDetailAnswers = async () => {
      if (questions.some(q=>q.correctAnswer)) return;
      try {
        const qid = quiz._id ?? quiz.id;
        const res = await quizService.getById(qid,{includeAnswers:true});
        const d   = res.data?.data ?? res.data ?? res;
        const map = new Map((d.questions??[]).map(q=>[String(q._id),q]));
        setQuestions(prev=>prev.map(q=>{ const f=map.get(String(q._id)); return f?{...q,correctAnswer:f.correctAnswer,explanation:f.explanation}:q; }));
      } catch { /* ignore */ }
    };

    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <style>{CSS}</style>
        <div className="qpi-card">
          <TopBar color={ringColor}/>
          <div style={{padding:"24px 24px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <span className="qpi-badge" style={{background:"#dcfce7",color:"#16a34a",marginBottom:8}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#16a34a",display:"inline-block"}}/>
              Hoàn thành · {quizName}
            </span>
            <div style={{position:"relative",width:96,height:96}}>
              <svg width="96" height="96" viewBox="0 0 80 80" style={{transform:"rotate(-90deg)"}}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="#f0f0f5" strokeWidth="7"/>
                <circle cx="40" cy="40" r="36" fill="none" stroke={ringColor} strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C-(scorePercent/100)*C}
                  style={{transition:"stroke-dashoffset 1s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:22,fontWeight:800,color:"#111",lineHeight:1}}>{scorePercent}</span>
                <span style={{fontSize:11,color:"#aaa"}}>%</span>
              </div>
            </div>
            <div style={{textAlign:"center",marginTop:8}}>
              <div style={{fontSize:16,fontWeight:700,color:"#111"}}>{mot.text}</div>
              <div style={{fontSize:13,color:"#888",marginTop:4}}>{mot.sub}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,padding:"0 20px 20px"}}>
            {[
              {label:"Hoàn thành",value:Object.keys(answers).length,color:"#6366f1",bg:"#eef2ff",border:"#c7d2fe",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>},
              {label:"Câu đúng",  value:correctCount, color:"#16a34a",bg:"#f0fdf4",border:"#bbf7d0",icon:<CheckIcon color="#16a34a" size={18}/>},
              {label:"Câu sai",   value:wrongCount,   color:"#dc2626",bg:"#fef2f2",border:"#fecaca",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>},
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:11,color:"#999",marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="qpi-ghost" style={{width:"100%",justifyContent:"center",borderRadius:14}}
          onClick={async()=>{ const n=!showDetail; setShowDetail(n); if(n) await loadDetailAnswers(); }}>
          {showDetail
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>Ẩn chi tiết</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>Xem chi tiết</>
          }
        </button>

        {showDetail && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {questions.map((question,idx)=>{
              const userIdx = answers[idx];
              const correct = isCorrect(question,userIdx);
              return (
                <div key={idx} className="qpi-card" style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#aaa",paddingTop:2,flexShrink:0}}>{idx+1}</span>
                    <p style={{fontSize:14,fontWeight:500,color:"#111",lineHeight:1.6,flex:1,margin:0}}>{question.question}</p>
                    <span className="qpi-badge" style={correct?{background:"#dcfce7",color:"#16a34a"}:{background:"#fee2e2",color:"#dc2626"}}>
                      {correct?"✓ Đúng":"✗ Sai"}
                    </span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {question.options.map((opt,oi)=>{
                      const isAns=opt===question.correctAnswer, isUser=oi===userIdx;
                      return (
                        <div key={oi} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,
                          border:isAns?"1.5px solid #86efac":isUser&&!correct?"1.5px solid #fca5a5":"1.5px solid #e9eaf0",
                          background:isAns?"#f0fdf4":isUser&&!correct?"#fef2f2":"#fafafa",
                          color:isAns?"#15803d":isUser&&!correct?"#b91c1c":"#555"}}>
                          <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,
                            background:isAns?"#22c55e":isUser&&!correct?"#ef4444":"#e9eaf0",
                            color:(isAns||(isUser&&!correct))?"#fff":"#888"}}>
                            {["A","B","C","D"][oi]}
                          </div>
                          <span style={{flex:1,fontSize:13}}>{opt}</span>
                          {isAns            && <span style={{fontSize:11,fontWeight:700,color:"#16a34a"}}>✓ Đáp án đúng</span>}
                          {isUser&&!correct && <span style={{fontSize:11,fontWeight:700,color:"#dc2626"}}>✗ Bạn chọn</span>}
                        </div>
                      );
                    })}
                  </div>
                  {question.explanation && (
                    <div style={{marginTop:12,padding:"12px 14px",borderRadius:12,background:"#fffbeb",border:"1px solid #fde68a",display:"flex",gap:10}}>
                      <span style={{fontSize:16,flexShrink:0}}>💡</span>
                      <p style={{fontSize:12,color:"#92400e",lineHeight:1.6,margin:0}}>{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{display:"flex",gap:12,paddingBottom:8}}>
          <button className="qpi-ghost" style={{flex:1,justifyContent:"center",borderRadius:14,padding:13}}
            onClick={()=>{ setShowResult(false);setStarted(false);setAnswers({});setCurrentQ(0);setShowDetail(false); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
            Làm lại
          </button>
          <button onClick={onBack} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:13,border:"none",borderRadius:14,fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",background:ORANGE}}>
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
          <button className="qpi-ghost" onClick={()=>goTo(currentQ-1,"right")} disabled={currentQ===0}>
            <ChevLeft/>Trước
          </button>

          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {Array.from({length:total},(_,i)=>i)
              .filter(i=>i===0||i===total-1||Math.abs(i-currentQ)<=1)
              .map((i,ai,arr)=>(
                <span key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                  {ai>0&&arr[ai]-arr[ai-1]>1&&<span style={{color:"#ccc",fontSize:12}}>…</span>}
                  <button onClick={()=>goTo(i,i>currentQ?"left":"right")}
                    style={{width:30,height:30,fontSize:12,fontWeight:600,borderRadius:9,border:"1.5px solid",transition:"all .15s",
                      cursor: i>currentQ && answers[i-1]==null && i>Object.keys(answers).length ? "not-allowed" : "pointer",
                      opacity: i>currentQ && answers[i-1]==null && i>Object.keys(answers).length ? 0.35 : 1,
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

        <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
          <button onClick={()=>{ setCurrentQ(0);setAnswers({}); }}
            style={{fontSize:12,color:"#bbb",background:"none",border:"none",cursor:"pointer",transition:"color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.color="#555"} onMouseLeave={e=>e.currentTarget.style.color="#bbb"}>
            Làm lại từ đầu
          </button>
          <button onClick={handleSubmit}
            style={{fontSize:12,color:ORANGE,fontWeight:600,background:"none",border:"none",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            Nộp bài ngay →
          </button>
        </div>
      </div>
    </div>
  );
}