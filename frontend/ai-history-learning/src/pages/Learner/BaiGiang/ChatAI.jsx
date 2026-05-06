import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Plus, Search, Image as ImageIcon, Settings, 
  ChevronsUpDown, FileText, Loader2, AlertCircle, 
  RotateCcw, MessageSquare, Bot, MoreHorizontal,
  Sun, Moon, Check
} from "lucide-react";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- CONSTANTS & THEMES ---
const GRAD = {
  indigo: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
};

const THEME = {
  light: {
    sidebar: "#FAFAFA", sidebar2: "#FFFFFF", sbBorder: "#E5E7EB", sbHover: "#F3F4F6", sbBright: "#18181B", sbDim: "#3F3F46", sbMuted: "#71717A",
    chatBg: "#FFFFFF", chatBorder: "#E4E4E7", surface: "#FFFFFF",
    titleColor: "#09090B", subColor: "#71717A",
    inputBg: "#FFFFFF", inputBorder: "#E4E4E7",
    msgAiBg: "#F4F4F5", msgAiColor: "#09090B", msgUserBg: "#1473E6", msgUserColor: "#FFFFFF",
    btnBg: "#FFFFFF", btnBorder: "#E4E4E7", btnIcon: "#3F3F46",
    teacherBadgeBg: "#F4F4F5", teacherBadgeClr: "#71717A", hintColor: "#A1A1AA"
  },
  dark: {
    sidebar: "#09090B", sidebar2: "#18181B", sbBorder: "rgba(255,255,255,0.1)", sbHover: "#27272A", sbBright: "#FAFAFA", sbDim: "#D4D4D8", sbMuted: "#A1A1AA",
    chatBg: "#09090B", chatBorder: "rgba(255,255,255,0.1)", surface: "#09090B",
    titleColor: "#FAFAFA", subColor: "#A1A1AA",
    inputBg: "#18181B", inputBorder: "rgba(255,255,255,0.1)",
    msgAiBg: "#18181B", msgAiColor: "#F4F4F5", msgUserBg: "#1473E6", msgUserColor: "#FFFFFF",
    btnBg: "#18181B", btnBorder: "rgba(255,255,255,0.1)", btnIcon: "#A1A1AA",
    teacherBadgeBg: "#27272A", teacherBadgeClr: "#A1A1AA", hintColor: "#52525B"
  }
};

