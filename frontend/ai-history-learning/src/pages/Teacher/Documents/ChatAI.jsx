import React from "react";
import logoApp from "../../../assets/logo.jpg";
import { IconBot, IconSend, IconLoader, IconRotateCcw, IconChevronsUpDown, IconSearch, IconSettings, IconMoreHoriz, IconMessageSquare } from "./icons";

import { THEME, GRAD, QUICK_ACTIONS, GLOBAL_CSS } from "./constants/chatConstants";
import useChatAI from "./hooks/useChatAI";

import Bubble            from "./components/Bubble";
import TypingDots        from "./components/TypingDots";
import ThemeToggle       from "./components/ThemeToggle";
import CountPickerDialog from "./components/CountPickerDialog";
import { SidebarItem, ActionItem } from "./components/SidebarItem";

export default function ChatAI({ documentId }) {
  const {
    messages, input, setInput,
    isTyping, activeSide, setActiveSide,
    pendingAction, setPendingAction,
    dark, setDark,
    userData,
    scrollRef, textareaRef,
    handleSend, handleNewChat, handleKey, handleConfirmCount,
  } = useChatAI(documentId);

  const T = dark ? THEME.dark : THEME.light;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {pendingAction && (
        <CountPickerDialog
          action={pendingAction}
          onConfirm={handleConfirmCount}
          onCancel={() => setPendingAction(null)}
          dark={dark}
          T={T}
        />
      )}

      <div style={{
        display: "flex", width: "100%", height: "calc(100vh - 220px)",
        fontFamily: "'DM Sans',system-ui,sans-serif", borderRadius: 20, overflow: "hidden",
        border: `0.5px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        boxShadow: dark ? "0 4px 40px rgba(0,0,0,0.45)" : "0 4px 40px rgba(0,0,0,0.09)",
        transition: "box-shadow 0.3s",
      }}>

        {/* ── SIDEBAR ──────────────────────────────────────────────── */}
        <div style={{
          width: 220, flexShrink: 0, background: T.sidebar,
          display: "flex", flexDirection: "column",
          borderRight: `0.5px solid ${T.sbBorder}`,
          position: "relative", overflow: "hidden",
          transition: "background 0.3s",
          "--sb-hover": T.sbHover,
        }}>
          <div style={{ position: "absolute", top: -70, left: -50, width: 200, height: 200, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle,rgba(91,94,244,0.16) 0%,transparent 70%)" }}/>

          {/* Doc selector */}
          <div style={{ padding: "14px 12px 10px", borderBottom: `0.5px solid ${T.sbBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.sidebar2, border: `0.5px solid ${T.sbBorder}`, borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                <img src={logoApp} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: T.sbBright, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {documentId ? `Tài liệu #${documentId.slice(-6)}` : "Chọn tài liệu"}
                </div>
                <div style={{ fontSize: 9.5, color: T.sbMuted, marginTop: 1 }}>Đang hoạt động</div>
              </div>
              <IconChevronsUpDown size={12} style={{ color: T.sbMuted, flexShrink: 0 }}/>
            </div>
          </div>

          {/* Nav */}
          <div className="chatai-sb-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sbMuted, padding: "8px 6px 4px" }}>Phiên chat</div>

            <SidebarItem Icon={IconMessageSquare} label="Chat hiện tại"
              sub={documentId ? `doc-${documentId.slice(-6)}` : "Chưa chọn"}
              active={activeSide === "chat"} onClick={() => setActiveSide("chat")} T={T}/>

            <button onClick={handleNewChat} className="chatai-hbtn"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", transition: "background 0.15s" }}>
              <IconRotateCcw size={13} style={{ color: T.sbMuted }}/>
              <span style={{ fontSize: 11.5, color: T.sbDim }}>Chat mới</span>
            </button>

            <div style={{ height: "0.5px", background: T.sbBorder, margin: "6px 4px" }}/>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sbMuted, padding: "4px 6px" }}>Công cụ</div>

            {QUICK_ACTIONS.map(qa => (
              <ActionItem key={qa.cmd} Icon={qa.Icon} label={qa.label} grad={qa.grad}
                onClick={() => { setActiveSide(qa.cmd); handleSend(qa.cmd); }} T={T}/>
            ))}

            <div style={{ height: "0.5px", background: T.sbBorder, margin: "6px 4px" }}/>
            <SidebarItem Icon={IconSearch}   label="Tìm kiếm chat" active={false} onClick={() => {}} T={T}/>
            <SidebarItem Icon={IconSettings} label="Cài đặt"       active={false} onClick={() => {}} T={T}/>
          </div>

          {/* User footer */}
          <div style={{ padding: "10px 12px", borderTop: `0.5px solid ${T.sbBorder}`, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: T.sidebar2, border: `0.5px solid ${T.sbBorder}` }}>
              <img src={userData.avatar} alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={e => { e.target.style.display = "none"; e.target.parentNode.style.background = "linear-gradient(135deg,#667eea,#764ba2)"; }}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: T.sbBright, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userData.name}</div>
              <div style={{ fontSize: 9.5, color: T.sbMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userData.email}</div>
            </div>
            <IconChevronsUpDown size={11} style={{ color: T.sbMuted, flexShrink: 0 }}/>
          </div>
        </div>

        {/* ── MAIN CHAT ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.chatBg, minWidth: 0, transition: "background 0.3s" }}>

          {/* Header */}
          <div style={{ padding: "12px 18px", background: T.chatBg, borderBottom: `0.5px solid ${T.chatBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, transition: "background 0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD.indigo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                <IconBot size={17} style={{ color: "#fff" }}/>
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: "#10b981", border: "2px solid #fff" }}/>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.titleColor }}>Trợ lý Giáo viên AI</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 7px", borderRadius: 20, background: T.teacherBadgeBg, color: T.teacherBadgeClr }}>TEACHER</span>
                </div>
                <div style={{ fontSize: 11, color: T.subColor, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "chatai-pulse 2s infinite" }}/>
                  Sẵn sàng hỗ trợ
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button className="chatai-fbtn" onClick={handleNewChat}
                style={{ "--fbtn-hover": dark ? "#252535" : "#f3f4f6", width: 30, height: 30, borderRadius: 8, border: `0.5px solid ${T.btnBorder}`, background: T.btnBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}>
                <IconRotateCcw size={13} style={{ color: T.btnIcon }}/>
              </button>
              <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} T={T}/>
              <button className="chatai-fbtn"
                style={{ "--fbtn-hover": dark ? "#252535" : "#f3f4f6", width: 30, height: 30, borderRadius: 8, border: `0.5px solid ${T.btnBorder}`, background: T.btnBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}>
                <IconMoreHoriz size={13} style={{ color: T.btnIcon }}/>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="chatai-scroll"
            style={{ "--scroll-thumb": dark ? "#2a2a3a" : "#e5e7eb", flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16, background: T.surface, transition: "background 0.3s" }}>
            {messages.map(msg => <Bubble key={msg.id} msg={msg} dark={dark} T={T}/>)}
            {isTyping && <TypingDots T={T}/>}
          </div>

          {/* Quick pills */}
          <div style={{ padding: "10px 18px", background: T.chatBg, borderTop: `0.5px solid ${T.chatBorder}`, display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0, transition: "background 0.3s" }}>
            {QUICK_ACTIONS.map(qa => {
              const pill = dark ? qa.pillDark : qa.pill;
              return (
                <button key={qa.cmd} onClick={() => handleSend(qa.cmd)} disabled={isTyping}
                  className="chatai-pill"
                  style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "5px 11px", borderRadius: 20, cursor: "pointer", border: `0.5px solid ${pill.border}`, color: pill.color, background: pill.bg, transition: "opacity 0.15s", opacity: isTyping ? 0.4 : 1, whiteSpace: "nowrap" }}>
                  <qa.Icon size={11} style={{ color: "currentColor" }}/>
                  {qa.label}
                </button>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px 14px", background: T.chatBg, flexShrink: 0, transition: "background 0.3s" }}>
            <div className="chatai-input"
              style={{ display: "flex", alignItems: "flex-end", gap: 8, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, borderRadius: 14, padding: "6px 6px 6px 14px", transition: "border-color 0.2s, background 0.2s" }}>
              <textarea ref={textareaRef} value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={handleKey}
                placeholder="Đặt câu hỏi về tài liệu, hoặc nhập lệnh..."
                disabled={isTyping}
                style={{ flex: 1, fontSize: 13, color: T.msgAiColor, background: "transparent", border: "none", outline: "none", resize: "none", lineHeight: 1.5, minHeight: 40, maxHeight: 120, padding: "6px 0", fontFamily: "inherit" }}/>
              <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
                className="chatai-send"
                style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: input.trim() && !isTyping ? GRAD.indigo : (dark ? "#252535" : "#e5e7eb"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: input.trim() && !isTyping ? "pointer" : "not-allowed", transition: "background 0.2s, opacity 0.15s", marginBottom: 1 }}>
                {isTyping
                  ? <IconLoader size={15} style={{ color: dark ? "#555570" : "#9ca3af" }}/>
                  : <IconSend   size={14} style={{ color: input.trim() ? "#fff" : (dark ? "#555570" : "#9ca3af") }}/>
                }
              </button>
            </div>
            <p style={{ fontSize: 10, color: T.hintColor, textAlign: "center", marginTop: 6, transition: "color 0.3s" }}>
              Enter để gửi · Shift+Enter xuống dòng
            </p>
          </div>
        </div>
      </div>
    </>
  );
}