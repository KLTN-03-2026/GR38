import React, { useState, useRef, useEffect } from "react";
import {
  Send, Plus, Search, Settings, ChevronsUpDown,
  FileText, Loader2, Zap, BookOpen, ClipboardList,
  AlignLeft, MessageSquare, Sparkles, ChevronRight,
  RotateCcw, Bot
} from "lucide-react";
import api from "../../../lib/api";
import logoApp from "../../../assets/logo.jpg";
import logoAI from "../../../assets/logoGV.webp";
import logoUserDefault from "../../../assets/logohs.png";

// ── Quick-action chips ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Tạo Flashcard",       icon: Zap,           cmd: "tạo flashcard",        color: "#6366f1" },
  { label: "Tạo Quiz",            icon: ClipboardList,  cmd: "tạo quiz",             color: "#f59e0b" },
  { label: "Tóm tắt tài liệu",   icon: AlignLeft,      cmd: "tóm tắt",              color: "#10b981" },
  { label: "Giải thích khái niệm",icon: BookOpen,       cmd: "giải thích khái niệm", color: "#ec4899" },
];

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isAI = msg.sender === "ai";
  return (
    <div className={`flex gap-3 ${isAI ? "items-start" : "items-end flex-row-reverse"}`}>
      {isAI && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow"
          style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}
        >
          <Bot size={15} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 text-[13.5px] leading-relaxed rounded-2xl shadow-sm
          ${isAI
            ? "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
            : "text-white rounded-tr-none"
          }`}
        style={!isAI ? { background: "linear-gradient(135deg, #6366f1, #7c3aed)" } : {}}
      >
        {msg.type === "action-result" && msg.actionIcon && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2 px-2 py-0.5
                           rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
            <msg.actionIcon size={11} />
            {msg.actionLabel}
          </span>
        )}
        <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow"
        style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}
      >
        <Bot size={15} className="text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        <span className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

// ── Sidebar item ──────────────────────────────────────────────────────────────
function SidebarItem({ icon: Icon, label, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all
        ${active
          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }`}
    >
      <Icon size={15} className={active ? "text-indigo-500" : "text-gray-400"} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 truncate">{sub}</p>}
      </div>
      {active && <ChevronRight size={12} className="text-indigo-400 shrink-0" />}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatAI({ documentId }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [isTyping, setIsTyping]     = useState(false);
  const [activeSide, setActiveSide] = useState("chat");
  const [userData] = useState({
    name: "Giáo viên",
    email: "giaovien@school.edu.vn",
    avatar: logoUserDefault,
  });

  const scrollRef   = useRef(null);
  const inputRef    = useRef(null);

  // ── Load history ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      if (!documentId) {
        setMessages([{
          id: 1,
          sender: "ai",
          text: "Xin chào! Tôi là trợ lý AI dành cho giáo viên. Bạn có thể:\n• Tạo Flashcard tự động từ tài liệu\n• Tạo bộ Quiz cho học sinh\n• Tóm tắt nội dung bài học\n• Đặt bất kỳ câu hỏi nào về tài liệu",
        }]);
        return;
      }
      try {
        const res = await api.get(`/ai/chat-history/${documentId}`);
        if (res.data?.success) {
          const history = res.data.data.map((item, i) => ({
            id: i,
            text: item.content,
            sender: item.role === "assistant" ? "ai" : "user",
          }));
          setMessages(
            history.length
              ? history
              : [{
                  id: 1,
                  sender: "ai",
                  text: "Xin chào! Tài liệu đã sẵn sàng. Hãy hỏi tôi bất cứ điều gì hoặc chọn một hành động phía dưới.",
                }]
          );
        }
      } catch {
        setMessages([{
          id: 1,
          sender: "ai",
          text: "Xin chào! Tôi là trợ lý AI dành cho giáo viên. Chọn hành động bên dưới hoặc đặt câu hỏi về tài liệu.",
        }]);
      }
    };
    fetchHistory();
  }, [documentId]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ── Add AI message helper ───────────────────────────────────────────────────
  const addAI = (text, type, icon, label) =>
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: "ai",
        text,
        type,
        actionIcon: icon,
        actionLabel: label,
      },
    ]);

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || isTyping) return;

    const lower = text.toLowerCase();
    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let res;

      if (lower.includes("tạo flashcard")) {
        res = await api.post("/ai/generate-flashcards", { documentId, count: 10 });
        if (res.data?.success) {
          const count = res.data.data?.cards?.length ?? 0;
          addAI(
            `✅ Đã tạo ${count} Flashcard thành công!\n\nBạn có thể xem và chỉnh sửa chúng trong tab Flashcard bên trái.`,
            "action-result", Zap, "Tạo Flashcard"
          );
        }
      } else if (lower.includes("tạo quiz") || lower.includes("làm bài tập")) {
        res = await api.post("/ai/generate-quiz", { documentId, numQuestions: 5, title: "Quiz ôn tập" });
        if (res.data?.success) {
          const total = res.data.data?.totalQuestions ?? 0;
          addAI(
            `📝 Đã tạo Quiz với ${total} câu hỏi!\n\nHọc sinh có thể làm bài trong mục Bài kiểm tra.`,
            "action-result", ClipboardList, "Tạo Quiz"
          );
        }
      } else if (lower.includes("tóm tắt")) {
        res = await api.post("/ai/generate-summary", { documentId });
        if (res.data?.success) {
          addAI(
            `📋 Tóm tắt tài liệu:\n\n${res.data.data.summary}`,
            "action-result", AlignLeft, "Tóm tắt"
          );
        }
      } else if (lower.includes("giải thích")) {
        const concept = text.replace(/giải thích/i, "").trim();
        res = await api.post("/ai/explain-concept", { documentId, concept: concept || text });
        if (res.data?.success) {
          addAI(res.data.data.explanation, "action-result", BookOpen, "Giải thích khái niệm");
        }
      } else {
        res = await api.post("/ai/chat", { documentId, question: text });
        if (res.data?.success) {
          addAI(res.data.data.answer);
        } else {
          addAI("AI không tìm thấy thông tin phù hợp trong tài liệu. Vui lòng thử câu hỏi khác.");
        }
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      addAI("⚠️ Xin lỗi, hệ thống gặp sự cố. Vui lòng thử lại sau.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: Date.now(),
      sender: "ai",
      text: "Phiên chat mới. Hãy đặt câu hỏi hoặc chọn một hành động!",
    }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
        .chat-scroll::-webkit-scrollbar       { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
      `}</style>

      <div
        className="flex w-full h-[680px] bg-[#f8f8fc] rounded-2xl overflow-hidden border border-gray-200 shadow-xl"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div className="w-[240px] bg-white border-r border-gray-100 flex flex-col">

          {/* Logo / doc selector */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl
                            border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                <img src={logoApp} alt="logo" className="w-full h-full object-cover" />
              </div>
              <span className="flex-1 text-xs font-semibold text-gray-700 truncate">
                {documentId ? `Tài liệu #${documentId.slice(-6)}` : "Chọn tài liệu"}
              </span>
              <ChevronsUpDown size={13} className="text-gray-400 shrink-0" />
            </div>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider px-2 mb-1">
              Phiên chat
            </p>

            <SidebarItem
              icon={MessageSquare}
              label="Chat hiện tại"
              sub={documentId ? `doc-${documentId.slice(-6)}` : "Chưa chọn"}
              active={activeSide === "chat"}
              onClick={() => setActiveSide("chat")}
            />

            <button
              onClick={handleNewChat}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500
                         hover:bg-gray-50 hover:text-gray-700 transition-all w-full text-left"
            >
              <RotateCcw size={14} className="text-gray-400" />
              <span className="text-xs font-medium">Chat mới</span>
            </button>

            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider px-2 mt-3 mb-1">
              Công cụ giáo viên
            </p>

            {QUICK_ACTIONS.map(qa => (
              <SidebarItem
                key={qa.cmd}
                icon={qa.icon}
                label={qa.label}
                active={activeSide === qa.cmd}
                onClick={() => { setActiveSide(qa.cmd); handleSend(qa.cmd); }}
              />
            ))}

            <div className="mt-4 pt-4 flex flex-col gap-1 border-t border-gray-100">
              <SidebarItem icon={Search}   label="Tìm kiếm chat" onClick={() => {}} />
              <SidebarItem icon={Settings} label="Cài đặt"       onClick={() => {}} />
            </div>
          </div>

          {/* User profile */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2.5 p-2 hover:bg-gray-50 rounded-xl
                            cursor-pointer transition-all">
              <img
                src={userData.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{userData.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{userData.email}</p>
              </div>
              <ChevronsUpDown size={12} className="text-gray-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* ── MAIN CHAT ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                <img src={logoAI} alt="AI" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-800">Trợ lý Giáo viên AI</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                                   bg-indigo-50 text-indigo-600 border border-indigo-100">
                    TEACHER
                  </span>
                </div>
                <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  Ăn tài liệu và bắt đầu chat
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto chat-scroll px-5 py-4 flex flex-col gap-4"
          >
            {messages.map(msg => (
              <Bubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingDots />}
          </div>

          {/* Quick action chips */}
          <div className="px-5 pt-3 pb-2 flex gap-2 flex-wrap bg-white border-t border-gray-100 shrink-0">
            {QUICK_ACTIONS.map(qa => (
              <button
                key={qa.cmd}
                onClick={() => handleSend(qa.cmd)}
                disabled={isTyping}
                className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full
                           border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: qa.color + "40",
                  color: qa.color,
                  backgroundColor: qa.color + "10",
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = qa.color + "20"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = qa.color + "10"; }}
              >
                <qa.icon size={11} />
                {qa.label}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="px-5 py-4 bg-white shrink-0">
            <div
              className="flex items-end gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl
                          focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50
                          transition-all shadow-sm"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKey}
                placeholder="Đặt câu hỏi về tài liệu, hoặc nhập lệnh..."
                disabled={isTyping}
                className="flex-1 px-3 py-2.5 bg-transparent outline-none resize-none text-[13px]
                           text-gray-800 placeholder-gray-400 leading-relaxed"
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="mb-1 mr-1 w-9 h-9 rounded-lg flex items-center justify-center
                           text-white shadow hover:opacity-90 transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}
              >
                {isTyping
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Send size={15} />
                }
              </button>
            </div>
            <p className="text-[10px] text-gray-300 text-center mt-2">
              Enter để gửi · Shift+Enter xuống dòng
            </p>
          </div>
        </div>
      </div>
    </>
  );
}