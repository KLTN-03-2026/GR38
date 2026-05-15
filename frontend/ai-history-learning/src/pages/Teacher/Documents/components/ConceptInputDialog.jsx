import React, { useState, useRef, useEffect } from "react";
import { IconBookOpen } from "../icons";
import { GRAD } from "../constants/chatConstants";

export default function ConceptInputDialog({ onConfirm, onCancel, dark, T }) {
  const [step, setStep]           = useState("pick"); // pick | loading | done
  const [concept, setConcept]     = useState("");
  const [error, setError]         = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [dots, setDots]           = useState("");
  const inputRef                  = useRef(null);

  const color = "#ec4899";
  const grad  = GRAD.pink;

  // Auto-focus input
  useEffect(() => {
    if (step === "pick") setTimeout(() => inputRef.current?.focus(), 80);
  }, [step]);

  // Animated dots khi loading
  useEffect(() => {
    if (step !== "loading") return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500);
    return () => clearInterval(iv);
  }, [step]);

  const confirm = () => {
    const trimmed = concept.trim();
    if (!trimmed) { setError("Vui lòng nhập khái niệm cần giải thích"); return; }
    if (trimmed.length < 2) { setError("Khái niệm quá ngắn, vui lòng nhập rõ hơn"); return; }
    setStep("loading");
    onConfirm(trimmed, {
      onDone:  (msg) => { setResultMsg(msg); setStep("done"); },
      onError: (msg) => { setResultMsg(msg || "Có lỗi xảy ra, vui lòng thử lại."); setStep("done"); },
    });
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); confirm(); }
    if (e.key === "Escape") onCancel();
  };

  // Gợi ý nhanh
  const suggestions = ["Chiến tranh Việt Nam", "Nhà Nguyễn", "Cách mạng tháng Tám", "Điện Biên Phủ"];

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
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...card, width: 360 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: grad, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconBookOpen size={20} style={{ color: "#fff" }}/>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.dialogTitle }}>Giải thích khái niệm</div>
            <div style={{ fontSize: 12, color: T.dialogSub, marginTop: 2 }}>Nhập khái niệm bạn muốn hiểu rõ hơn</div>
          </div>
        </div>

        {/* Gợi ý nhanh */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10.5, color: T.dialogSub, marginBottom: 8, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Gợi ý nhanh
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setConcept(s); setError(""); inputRef.current?.focus(); }}
                style={{
                  fontSize: 11, padding: "5px 10px", borderRadius: 20, cursor: "pointer",
                  border: concept === s ? "2px solid transparent" : `1.5px solid ${T.dialogPickBdr}`,
                  background: concept === s ? grad : T.dialogPickBg,
                  color: concept === s ? "#fff" : T.dialogPickClr,
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Input */}
        <textarea
          ref={inputRef}
          value={concept}
          onChange={e => { setConcept(e.target.value); setError(""); }}
          onKeyDown={handleKey}
          placeholder="Ví dụ: Phong trào Đông Du, Hiệp định Genève..."
          rows={3}
          className="chatai-dialog-input"
          style={{
            width: "100%", padding: "10px 14px", fontSize: 13,
            border: `1.5px solid ${error ? "#ef4444" : T.dialogInputBdr}`, borderRadius: 12,
            outline: "none", resize: "none",
            background: T.dialogInput, color: T.dialogInputClr,
            boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5,
            transition: "background 0.2s, border-color 0.2s, color 0.2s",
          }}/>

        {error && (
          <p style={{ fontSize: 11, color: "#ef4444", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </p>
        )}

        <p style={{ fontSize: 10.5, color: T.dialogSub, marginTop: 8, marginBottom: 16 }}>
          Enter để xác nhận · Esc để đóng
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 500,
              border: `1.5px solid ${T.dialogBtnBdr}`, background: T.dialogBtnBg,
              color: T.dialogBtnClr, cursor: "pointer", fontFamily: "inherit",
            }}>Huỷ</button>
          <button onClick={confirm}
            style={{
              flex: 2, padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: "none", background: grad, color: "#fff", cursor: "pointer",
              boxShadow: `0 4px 16px ${color}40`, fontFamily: "inherit",
            }}>Giải thích ngay ✦</button>
        </div>
      </div>
    </div>
  );

  // ── Step: loading ──
  if (step === "loading") return (
    <div style={overlay}>
      <div style={{ ...card, width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: grad,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconBookOpen size={20} style={{ color: "#fff" }}/>
        </div>

        {/* Spinner */}
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: "chatai-spin 1s linear infinite" }}>
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(128,128,128,0.2)" strokeWidth="5"/>
          <circle cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray="138" strokeDashoffset="100" strokeLinecap="round"/>
        </svg>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.loadText, margin: "0 0 4px" }}>
            Đang phân tích khái niệm{dots}
          </p>
          <p style={{ fontSize: 11, color: T.loadSub, margin: 0 }}>
            "{concept.length > 30 ? concept.slice(0, 30) + "…" : concept}"
          </p>
        </div>
      </div>
    </div>
  );

  // ── Step: done ──
  const ok = !resultMsg.startsWith("Có lỗi");
  return (
    <div style={overlay}>
      <div style={{ ...card, width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%",
          background: ok ? T.okCircleBg : T.errCircleBg,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ok
            ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.dialogTitle, textAlign: "center" }}>
          {ok ? "Đã giải thích xong!" : "Có lỗi xảy ra"}
        </div>
        <p style={{ fontSize: 12, color: T.dialogSub, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
          {ok ? "Xem kết quả trong cửa sổ chat bên cạnh." : resultMsg}
        </p>
        <button onClick={onCancel}
          style={{ width: "100%", padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
            border: "none", background: grad, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
          Đóng
        </button>
      </div>
    </div>
  );
}