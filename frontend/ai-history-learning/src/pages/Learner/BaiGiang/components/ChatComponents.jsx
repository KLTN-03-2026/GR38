import React from "react";
import { Sun, Moon, Check } from "lucide-react";
import { GRAD } from "../constants/chatConstants";

// 1. Component bong bóng chat
export const Bubble = ({ msg, T }) => (
  <div style={{
    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "2px 18px 18px 18px",
    background: msg.role === "user" ? GRAD.indigo : T.msgAiBg,
    color: msg.role === "user" ? "white" : T.titleColor,
    border: msg.role === "user" ? "none" : `1px solid ${T.msgAiBorder}`,
    fontSize: "13.5px", 
    lineHeight: "1.6",
    boxShadow: msg.role === "user" ? "0 4px 12px rgba(99,102,241,0.2)" : "none"
  }}>
    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
  </div>
);

// 2. Component hiệu ứng đang nhập
export const TypingDots = ({ T }) => (
  <div style={{ 
    display: "flex", 
    gap: 5, 
    padding: "12px 18px", 
    background: T.msgAiBg, 
    borderRadius: "2px 18px 18px 18px", 
    width: "fit-content", 
    border: `1px solid ${T.msgAiBorder}` 
  }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ 
        width: 6, 
        height: 6, 
        borderRadius: "50%", 
        background: T.sbMuted, 
        animation: "chatai-pulse 1.4s infinite ease-in-out", 
        animationDelay: `${i * 0.2}s` 
      }} />
    ))}
  </div>
);

// 3. Nút chuyển đổi giao diện Sáng/Tối
export const ThemeToggle = ({ dark, onToggle, T }) => (
  <button 
    onClick={onToggle} 
    className="chatai-fbtn"
    style={{ 
      "--fbtn-hover": dark ? "#252535" : "#f3f4f6",
      width: 30, height: 30, borderRadius: 8,
      border: `0.5px solid ${T.btnBorder}`, 
      background: T.btnBg, 
      cursor: "pointer", 
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.2s" 
    }}
  >
    {dark ? <Sun size={14} style={{color: "#fbbf24"}} /> : <Moon size={14} style={{color: "#6366f1"}} />}
  </button>
);

// 4. Modal chọn số lượng (Flashcard/Quiz)
export const CountPickerDialog = ({ action, onConfirm, onCancel, dark, T }) => {
  const [val, setVal] = React.useState(5);
  const options = [5, 10, 15, 20];

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: dark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        width: 280, background: T.chatBg, borderRadius: 16, padding: 20,
        border: `1px solid ${T.chatBorder}`, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)"
      }}>
        <h4 style={{ margin: "0 0 16px", fontSize: 15, color: T.titleColor, textAlign: "center" }}>
          Tạo {action === "quiz" ? "bài trắc nghiệm" : "bộ flashcard"}
        </h4>
        <p style={{ fontSize: 12, color: T.subColor, textAlign: "center", marginBottom: 20 }}>
          Bạn muốn tạo bao nhiêu câu?
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {options.map(opt => (
            <button key={opt} onClick={() => setVal(opt)}
              style={{
                padding: "10px", borderRadius: 10, border: `2px solid ${val === opt ? "#6366f1" : T.chatBorder}`,
                background: val === opt ? (dark ? "#2d2d44" : "#eef2ff") : "transparent",
                color: val === opt ? "#6366f1" : T.subColor, cursor: "pointer", fontWeight: 600
              }}>
              {opt} câu
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: dark ? "#333" : "#eee", color: T.titleColor, cursor: "pointer" }}>Hủy</button>
          <button onClick={() => onConfirm(val)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: GRAD.indigo, color: "white", fontWeight: 600, cursor: "pointer" }}>Bắt đầu</button>
        </div>
      </div>
    </div>
  );
};

// 5. Item trong Sidebar
export const SidebarItem = ({ Icon, label, active, onClick, T }) => (
  <div 
    onClick={onClick}
    className="chatai-hbtn"
    style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
      cursor: "pointer", background: active ? T.sbHover : "transparent",
      color: active ? T.sbBright : T.sbDim, transition: "0.2s"
    }}
  >
    <Icon size={14} style={{ opacity: active ? 1 : 0.6 }} />
    <span style={{ fontSize: 12, fontWeight: active ? 600 : 400 }}>{label}</span>
  </div>
);

// 6. Nút hành động nhanh
export const ActionItem = ({ Icon, label, grad, onClick, T }) => (
  <div 
    onClick={onClick}
    className="chatai-hbtn"
    style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
      cursor: "pointer", transition: "0.2s"
    }}
  >
    <div style={{ 
      width: 24, height: 24, borderRadius: 6, background: grad, 
      display: "flex", alignItems: "center", justifyContent: "center" 
    }}>
      <Icon size={12} color="white" />
    </div>
    <span style={{ fontSize: 12, color: T.sbDim }}>{label}</span>
  </div>
);