const QUICK_ACTIONS = [
  { label: "Tóm tắt", cmd: "tóm tắt", Icon: FileText, grad: "linear-gradient(135deg, #3b82f6, #2dd4bf)" },
  { label: "Tạo Flashcard", cmd: "tạo flashcard", Icon: ImageIcon, grad: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { label: "Tạo Quiz", cmd: "tạo quiz", Icon: Settings, grad: "linear-gradient(135deg, #f59e0b, #ef4444)" }
];

// --- MAIN COMPONENT ---
const ChatAI = ({ documentId, documentTitle }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeSide, setActiveSide] = useState("chat");
  const [userData] = useState({
    name: "Lương Công Phúc",
    email: "congphuc@example.com",
    avatar: "" // Có thể thay bằng logoUserDefault
  });

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const T = dark ? THEME.dark : THEME.light;

  // Fetch lịch sử chat
  useEffect(() => {
    const fetchHistory = async () => {
      if (!documentId) return;
      setIsLoadingHistory(true);
      try {
        const res = await api.get(`/ai/chat-history/${documentId}`);
        if (res.data?.success) {
          const history = res.data.data.map((item, idx) => ({
            id: idx,
            text: item.content,
            sender: item.role === "assistant" ? "ai" : "user"
          }));
          setMessages(history);
        }
      } catch (err) {
        console.error("Lỗi tải lịch sử chat:", err);
        setMessages([{ id: "welcome", text: "Chào bạn! Tôi là trợ lý AI. Hãy đặt câu hỏi về tài liệu này nhé.", sender: "ai" }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [documentId]);

  // Scroll xuống cuối
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (command = null) => {
    const content = command || input.trim();
    if (!content || !documentId || isTyping) return;

    const userMsg = { id: Date.now(), text: content, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      let res;
      const lowerInput = content.toLowerCase();

      if (lowerInput.includes("tạo flashcard")) {
        res = await api.post("/ai/generate-flashcards", { documentId, count: 10 });
        if (res.data?.success) addAiMsg(`✨ Đã tạo xong **${res.data.data?.cards?.length || 0}** Flashcards!`);
      } else if (lowerInput.includes("tạo quiz")) {
        res = await api.post("/ai/generate-quiz", { documentId, numQuestions: 5 });
        if (res.data?.success) addAiMsg(`📝 Tôi đã chuẩn bị xong Quiz gồm **${res.data.data?.totalQuestions || 0}** câu hỏi.`);
      } else if (lowerInput.includes("tóm tắt")) {
        res = await api.post("/ai/generate-summary", { documentId });
        if (res.data?.success) addAiMsg(`📋 **Tóm tắt:**\n\n${res.data.data.summary}`);
      } else {
        res = await api.post("/ai/chat", { documentId, question: content });
        if (res.data?.success) addAiMsg(res.data.data.answer);
      }
    } catch (err) {
      addAiMsg("❌ Hệ thống gặp sự cố kết nối. Vui lòng thử lại.");
    } finally {
      setIsTyping(false);
    }
  };

  const addAiMsg = (text) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender: "ai" }]);
  };

  const handleNewChat = () => {
    setMessages([{ id: Date.now(), text: "Phiên chat mới đã bắt đầu!", sender: "ai" }]);
  };

  return (
    <>
      {/* Thêm CSS inline để format Markdown gọn gàng */}
      <style>{`
        .ai-markdown p { margin-bottom: 0.75em; }
        .ai-markdown p:last-child { margin-bottom: 0; }
        .ai-markdown ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.75em; }
        .ai-markdown ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.75em; }
        .ai-markdown li { margin-bottom: 0.25em; }
        .ai-markdown strong { font-weight: bold; color: inherit; }
        .ai-markdown em { font-style: italic; }
      `}</style>

      <div style={{
        display: "flex", width: "100%", height: "600px",
        fontFamily: "sans-serif", borderRadius: 16, overflow: "hidden",
        border: `1px solid ${T.chatBorder}`,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        background: T.chatBg
      }}>
        
        {/* --- SIDEBAR --- */}
        <div style={{ width: 240, background: T.sidebar, borderRight: `1px solid ${T.sbBorder}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${T.sbBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.sidebar2, padding: 8, borderRadius: 8, border: `1px solid ${T.sbBorder}` }}>
               <div style={{ width: 28, height: 28, background: GRAD.indigo, borderRadius: 6 }} />
               <span style={{ fontSize: 13, fontWeight: 600, color: T.sbBright, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {documentTitle || "Lịch sử Việt Nam"}
               </span>
            </div>
          </div>

          <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.sbMuted, marginBottom: 8, textTransform: "uppercase" }}>Menu</div>
            <button onClick={() => setActiveSide("chat")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, border: "none", background: activeSide === "chat" ? T.sbHover : "transparent", color: T.sbDim, cursor: "pointer", marginBottom: 4 }}>
              <MessageSquare size={16} /> <span style={{ fontSize: 13 }}>Chat hiện tại</span>
            </button>
            <button onClick={handleNewChat} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, border: "none", background: "transparent", color: T.sbDim, cursor: "pointer" }}>
              <RotateCcw size={16} /> <span style={{ fontSize: 13 }}>Làm mới chat</span>
            </button>
            
            <div style={{ height: 1, background: T.sbBorder, margin: "15px 0" }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: T.sbMuted, marginBottom: 8, textTransform: "uppercase" }}>Công cụ nhanh</div>
            {QUICK_ACTIONS.map(qa => (
              <button key={qa.cmd} onClick={() => handleSend(qa.cmd)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, border: "none", background: "transparent", color: T.sbDim, cursor: "pointer" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: qa.grad }} />
                <span style={{ fontSize: 13 }}>{qa.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: 16, borderTop: `1px solid ${T.sbBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ccc" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.sbBright, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userData.name}</div>
              <div style={{ fontSize: 10, color: T.sbMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Học sinh</div>
            </div>
          </div>
        </div>

        {/* --- MAIN CHAT --- */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${T.chatBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: GRAD.indigo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.titleColor }}>Trợ lý Học tập AI</div>
                <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} /> Online
                </div>
              </div>
            </div>
            <button onClick={() => setDark(!dark)} style={{ border: "none", background: "transparent", cursor: "pointer", color: T.btnIcon }}>
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Messages Scroll */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16, background: T.surface }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ alignSelf: msg.sender === "ai" ? "flex-start" : "flex-end", maxWidth: "80%" }}>
                <div 
                  className={msg.sender === "ai" ? "ai-markdown" : ""}
                  style={{ 
                    padding: "10px 16px", borderRadius: 14, fontSize: 14, lineHeight: 1.6,
                    background: msg.sender === "ai" ? T.msgAiBg : T.msgUserBg,
                    color: msg.sender === "ai" ? T.msgAiColor : T.msgUserColor,
                    border: msg.sender === "ai" ? `1px solid ${T.chatBorder}` : "none",
                    whiteSpace: msg.sender === "user" ? "pre-line" : "normal", // Đổi thành normal cho AI để Markdown tự xử lý
                    wordBreak: "break-word"
                  }}
                >
                  {msg.sender === "ai" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.subColor, fontSize: 12 }}>
                <Loader2 size={14} className="animate-spin" /> AI đang suy nghĩ...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ padding: 20, borderTop: `1px solid ${T.chatBorder}` }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 12, padding: "8px 12px" }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Hỏi AI về bài học..."
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", fontSize: 14, color: T.titleColor, padding: "8px 0" }}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isTyping}
                style={{ background: input.trim() ? GRAD.indigo : "#ccc", border: "none", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}
              >
                <Send size={18} color="white" />
              </button>
            </div>
            <p style={{ fontSize: 10, color: T.hintColor, textAlign: "center", marginTop: 8 }}>
              Dự án KLTN - Trợ lý học tập thông minh
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatAI;