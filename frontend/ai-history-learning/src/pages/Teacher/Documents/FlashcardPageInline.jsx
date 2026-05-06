import { useState, useEffect, useRef } from "react";
import api from "../../../lib/api";

/* ─── constants ───────────────────────────────────────────────── */
const PURPLE = "#8b5cf6";
const GREEN  = "#10b981";

const CSS = `
.fpi-card{background:#fff;border-radius:18px;border:.5px solid rgba(0,0,0,.08);box-shadow:0 2px 20px rgba(0,0,0,.06);overflow:hidden}
.fpi-input{width:100%;box-sizing:border-box;padding:11px 14px;font-size:14px;border:1.5px solid #e5e7eb;border-radius:12px;outline:none;font-family:inherit;color:#111;background:#fafafa;transition:border-color .2s,box-shadow .2s}
.fpi-input:focus{border-color:${PURPLE};box-shadow:0 0 0 3px rgba(139,92,246,.1);background:#fff}
.fpi-ghost{display:flex;align-items:center;gap:6px;background:none;border:1.5px solid #e5e7eb;border-radius:12px;padding:9px 16px;font-size:13px;font-weight:500;color:#555;cursor:pointer;transition:all .15s}
.fpi-ghost:hover{background:#f5f0ff;border-color:${PURPLE};color:${PURPLE}}
.fpi-ghost:disabled{opacity:.35;cursor:not-allowed}
.fpi-primary{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;border:none;border-radius:14px;font-size:15px;font-weight:600;color:#fff;cursor:pointer;background:linear-gradient(135deg,${PURPLE},#a78bfa);transition:opacity .15s,transform .1s}
.fpi-primary:hover{opacity:.92}
.fpi-primary:active{transform:scale(.99)}
.fpi-flashcard{width:100%;min-height:300px;border-radius:18px;border:2px solid;display:flex;flex-direction:column;padding:24px;cursor:pointer;transition:background .3s,border-color .3s;position:relative;overflow:hidden}
.fpi-flashcard.front{background:#f8f8fc;border-color:#e4e4f0}
.fpi-flashcard.back{background:#d1fae5;border-color:#6ee7b7}
.anim-l{animation:slideL .2s ease both}
.anim-r{animation:slideR .2s ease both}
@keyframes slideL{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideR{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
`;

const ChevLeft  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#999",fontSize:13,cursor:"pointer",padding:"0 0 4px",transition:"color .15s"}}
    onMouseEnter={e=>e.currentTarget.style.color="#111"} onMouseLeave={e=>e.currentTarget.style.color="#999"}>
    <ChevLeft/>Danh sách bộ thẻ
  </button>
);

