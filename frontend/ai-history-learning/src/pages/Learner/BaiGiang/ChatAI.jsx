import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Plus, Search, HelpCircle, Settings, 
  FileText, Loader2, RotateCcw, MessageSquare, Bot, 
  MoreHorizontal, Sun, Moon, Clock, BookOpen
} from "lucide-react";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// IMPORT LOGO WEBSITE
import logoWeb from "@/assets/img/logo.jpg";

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

// ĐÃ CẬP NHẬT: Thay đổi nhãn và lệnh cho 2 tính năng learner mới
const QUICK_ACTIONS = [
  { label: "Tóm tắt", cmd: "tóm tắt", Icon: FileText, grad: "linear-gradient(135deg, #3b82f6, #2dd4bf)" },
  { label: "Giải thích", cmd: "giải thích", Icon: BookOpen, grad: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { label: "Hỏi đáp", cmd: "hỏi đáp", Icon: HelpCircle, grad: "linear-gradient(135deg, #f59e0b, #ef4444)" }
];

const ChatAI = ({ documentId, documentTitle }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeSide, setActiveSide] = useState("chat");
  
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [userProfile, setUserProfile] = useState({
    fullName: "Đang tải...",
    profileImage: null,
    role: "LEARNER"
  });

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const T = dark ? THEME.dark : THEME.light;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        if (res.data?.success) setUserProfile(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy thông tin cá nhân:", err);
      }
    };
    fetchUserProfile();
  }, []);

  const fetchChatHistory = async () => {
    if (!documentId) return;
    try {
      const res = await api.get(`/ai/chat-history/${documentId}`);
      if (res.data?.success) {
        const formattedMessages = res.data.data.map((item, idx) => ({
          id: idx,
          text: item.content,
          sender: item.role === "assistant" ? "ai" : "user",
          timestamp: item.timestamp
        }));
        setMessages(formattedMessages);

        const userQueries = res.data.data
          .filter(item => item.role === "user")
          .map((item, idx) => ({
            id: idx,
            title: item.content,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          .reverse(); 
        
        setChatHistoryList(userQueries);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử chat:", err);
      if(messages.length === 0) {
         setMessages([{ id: "welcome", text: "Chào bạn! Tôi là trợ lý AI. Hãy đặt câu hỏi về tài liệu này nhé.", sender: "ai" }]);
      }
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (command = null) => {
    const content = command || input.trim();
    if (!content || !documentId || isTyping) return;

    // Hiển thị tin nhắn người dùng
    const userMsg = { id: Date.now(), text: content, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      let res;
      const lowerInput = content.toLowerCase();

      // ĐÃ SỬA: Điều hướng API cho 2 mục mới của Learner
      if (lowerInput === "giải thích") {
        // Nếu nhấn nút nhanh mà chưa nhập text, AI sẽ hỏi khái niệm cần giải thích
        addAiMsg("Bạn hãy nhập khái niệm trong tài liệu cần tôi giải thích nhé!");
      } 
      else if (lowerInput === "hỏi đáp") {
        addAiMsg("Mời bạn đặt câu hỏi liên quan đến nội dung tài liệu này.");
      }
      else if (lowerInput.includes("tóm tắt")) {
        res = await api.post("/ai/generate-summary", { documentId });
        if (res.data?.success) addAiMsg(`📋 **Tóm tắt:**\n\n${res.data.data.summary}`);
      } 
      else {
        // LOGIC XỬ LÝ CHÍNH: Phân loại dựa trên nội dung nếu người dùng gõ trực tiếp
        // Nếu nội dung chứa từ "giải thích", gọi API explain-concept
        if (content.toLowerCase().startsWith("giải thích")) {
          const concept = content.replace(/giải thích/i, "").trim();
          res = await api.post("/ai/explain-concept", { 
            documentId, 
            concept: concept || "Nội dung tổng quát" 
          });
          if (res.data?.success) {
            addAiMsg(`🔍 **Giải thích khái niệm:**\n\n${res.data.data.explanation}`);
          }
        } else {
          // Mặc định gọi API chat cho mọi câu hỏi khác
          res = await api.post("/api/v1/ai/chat", { documentId, question: content });
          if (res.data?.success) {
             addAiMsg(res.data.data.answer);
             setTimeout(fetchChatHistory, 1000);
          }
        }
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
    setMessages([{ id: Date.now(), text: "Phiên chat mới đã bắt đầu! Tôi có thể giúp gì cho bạn?", sender: "ai" }]);
    setActiveSide("chat");
  };

  return (
    <>
      <style>{`
        .ai-markdown p { margin-bottom: 0.75em; }
        .ai-markdown p:last-child { margin-bottom: 0; }
        .ai-markdown ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.75em; }
        .ai-markdown ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.75em; }
        .ai-markdown li { margin-bottom: 0.25em; }
        .ai-markdown strong { font-weight: bold; color: inherit; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        display: "flex", width: "100%", height: "650px",
        fontFamily: "sans-serif", borderRadius: 16, overflow: "hidden",
        border: `1px solid ${T.chatBorder}`,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        background: T.chatBg
      }}>
        
        {/* --- SIDEBAR --- */}
        <div style={{ width: 260, background: T.sidebar, borderRight: `1px solid ${T.sbBorder}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${T.sbBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.sidebar2, padding: "6px 8px", borderRadius: 10, border: `1px solid ${T.sbBorder}` }}>
               <img src={logoWeb} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
               <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.sbBright, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>AI History</div>
                  <div style={{ fontSize: 10, color: T.sbMuted }}>Learning Platform</div>
               </div>
            </div>
          </div>

          <div className="scrollbar-hide" style={{ flex: 1, padding: 10, overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.sbMuted, marginBottom: 8, textTransform: "uppercase", paddingLeft: 8 }}>Menu</div>
            <button onClick={() => setActiveSide("chat")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 8, border: "none", background: activeSide === "chat" ? T.sbHover : "transparent", color: activeSide === "chat" ? "#6366f1" : T.sbDim, fontWeight: activeSide === "chat" ? 600 : 400, cursor: "pointer", marginBottom: 4 }}>
              <MessageSquare size={16} /> <span style={{ fontSize: 13 }}>Hội thoại hiện tại</span>
            </button>
            <button onClick={handleNewChat} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 8, border: "none", background: "transparent", color: T.sbDim, cursor: "pointer", marginBottom: 4 }}>
              <RotateCcw size={16} /> <span style={{ fontSize: 13 }}>Làm mới chat</span>
            </button>
            
            <div style={{ height: 1, background: T.sbBorder, margin: "15px 8px" }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: T.sbMuted, marginBottom: 8, textTransform: "uppercase", paddingLeft: 8 }}>Lịch sử gần đây</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {chatHistoryList.length > 0 ? chatHistoryList.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveSide("chat")}
                        style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", transition: "0.2s" }}
                        className="group"
                        onMouseEnter={(e) => e.currentTarget.style.background = T.sbHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <Clock size={14} style={{ marginTop: 2, color: T.sbMuted }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, color: T.sbDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                                <div style={{ fontSize: 9, color: T.sbMuted, marginTop: 2 }}>{item.time}</div>
                            </div>
                        </div>
                    </button>
                )) : (
                    <div style={{ padding: "10px", fontSize: 11, color: T.sbMuted, fontStyle: "italic" }}>Chưa có hội thoại nào</div>
                )}
            </div>

            <div style={{ height: 1, background: T.sbBorder, margin: "15px 8px" }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: T.sbMuted, marginBottom: 8, textTransform: "uppercase", paddingLeft: 8 }}>Công cụ nhanh</div>
            {QUICK_ACTIONS.map(qa => (
              <button key={qa.cmd} onClick={() => handleSend(qa.cmd)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 8, border: "none", background: "transparent", color: T.sbDim, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: qa.grad, color: "white" }}>
                  <qa.Icon size={16} />
                </div>
                <span style={{ fontSize: 13 }}>{qa.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: 16, borderTop: `1px solid ${T.sbBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
            {userProfile.profileImage ? (
              <img src={userProfile.profileImage} alt="Avatar" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover", border: `1px solid ${T.sbBorder}` }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: 10, background: GRAD.indigo, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 14 }}>
                {userProfile.fullName.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.sbBright, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userProfile.fullName}</div>
              <div style={{ fontSize: 10, color: T.sbMuted, textTransform: "capitalize" }}>{userProfile.role === "LEARNER" ? "Học sinh" : "Giáo viên"}</div>
            </div>
          </div>
        </div>

        {/* --- MAIN CHAT --- */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${T.chatBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: GRAD.indigo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={22} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.titleColor }}>Trợ lý Học tập AI</div>
                <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} /> Trực tuyến
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDark(!dark)} style={{ border: `1px solid ${T.btnBorder}`, background: T.btnBg, width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.btnIcon }}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20, background: T.surface }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ alignSelf: msg.sender === "ai" ? "flex-start" : "flex-end", maxWidth: "85%", display: "flex", flexDirection: "column", alignItems: msg.sender === "ai" ? "flex-start" : "flex-end" }}>
                <div className={msg.sender === "ai" ? "ai-markdown" : ""} style={{ padding: "12px 16px", borderRadius: msg.sender === "ai" ? "16px 16px 16px 4px" : "16px 16px 4px 16px", fontSize: 14, lineHeight: 1.6, background: msg.sender === "ai" ? T.msgAiBg : GRAD.indigo, color: msg.sender === "ai" ? T.msgAiColor : "white", border: msg.sender === "ai" ? `1px solid ${T.chatBorder}` : "none", wordBreak: "break-word" }}>
                  {msg.sender === "ai" ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: T.msgAiBg, borderRadius: "16px 16px 16px 4px", border: `1px solid ${T.chatBorder}`, width: "fit-content" }}>
                <Loader2 size={14} className="animate-spin" style={{ color: "#6366f1" }} /> 
                <span style={{ fontSize: 13, color: T.subColor }}>AI đang trả lời...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.chatBorder}`, background: T.chatBg }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, borderRadius: 14, padding: "8px 12px" }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Nhập nội dung hoặc chọn công cụ nhanh..."
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", fontSize: 14, color: T.titleColor, padding: "8px 0", maxHeight: "150px" }}
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} style={{ background: input.trim() ? GRAD.indigo : "#e4e4e7", border: "none", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Send size={18} color={input.trim() ? "white" : "#a1a1aa"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatAI;