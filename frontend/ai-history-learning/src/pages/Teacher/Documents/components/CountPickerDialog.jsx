import React, { useState } from "react";
import { IconZap, IconClipboardList } from "../icons";
import { GRAD } from "../constants/chatConstants";

// ── Circular progress ─────────────────────────────────────────────────────────
function CircularProgress({ percent, color }) {
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(128,128,128,0.2)" strokeWidth="8"/>
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ - (percent / 100) * circ}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.4s ease", transformOrigin: "65px 65px", transform: "rotate(-90deg)" }}/>
      <text x="65" y="65" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 22, fontWeight: 700, fill: color, fontFamily: "inherit" }}>
        {percent}%
      </text>
    </svg>
  );
}

// ── CountPickerDialog ─────────────────────────────────────────────────────────
export default function CountPickerDialog({ action, onConfirm, onCancel, dark, T }) {
  const [step, setStep]           = useState("pick");
  const [count, setCount]         = useState("");
  const [error, setError]         = useState("");
  const [percent, setPercent]     = useState(0);
  const [resultMsg, setResultMsg] = useState("");

  const isFlash    = action === "flashcard";
  const title      = isFlash ? "Tạo Flashcard" : "Tạo Quiz";
  const ActionIcon = isFlash ? IconZap : IconClipboardList;
  const color      = isFlash ? "#5b5ef4" : "#f59e0b";
  const grad       = isFlash ? GRAD.indigo : GRAD.amber;

  const confirm = () => {
    const n = parseInt(count);
    if (!n || n < 5 || n > 20) { setError("Vui lòng nhập số từ 5 đến 20"); return; }
    setStep("loading"); setPercent(0);
    let cur = 0;
    const iv = setInterval(() => {
      cur += Math.floor(Math.random() * 8) + 3;
      if (cur >= 90) { cur = 90; clearInterval(iv); }
      setPercent(cur);
    }, 300);
    onConfirm(n, {
      onDone:  (msg) => { clearInterval(iv); setPercent(100); setTimeout(() => { setResultMsg(msg); setStep("done"); }, 500); },
      onError: ()    => { clearInterval(iv); setResultMsg("Có lỗi xảy ra, vui lòng thử lại."); setStep("done"); },
    });
  };

  const overlay = {
    position: "fixed", inset: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: T.dialogOverlay, backdropFilter: "blur(6px)",
  };
  const card = {
    background: T.dialogBg, borderRadius: 20, padding: "24px",
    boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.6)" : "0 24px 64px rgba(0,0,0,0.18)",
    border: `0.5px solid ${T.dialogBorder}`, fontFamily: "inherit",
    transition: "background 0.3s, border-color 0.3s",
  };

  // ── Step: pick ──
  if (step === "pick") return (
    <div style={overlay}><div style={{ ...card, width: 340 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: grad, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ActionIcon size={20} style={{ color: "#fff" }}/>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.dialogTitle }}>{title}</div>
          <div style={{ fontSize: 12, color: T.dialogSub, marginTop: 2 }}>Chọn số lượng (5 – 20)</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        {[5, 10, 15, 20].map(n => (
          <button key={n} onClick={() => { setCount(String(n)); setError(""); }}
            className="chatai-dialog-pick"
            style={{
              padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: count === String(n) ? "2px solid transparent" : `1.5px solid ${T.dialogPickBdr}`,
              background: count === String(n) ? grad : T.dialogPickBg,
              color: count === String(n) ? "#fff" : T.dialogPickClr,
              boxShadow: count === String(n) ? `0 4px 14px ${color}35` : "none",
              transition: "all 0.15s",
            }}>{n}</button>
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: T.dialogSub, marginBottom: 10 }}>hoặc nhập số tuỳ ý</p>

      <input type="number" min={5} max={20} value={count}
        onChange={e => { setCount(e.target.value); setError(""); }}
        onKeyDown={e => e.key === "Enter" && confirm()}
        placeholder="Nhập số từ 5 đến 20..."
        className="chatai-dialog-input"
        style={{
          width: "100%", padding: "10px 14px", fontSize: 13, fontWeight: 600,
          border: `1.5px solid ${T.dialogInputBdr}`, borderRadius: 12,
          outline: "none", textAlign: "center",
          background: T.dialogInput, color: T.dialogInputClr,
          boxSizing: "border-box", fontFamily: "inherit",
          transition: "background 0.2s, border-color 0.2s, color 0.2s",
        }}/>

      {error && <p style={{ fontSize: 11, color: "#ef4444", textAlign: "center", marginTop: 6 }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={onCancel}
          style={{
            flex: 1, padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 500,
            border: `1.5px solid ${T.dialogBtnBdr}`, background: T.dialogBtnBg,
            color: T.dialogBtnClr, cursor: "pointer", fontFamily: "inherit",
          }}>Huỷ</button>
        <button onClick={confirm}
          style={{
            flex: 1, padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
            border: "none", background: grad, color: "#fff", cursor: "pointer",
            boxShadow: `0 4px 16px ${color}40`, fontFamily: "inherit",
          }}>Tạo ngay ✦</button>
      </div>
    </div></div>
  );

  // ── Step: loading ──
  if (step === "loading") return (
    <div style={overlay}><div style={{ ...card, width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: grad,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ActionIcon size={20} style={{ color: "#fff" }}/>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: T.loadText, margin: 0 }}>Đang tạo {title}...</p>
      <CircularProgress percent={percent} color={color}/>
      <p style={{ fontSize: 11, color: T.loadSub, textAlign: "center", margin: 0 }}>
        {percent < 30 ? "Đang phân tích tài liệu..." : percent < 60 ? "Đang tạo nội dung..." : percent < 90 ? "Hoàn thiện câu hỏi..." : "Sắp xong rồi..."}
      </p>
    </div></div>
  );

  // ── Step: done ──
  const ok = !resultMsg.startsWith("Có lỗi");
  return (
    <div style={overlay}><div style={{ ...card, width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%",
        background: ok ? T.okCircleBg : T.errCircleBg,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {ok
          ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        }
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.dialogTitle, textAlign: "center" }}>
        {ok ? `${title} hoàn tất!` : "Có lỗi xảy ra"}
      </div>
      <p style={{ fontSize: 12, color: T.dialogSub, textAlign: "center", lineHeight: 1.6, margin: 0 }}>{resultMsg}</p>
      <button onClick={onCancel}
        style={{ width: "100%", padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
          border: "none", background: grad, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Đóng</button>
    </div></div>
  );
}