/* ════════════════════════════════════════════════════════════════ */
export default function FlashcardPageInline({ flash, onBack }) {
  const [cards,        setCards]        = useState(null);
  const [setId,        setSetId]        = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped,    setIsFlipped]    = useState(false);
  const [animDir,      setAnimDir]      = useState(null);
  const [deckName,     setDeckName]     = useState(flash.title ?? "");
  const [started,      setStarted]      = useState(false);

  const animRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/flashcards/${flash._id ?? flash.id}`);
        const raw = res?.data?.data ?? res?.data ?? null;
        if (!raw || !Array.isArray(raw.cards) || !raw.cards.length) { alert("Bộ thẻ này chưa có nội dung!"); onBack(); return; }
        setSetId(raw._id);
        setDeckName(raw.title ?? flash.title ?? "");
        setCards(raw.cards.map(c=>({ _id:c._id??c.id??null, q:c.front??c.question??"", a:c.back??c.answer??"" })));
      } catch { alert("Không tải được flashcard. Vui lòng thử lại."); onBack(); }
    })();
  }, [flash._id]);

  const handleFlip = async () => {
    if (!cards?.length) return;
    const cur = cards[currentIndex];
    if (!isFlipped && cur && !cur.a && setId) {
      try {
        const res = await api.get(`/flashcards/${setId}/cards/${cur._id}/back`);
        const bd  = res?.data?.data || res?.data || null;
        if (bd?.back != null) setCards(prev=>prev.map((c,i)=>i===currentIndex?{...c,a:bd.back}:c));
      } catch { /* ignore */ }
    }
    setIsFlipped(p=>!p);
  };

  const goTo = (next, dir) => {
    if (next<0||next>=total) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(()=>{ setCurrentIndex(next); setIsFlipped(false); setAnimDir(null); },180);
  };

  /* ── LOADING ── */
  if (!cards) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 0",gap:12}}>
      <style>{CSS}</style>
      <div style={{width:20,height:20,border:`2.5px solid ${PURPLE}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <span style={{fontSize:14,color:"#888"}}>Đang tải flashcard...</span>
    </div>
  );

  /* ══ SETUP ══════════════════════════════════════════════════════ */
  if (!started) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{CSS}</style>
      <BackBtn onClick={onBack}/>
      <div className="fpi-card">
        <div style={{height:4,background:`linear-gradient(90deg,${PURPLE},#a78bfa)`}}/>
        <div style={{padding:"20px 24px",borderBottom:".5px solid #f0f0f5",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:46,height:46,borderRadius:13,background:"#f5f0ff",border:"1px solid #ddd6fe",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#111"}}>Cài đặt bộ flashcard</div>
            <div style={{fontSize:12,color:"#999",marginTop:3}}>{cards.length} thẻ</div>
          </div>
        </div>
        <div style={{padding:24}}>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",color:"#aaa",display:"block",marginBottom:8}}>Tên bộ thẻ</label>
            <input className="fpi-input" value={deckName} onChange={e=>setDeckName(e.target.value)} placeholder="Nhập tên bộ thẻ..."/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:28}}>
            {[
              {label:"Số thẻ", value:cards.length, icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>},
              {label:"Chế độ", value:"Học",        icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN}  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>},
            ].map(s=>(
              <div key={s.label} style={{background:"#f8f8fc",borderRadius:14,padding:"16px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,border:".5px solid #ebebf5"}}>
                {s.icon}
                <div style={{fontSize:22,fontWeight:800,color:"#111",lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:12,color:"#999"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="fpi-primary" onClick={()=>setStarted(true)} disabled={!deckName.trim()}>
            Bắt đầu học <ChevRight/>
          </button>
        </div>
      </div>
    </div>
  );

  /* ══ STUDY ═══════════════════════════════════════════════════════ */
  const total    = cards.length;
  const card     = cards[currentIndex];
  const progress = ((currentIndex+1)/total)*100;
  const slideClass = animDir==="left"?"anim-l":animDir==="right"?"anim-r":"";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{CSS}</style>

      {/* header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <BackBtn onClick={onBack}/>
        <span style={{fontSize:12,color:"#aaa"}}>{deckName||flash.title}</span>
      </div>

      {/* flashcard */}
      <div className={`fpi-flashcard ${isFlipped?"back":"front"} ${slideClass}`} onClick={handleFlip}>
        {/* label */}
        <div style={{marginBottom:16}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:".05em",padding:"5px 14px",borderRadius:20,
            background:isFlipped?"#fff":PURPLE, color:isFlipped?"#059669":"#fff"}}>
            {isFlipped?`ĐÁP ÁN ${currentIndex+1}`:`CÂU HỎI ${currentIndex+1}`}
          </span>
        </div>

        {/* content */}
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 12px"}}>
          <p style={{fontSize:22,fontWeight:800,lineHeight:1.4,color:isFlipped?"#064e3b":"#111",margin:0}}>
            {isFlipped?(card.a||"..."):(card.q)}
          </p>
        </div>

        {/* hint */}
        {!isFlipped && (
          <div style={{display:"flex",justifyContent:"center",marginTop:20}}>
            <span style={{background:PURPLE,color:"#fff",fontSize:13,fontWeight:700,padding:"8px 20px",borderRadius:12,animation:"bounce 1.2s ease infinite"}}>
              Chạm để xem đáp án 👆
            </span>
          </div>
        )}

        {/* corner decoration */}
        <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",
          background:isFlipped?"rgba(16,185,129,.12)":"rgba(139,92,246,.08)",pointerEvents:"none"}}/>
      </div>

      {/* progress + nav */}
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:12,color:"#aaa",fontVariantNumeric:"tabular-nums"}}>{currentIndex+1} / {total}</span>
          <div style={{flex:1,height:6,background:"#f0f0f5",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${PURPLE},#a78bfa)`,borderRadius:99,transition:"width .3s",width:`${progress}%`}}/>
          </div>
          <span style={{fontSize:12,color:"#aaa"}}>{Math.round(progress)}%</span>
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <button className="fpi-ghost" onClick={()=>goTo(currentIndex-1,"right")} disabled={currentIndex===0}>
            <ChevLeft/>Trước
          </button>

          {/* page dots */}
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {Array.from({length:total},(_,i)=>i)
              .filter(i=>i===0||i===total-1||Math.abs(i-currentIndex)<=1)
              .map((i,ai,arr)=>(
                <span key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                  {ai>0&&arr[ai]-arr[ai-1]>1&&<span style={{color:"#ccc",fontSize:12}}>…</span>}
                  <button onClick={()=>goTo(i,i>currentIndex?"left":"right")}
                    style={{width:30,height:30,fontSize:12,fontWeight:600,borderRadius:9,border:"1.5px solid",cursor:"pointer",transition:"all .15s",
                      background:currentIndex===i?PURPLE:"#fff",
                      color:     currentIndex===i?"#fff":"#888",
                      borderColor:currentIndex===i?PURPLE:"#e5e7eb"}}>
                    {i+1}
                  </button>
                </span>
              ))}
          </div>

          {currentIndex<total-1?(
            <button onClick={()=>goTo(currentIndex+1,"left")}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:12,border:"none",fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",background:PURPLE}}>
              Tiếp theo<ChevRight/>
            </button>
          ):(
            <button onClick={onBack}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:12,border:"none",fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",background:GREEN}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Hoàn thành
            </button>
          )}
        </div>

        <div style={{marginTop:10}}>
          <button onClick={()=>{ setCurrentIndex(0); setIsFlipped(false); }}
            style={{fontSize:12,color:"#bbb",background:"none",border:"none",cursor:"pointer",transition:"color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.color="#555"} onMouseLeave={e=>e.currentTarget.style.color="#bbb"}>
            Học lại từ đầu
          </button>
        </div>
      </div>
    </div>
  );
}