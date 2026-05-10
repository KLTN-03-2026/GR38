import React, { useState, useRef, useEffect } from "react";
import { 
  Send, FileText, HelpCircle, BookOpen, Bot, Moon, Sun, 
  RotateCcw, MessageSquare, Clock, Loader2, Search, 
  Settings, ChevronUp, MoreHorizontal, X, MessageCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "@/lib/api";
import { THEME, GRAD } from "./constants/chatConstants";

// --- Sub Component: ConceptInputDialog ---
const ConceptInputDialog = ({ isOpen, onClose, onSubmit, T }) => {
  const [value, setValue] = useState("");
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: T.chatBg, width: '100%', maxWidth: 450, borderRadius: 20, padding: 24,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: `1px solid ${T.sbBorder}`,
        position: 'relative', animation: 'modalFadeIn 0.3s ease-out'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: T.subColor }}>
          <X size={20} />
        </button>
        <div style={{ marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, background: '#FDF2F8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <BookOpen size={24} color="#DB2777" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.titleColor, margin: '0 0 8px 0' }}>Giải thích khái niệm</h3>
          <p style={{ fontSize: 14, color: T.subColor, margin: 0 }}>Nhập thuật ngữ bạn muốn AI giải thích chi tiết.</p>
        </div>
        <input
          autoFocus
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.titleColor, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
          placeholder="Ví dụ: Chiến thắng Điện Biên Phủ..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) { onSubmit(value); setValue(""); onClose(); } }}
        />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.sbBorder}`, background: 'transparent', color: T.titleColor, fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
          <button disabled={!value.trim()} onClick={() => { onSubmit(value); setValue(""); onClose(); }} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: value.trim() ? '#6366f1' : '#E5E7EB', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Giải thích ngay</button>
        </div>
      </div>
      <style>{`@keyframes modalFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

const QUICK_ACTIONS = [
  { label: "Tóm tắt tài liệu", cmd: "tóm tắt", Icon: FileText, color: "#10B981" },
  { label: "Giải thích khái niệm", cmd: "giải thích", Icon: BookOpen, color: "#DB2777" },
  { label: "Hỏi đáp", cmd: "hỏi đáp", Icon: HelpCircle, color: "#F59E0B" }
];

const ChatAI = ({ documentId, documentTitle = "Tài liệu chưa đặt tên" }) => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dark, setDark] = useState(false);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [user, setUser] = useState(null);
  
  const scrollRef = useRef(null);
  const T = dark ? THEME.dark : THEME.light;

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/ai/chat-history/${documentId}`);
      if (res.data.success) setHistory(res.data.data);
    } catch (err) { console.error("Lỗi lấy lịch sử", err); }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/user/profile");
        if (res.data.success) setUser(res.data.data);
      } catch (err) { console.error("Lỗi lấy profile", err); }
    };
    fetchUserData();
    fetchHistory();
    setMessages([{ id: 'init', text: "Phiên chat mới. Hãy đặt câu hỏi hoặc chọn một hành động!", sender: "ai" }]);
  }, [documentId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleAction = async (command, payload = null) => {
    if (isTyping) return;
    
    if (command === "giải thích" && !payload) { 
      setShowConceptModal(true); 
      return; 
    }

    let userText = "";
    if (payload) userText = `Giải thích khái niệm: ${payload}`;
    else if (command === "tóm tắt") userText = "Tóm tắt tài liệu này giúp tôi";
    else if (command === "hỏi đáp") userText = "Tôi muốn hỏi đáp về nội dung tài liệu";
    else userText = input;

    if (!userText.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    try {
      let res;
      if (command === "tóm tắt") {
        res = await api.post("/ai/generate-summary", { documentId });
        addAiMsg(`📋 **Tóm tắt tài liệu:**\n\n${res.data.data.summary}`);
      } else if (command === "giải thích") {
        res = await api.post("/ai/explain-concept", { documentId, concept: payload });
        addAiMsg(`🔍 **Giải thích cho "${payload}":**\n\n${res.data.data.explanation}`);
      } else {
        res = await api.post("/ai/chat", { documentId, question: userText });
        addAiMsg(res.data.data.answer);
      }
      fetchHistory(); // Gọi lại để cập nhật lịch sử mới nhất
    } catch (err) { 
      console.error(err);
      addAiMsg("❌ Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau."); 
    } finally { 
      setIsTyping(false); 
    }
  };

  const addAiMsg = (text) => setMessages(prev => [...prev, { id: Date.now(), text, sender: "ai" }]);

  // --- LOGIC TẠO KHUNG (SESSIONS) CHO LỊCH SỬ CHAT (MỚI) ---
  // Do API trả về mảng phẳng (không có sessionId), chúng ta gộp các chat dựa trên thời gian.
  // Các câu hỏi/trả lời diễn ra liên tục sẽ nằm trong 1 lịch sử chat.
  const chatSessions = [];
  let currentSession = null;
  const SESSION_TIMEOUT_MINUTES = 30; // Khoảng cách > 30 phút giữa 2 lần chat sẽ tách thành lịch sử mới

  history.forEach((msg) => {
    const msgTime = new Date(msg.timestamp || Date.now());

    if (!currentSession) {
      // Khởi tạo phiên chat đầu tiên
      currentSession = { 
        label: msg.role === 'user' ? msg.content : "Phiên chat mới", 
        messages: [msg],
        lastTime: msgTime
      };
    } else {
      const timeDiffMinutes = (msgTime - currentSession.lastTime) / (1000 * 60);

      // Tách lịch sử mới nếu là tin nhắn của user VÀ cách lần chat trước đó quá lâu (nghĩa là lần ấn New Chat hoặc quay lại sau)
      if (msg.role === 'user' && timeDiffMinutes > SESSION_TIMEOUT_MINUTES) {
        chatSessions.push(currentSession);
        currentSession = { 
          label: msg.content, 
          messages: [msg],
          lastTime: msgTime
        };
      } else {
        // Nếu chat liên tục -> Gộp chung vào lịch sử chat hiện tại
        currentSession.messages.push(msg);
        currentSession.lastTime = msgTime;
        
        // Cập nhật lại tiêu đề lịch sử nếu đoạn đầu chưa có
        if (currentSession.label === "Phiên chat mới" && msg.role === 'user') {
          currentSession.label = msg.content;
        }
      }
    }
  });
  if (currentSession) chatSessions.push(currentSession);
  chatSessions.reverse(); // Đảo ngược để lịch sử chat mới nhất nằm trên cùng

  // Load khung chat được chọn vào màn hình chính
  const loadSessionToMainChat = (sessionMessages) => {
    if (!sessionMessages || sessionMessages.length === 0) return;
    const formatted = sessionMessages.map((h, i) => ({
      id: `old-${Date.now()}-${i}`,
      text: h.content,
      sender: h.role === 'assistant' ? 'ai' : 'user'
    }));
    setMessages(formatted);
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "85vh", background: T.chatBg, fontFamily: "'Inter', sans-serif", padding: 16, boxSizing: 'border-box' }}>
      <ConceptInputDialog 
        isOpen={showConceptModal} 
        onClose={() => setShowConceptModal(false)} 
        onSubmit={(v) => handleAction("giải thích", v)} 
        T={T} 
      />

      {/* --- SIDEBAR --- */}
      <aside style={{ width: 260, borderRight: `1px solid ${T.sbBorder}`, display: 'flex', flexDirection: 'column', background: T.sidebar, borderRadius: '16px 0 0 16px' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.sbBorder}`, margin: 10, borderRadius: 12, background: T.chatBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: '#FEE2E2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color="#EF4444" />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.titleColor, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{documentTitle}</div>
          </div>
          <ChevronUp size={14} color={T.sbTitle} />
        </div>

        <div style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }} className="custom-scroll">
          <SectionTitle title="PHIÊN CHAT" T={T} />
          <SidebarItem icon={<RotateCcw size={15}/>} label="Chat mới" T={T} onClick={() => setMessages([{ id: 'init', text: "Phiên chat mới. Hãy đặt câu hỏi!", sender: "ai" }])} />
          <SidebarItem icon={<MessageSquare size={15}/>} label="Phiên hiện tại" active T={T} />
          
          <SectionTitle title="LỊCH SỬ GẦN ĐÂY" T={T} />
          <div style={{ maxHeight: 150, overflowY: 'auto' }} className="custom-scroll">
            {/* Render các khung chat đã được gộp */}
            {chatSessions.length > 0 ? (
              chatSessions.map((session, idx) => (
                <SidebarItem 
                  key={idx}
                  icon={<MessageCircle size={13} color={T.subColor}/>} 
                  label={session.label} 
                  T={T} 
                  onClick={() => loadSessionToMainChat(session.messages)}
                />
              ))
            ) : (
                <div style={{ fontSize: 11, color: T.subColor, padding: '8px 12px', fontStyle: 'italic' }}>Chưa có lịch sử</div>
            )}
          </div>

          <SectionTitle title="CÔNG CỤ" T={T} />
          {QUICK_ACTIONS.map(qa => (
            <SidebarItem key={qa.cmd} icon={<qa.Icon size={15} color={qa.color}/>} label={qa.label} T={T} onClick={() => handleAction(qa.cmd)} />
          ))}

          <SectionTitle title="HỆ THỐNG" T={T} />
          <SidebarItem icon={<Search size={15}/>} label="Tìm kiếm chat" T={T} />
          <SidebarItem icon={<Settings size={15}/>} label="Cài đặt" T={T} />
        </div>

        <div style={{ padding: 12, borderTop: `1px solid ${T.sbBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={user?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.titleColor }}>{user?.fullName || "Người Học"}</div>
            <div style={{ fontSize: 10, color: T.subColor }}>{user?.email || "learner@gmail.com"}</div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', border: `1px solid ${T.sbBorder}`, borderRadius: '0 16px 16px 0', background: T.chatBg, overflow: 'hidden' }}>
        <header style={{ padding: '12px 20px', borderBottom: `1px solid ${T.sbBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#6366f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot color="#fff" size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.titleColor }}>Trợ lý Giáo viên AI</span>
                <span style={{ fontSize: 9, background: '#EEF2FF', color: '#6366f1', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>AI</span>
              </div>
              <div style={{ fontSize: 11, color: '#10B981' }}>● Sẵn sàng hỗ trợ</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <HeaderBtn icon={dark ? <Sun size={16}/> : <Moon size={16}/>} T={T} onClick={() => setDark(!dark)} />
            <HeaderBtn icon={<MoreHorizontal size={16}/>} T={T} />
          </div>
        </header>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scroll">
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                padding: '10px 14px', borderRadius: 14, maxWidth: '85%', 
                background: msg.sender === 'user' ? '#6366f1' : T.msgAiBg, 
                color: msg.sender === 'user' ? '#fff' : T.titleColor,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: msg.sender === 'ai' ? `1px solid ${T.sbBorder}` : 'none',
                fontSize: 13.5, 
                lineHeight: '1.5'
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ textAlign: 'left', color: T.subColor, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={13} className="animate-spin" /> AI đang xử lý...
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: `1px solid ${T.sbBorder}` }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {QUICK_ACTIONS.slice(0, 2).map(qa => (
              <button key={qa.cmd} onClick={() => handleAction(qa.cmd)} style={{ border: `1px solid ${T.sbBorder}`, padding: '5px 12px', borderRadius: 20, fontSize: 11, background: T.chatBg, color: T.titleColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <qa.Icon size={13} color={qa.color} /> {qa.label}
              </button>
            ))}
          </div>
          <div style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 12, padding: '6px 10px', display: 'flex', alignItems: 'center' }}>
            <input 
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', color: T.titleColor, fontSize: 13, padding: '6px' }}
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAction()}
            />
            <button 
              disabled={isTyping || !input.trim()}
              onClick={() => handleAction()} 
              style={{ 
                background: (isTyping || !input.trim()) ? '#A5A6F6' : '#6366f1', 
                border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, transition: '0.3s' 
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500 }}>Gửi</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
        @keyframes animate-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: animate-spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

const SectionTitle = ({ title, T }) => <div style={{ fontSize: 10, fontWeight: 700, color: T.sbTitle, margin: '16px 8px 6px 8px', letterSpacing: '0.05em' }}>{title}</div>;

const SidebarItem = ({ icon, label, active, T, onClick }) => (
  <div onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
    background: active ? T.sidebarActive : 'transparent', color: active ? '#6366f1' : T.sbText, marginBottom: 2, transition: '0.2s'
  }}>
    {icon} <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
  </div>
);

const HeaderBtn = ({ icon, T, onClick }) => (
  <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.sbBorder}`, background: T.chatBg, color: T.sbText, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{icon}</button>
);

export default ChatAI;