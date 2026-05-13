import React, { useState, useRef, useEffect } from "react";
import { 
  Send, FileText, HelpCircle, BookOpen, Bot, Moon, Sun, 
  RotateCcw, MessageSquare, Clock, Loader2, Search, 
  Settings, ChevronUp, MoreHorizontal, X, MessageCircle, Trash2, AlertTriangle, Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "@/lib/api";
import { THEME, GRAD } from "./constants/chatConstants";

// Import logo từ đường dẫn asset
import logoHistory from "@/assets/img/logo.jpg";

// --- Sub Component: SettingsDialog ---
const SettingsDialog = ({ isOpen, onClose, language, setLanguage, T }) => {
  if (!isOpen) return null;
  
  const languages = [
    { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { id: 'en', label: 'English', flag: '🇺🇸' }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2100, padding: 20
    }}>
      <div style={{
        background: T.chatBg, width: '100%', maxWidth: 350, borderRadius: 20, padding: 24,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: `1px solid ${T.sbBorder}`,
        position: 'relative', animation: 'modalFadeIn 0.2s ease-out'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: T.subColor }}>
          <X size={20} />
        </button>
        
        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.titleColor, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={20} /> {language === 'vi' ? 'Cài đặt' : 'Settings'}
        </h3>

        <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: T.subColor }}>
          {language === 'vi' ? 'Ngôn ngữ hiển thị' : 'Display Language'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {languages.map((lang) => (
            <div 
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              style={{
                padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: language === lang.id ? `${T.sidebarActive}` : T.inputBg,
                border: `1px solid ${language === lang.id ? '#6366f1' : T.sbBorder}`,
                transition: '0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{lang.flag}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: T.titleColor }}>{lang.label}</span>
              </div>
              {language === lang.id && <Check size={18} color="#6366f1" strokeWidth={3} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Sub Component: DeleteConfirmDialog ---
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, T, language }) => {
  if (!isOpen) return null;
  const content = {
    vi: { title: "Xóa lịch sử chat?", sub: "Hành động này sẽ xóa vĩnh viễn nội dung phiên chat này. Bạn chắc chắn chứ?", cancel: "Hủy bỏ", confirm: "Xác nhận xóa" },
    en: { title: "Delete history?", sub: "This action will permanently delete this chat session. Are you sure?", cancel: "Cancel", confirm: "Confirm delete" }
  }[language];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 20
    }}>
      <div style={{
        background: T.chatBg, width: '100%', maxWidth: 400, borderRadius: 24, padding: 32,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: `1px solid ${T.sbBorder}`,
        textAlign: 'center', animation: 'modalScaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{ 
          width: 64, height: 64, background: '#FEF2F2', borderRadius: 20, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 20px auto' 
        }}>
          <Trash2 size={30} color="#EF4444" />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: T.titleColor, margin: '0 0 12px 0' }}>{content.title}</h3>
        <p style={{ fontSize: 14, color: T.subColor, margin: '0 0 28px 0', lineHeight: 1.6 }}>{content.sub}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 14, border: `1px solid ${T.sbBorder}`, background: T.inputBg, color: T.titleColor, fontWeight: 600, cursor: 'pointer' }}>{content.cancel}</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>{content.confirm}</button>
        </div>
      </div>
      <style>{`@keyframes modalScaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

// --- Sub Component: ConceptInputDialog ---
const ConceptInputDialog = ({ isOpen, onClose, onSubmit, T, language }) => {
  const [value, setValue] = useState("");
  if (!isOpen) return null;
  const content = {
    vi: { title: "Giải thích khái niệm", sub: "Nhập thuật ngữ bạn muốn AI giải thích chi tiết.", placeholder: "Ví dụ: Chiến thắng Điện Biên Phủ...", cancel: "Hủy", submit: "Giải thích ngay" },
    en: { title: "Concept Explanation", sub: "Enter the term you want AI to explain in detail.", placeholder: "Example: Blockchain...", cancel: "Cancel", submit: "Explain now" }
  }[language];

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
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.titleColor, margin: '0 0 8px 0' }}>{content.title}</h3>
          <p style={{ fontSize: 14, color: T.subColor, margin: 0 }}>{content.sub}</p>
        </div>
        <input
          autoFocus
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.titleColor, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
          placeholder={content.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) { onSubmit(value); setValue(""); onClose(); } }}
        />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.sbBorder}`, background: 'transparent', color: T.titleColor, fontWeight: 600, cursor: 'pointer' }}>{content.cancel}</button>
          <button disabled={!value.trim()} onClick={() => { onSubmit(value); setValue(""); onClose(); }} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: value.trim() ? '#6366f1' : '#E5E7EB', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{content.submit}</button>
        </div>
      </div>
      <style>{`@keyframes modalFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

const ChatAI = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null); 
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dark, setDark] = useState(false);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [language, setLanguage] = useState("vi"); // 'vi' or 'en'
  const [user, setUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [docInfo, setDocInfo] = useState({ title: "Tài liệu chưa đặt tên" });
  
  const scrollRef = useRef(null);
  const T = dark ? THEME.dark : THEME.light;

  const dict = {
    vi: {
      newChat: "Chat mới", currentSession: "Phiên hiện tại", history: "LỊCH SỬ GẦN ĐÂY", tools: "CÔNG CỤ", system: "HỆ THỐNG", 
      search: "Tìm kiếm chat", settings: "Cài đặt", placeholder: "Nhập câu hỏi...", send: "Gửi", 
      aiAssistant: "Trợ lý Giáo viên AI", ready: "Sẵn sàng hỗ trợ", noHistory: "Chưa có lịch sử", 
      typing: "AI đang xử lý...", sectionChat: "PHIÊN CHAT", initMsg: "Phiên chat mới. Hãy đặt câu hỏi hoặc chọn một hành động!",
      sumAction: "Tóm tắt tài liệu", expAction: "Giải thích khái niệm", sumLabel: "Tóm tắt", expLabel: "Giải thích"
    },
    en: {
      newChat: "New Chat", currentSession: "Current Session", history: "RECENT HISTORY", tools: "TOOLS", system: "SYSTEM", 
      search: "Search chat", settings: "Settings", placeholder: "Type a question...", send: "Send", 
      aiAssistant: "AI Teacher Assistant", ready: "Ready to help", noHistory: "No history yet", 
      typing: "AI is processing...", sectionChat: "CHAT SESSIONS", initMsg: "New session. Ask a question or choose an action!",
      sumAction: "Summarize document", expAction: "Explain concept", sumLabel: "Summary", expLabel: "Explain"
    }
  }[language];

  // Đã xóa qaAction ở đây
  const QUICK_ACTIONS = [
    { label: dict.sumAction, cmd: "tóm tắt", Icon: FileText, color: "#10B981" },
    { label: dict.expAction, cmd: "giải thích", Icon: BookOpen, color: "#DB2777" }
  ];

  const fetchDocumentDetail = async () => {
    try {
      const res = await api.get(`/documents/${documentId}`);
      if (res.data.success) {
        setDocInfo(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết tài liệu", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/ai/chat-history/${documentId}`);
      if (res.data.success) {
        const flatHistory = res.data.data || [];
        const manualBoundaries = JSON.parse(localStorage.getItem(`chat_bounds_${documentId}`) || '[]');
        const grouped = [];
        let currentSession = null;
        const SESSION_TIMEOUT_MINUTES = 30;

        flatHistory.forEach((msg) => {
          const msgTime = new Date(msg.timestamp || Date.now());
          const isManualSplit = manualBoundaries.some(b => Math.abs(new Date(b).getTime() - msgTime.getTime()) < 10000);

          if (!currentSession) {
            currentSession = { 
              id: msgTime.getTime().toString(),
              label: msg.role === 'user' ? msg.content : (language === 'vi' ? "Phiên chat mới" : "New chat"), 
              messages: [msg],
              lastTime: msgTime
            };
          } else {
            const timeDiffMinutes = (msgTime - currentSession.lastTime) / (1000 * 60);
            if (msg.role === 'user' && (timeDiffMinutes > SESSION_TIMEOUT_MINUTES || isManualSplit)) {
              grouped.push(currentSession);
              currentSession = { 
                id: msgTime.getTime().toString(),
                label: msg.content, 
                messages: [msg],
                lastTime: msgTime
              };
            } else {
              currentSession.messages.push(msg);
              currentSession.lastTime = msgTime;
              if ((currentSession.label === "Phiên chat mới" || currentSession.label === "New chat") && msg.role === 'user') {
                currentSession.label = msg.content;
              }
            }
          }
        });
        if (currentSession) grouped.push(currentSession);
        grouped.reverse(); 
        setSessions(grouped);
      }
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
    fetchDocumentDetail();
    fetchHistory();
    handleNewChat();
  }, [documentId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([{ id: 'init', text: dict.initMsg, sender: "ai" }]);
  };

  const loadSession = (session) => {
    setActiveSessionId(session.id);
    const formatted = session.messages.map((h, i) => ({
      id: `old-${session.id}-${i}`,
      text: h.content,
      sender: h.role === 'assistant' ? 'ai' : 'user'
    }));
    setMessages(formatted);
  };

  const openDeleteConfirm = (e, sessionId) => {
    e.stopPropagation();
    setDeleteTarget(sessionId);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setSessions(prev => prev.filter(s => s.id !== deleteTarget));
      if (activeSessionId === deleteTarget) handleNewChat();
      setDeleteTarget(null);
    }
  };

  const handleAction = async (command, payload = null) => {
    if (isTyping) return;
    if (command === "giải thích" && !payload) { setShowConceptModal(true); return; }

    let userText = "";
    if (payload) userText = language === 'vi' ? `Giải thích khái niệm: ${payload}` : `Explain concept: ${payload}`;
    else if (command === "tóm tắt") userText = language === 'vi' ? "Tóm tắt tài liệu này giúp tôi" : "Summarize this document for me";
    else if (command === "hỏi đáp") userText = language === 'vi' ? "Tôi muốn hỏi đáp về nội dung tài liệu" : "I want to Q&A about this document";
    else userText = input;

    if (!userText.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    const now = new Date();
    let currentId = activeSessionId;

    if (!currentId) {
      currentId = now.getTime().toString();
      setActiveSessionId(currentId);
      const bounds = JSON.parse(localStorage.getItem(`chat_bounds_${documentId}`) || '[]');
      bounds.push(now.toISOString());
      localStorage.setItem(`chat_bounds_${documentId}`, JSON.stringify(bounds));
      setSessions(prev => [{ id: currentId, label: userText, messages: [{ role: 'user', content: userText, timestamp: now }], lastTime: now }, ...prev]);
    } else {
      setSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: [...s.messages, { role: 'user', content: userText, timestamp: now }], lastTime: now } : s));
    }

    try {
      let res;
      let aiText = "";
      if (command === "tóm tắt") {
        res = await api.post("/ai/generate-summary", { documentId });
        aiText = language === 'vi' ? `📋 **Tóm tắt tài liệu:**\n\n${res.data.data.summary}` : `📋 **Document Summary:**\n\n${res.data.data.summary}`;
      } else if (command === "giải thích") {
        res = await api.post("/ai/explain-concept", { documentId, concept: payload });
        aiText = language === 'vi' ? `🔍 **Giải thích cho "${payload}":**\n\n${res.data.data.explanation}` : `🔍 **Explanation for "${payload}":**\n\n${res.data.data.explanation}`;
      } else {
        res = await api.post("/ai/chat", { documentId, question: userText });
        aiText = res.data.data.answer;
      }
      setMessages(prev => [...prev, { id: Date.now(), text: aiText, sender: "ai" }]);
      setSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: [...s.messages, { role: 'assistant', content: aiText, timestamp: new Date() }], lastTime: new Date() } : s));
    } catch (err) { 
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now(), text: language === 'vi' ? "❌ Lỗi kết nối AI." : "❌ AI connection error.", sender: "ai" }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "85vh", background: T.chatBg, fontFamily: "'Inter', sans-serif", padding: 16, boxSizing: 'border-box' }}>
      
      <SettingsDialog 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        language={language}
        setLanguage={setLanguage}
        T={T}
      />

      <ConceptInputDialog isOpen={showConceptModal} onClose={() => setShowConceptModal(false)} onSubmit={(v) => handleAction("giải thích", v)} T={T} language={language} />
      <DeleteConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} T={T} language={language} />

      <aside style={{ width: 260, borderRight: `1px solid ${T.sbBorder}`, display: 'flex', flexDirection: 'column', background: T.sidebar, borderRadius: '16px 0 0 16px' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.sbBorder}`, margin: 10, borderRadius: 12, background: T.chatBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: '#FEE2E2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={logoHistory} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.titleColor, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docInfo.title}</div>
          </div>
          <ChevronUp size={14} color={T.sbTitle} />
        </div>

        <div style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }} className="custom-scroll">
          <SectionTitle title={dict.sectionChat} T={T} />
          <SidebarItem icon={<RotateCcw size={15}/>} label={dict.newChat} T={T} onClick={handleNewChat} />
          <SidebarItem icon={<MessageSquare size={15}/>} label={dict.currentSession} active={activeSessionId === null} T={T} onClick={handleNewChat} />
          
          <SectionTitle title={dict.history} T={T} />
          <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scroll">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <SidebarItem 
                  key={session.id}
                  icon={<MessageCircle size={13} color={T.subColor}/>} 
                  label={session.label} 
                  active={activeSessionId === session.id} 
                  T={T} 
                  onClick={() => loadSession(session)}
                  onDelete={(e) => openDeleteConfirm(e, session.id)}
                  showDelete={true}
                />
              ))
            ) : (
                <div style={{ fontSize: 11, color: T.subColor, padding: '8px 12px', fontStyle: 'italic' }}>{dict.noHistory}</div>
            )}
          </div>

          <SectionTitle title={dict.tools} T={T} />
          {QUICK_ACTIONS.map(qa => (
            <SidebarItem key={qa.cmd} icon={<qa.Icon size={15} color={qa.color}/>} label={qa.label} T={T} onClick={() => handleAction(qa.cmd)} />
          ))}

          <SectionTitle title={dict.system} T={T} />
          <SidebarItem icon={<Search size={15}/>} label={dict.search} T={T} />
          <SidebarItem icon={<Settings size={15}/>} label={dict.settings} T={T} onClick={() => setShowSettingsModal(true)} />
        </div>

        <div style={{ padding: 12, borderTop: `1px solid ${T.sbBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={user?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} alt="User" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.titleColor }}>{user?.fullName || (language === 'vi' ? "Người Học" : "Learner")}</div>
            <div style={{ fontSize: 10, color: T.subColor }}>{user?.email || "learner@gmail.com"}</div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', border: `1px solid ${T.sbBorder}`, borderRadius: '0 16px 16px 0', background: T.chatBg, overflow: 'hidden' }}>
        <header style={{ padding: '12px 20px', borderBottom: `1px solid ${T.sbBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#6366f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={logoHistory} alt="AI Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.titleColor }}>{dict.aiAssistant}</span>
                <span style={{ fontSize: 9, background: '#EEF2FF', color: '#6366f1', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>AI</span>
              </div>
              <div style={{ fontSize: 11, color: '#10B981' }}>● {dict.ready}</div>
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
                fontSize: 13.5, lineHeight: '1.5'
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ textAlign: 'left', color: T.subColor, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={13} className="animate-spin" /> {dict.typing}
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: `1px solid ${T.sbBorder}` }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={() => handleAction("tóm tắt")} style={{ border: `1px solid ${T.sbBorder}`, padding: '5px 12px', borderRadius: 20, fontSize: 11, background: T.chatBg, color: T.titleColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} color="#10B981" /> {dict.sumLabel}
            </button>
            <button onClick={() => handleAction("giải thích")} style={{ border: `1px solid ${T.sbBorder}`, padding: '5px 12px', borderRadius: 20, fontSize: 11, background: T.chatBg, color: T.titleColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={13} color="#DB2777" /> {dict.expLabel}
            </button>
          </div>
          <div style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 12, padding: '6px 10px', display: 'flex', alignItems: 'center' }}>
            <input 
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', color: T.titleColor, fontSize: 13, padding: '6px' }}
              placeholder={dict.placeholder}
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
              <span style={{ fontSize: 12, fontWeight: 500 }}>{dict.send}</span>
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
        .sidebar-item-hover:hover .delete-btn { opacity: 1 !important; }
        .sidebar-item-hover .delete-btn:hover { color: #EF4444 !important; background: #FEE2E2; }
        @keyframes modalFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const SectionTitle = ({ title, T }) => <div style={{ fontSize: 10, fontWeight: 700, color: T.sbTitle, margin: '16px 8px 6px 8px', letterSpacing: '0.05em' }}>{title}</div>;

const SidebarItem = ({ icon, label, active, T, onClick, onDelete, showDelete }) => (
  <div 
    onClick={onClick} 
    className="sidebar-item-hover"
    style={{ 
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
      background: active ? T.sidebarActive : 'transparent', color: active ? '#6366f1' : T.sbText, marginBottom: 2, transition: '0.2s',
      position: 'relative'
    }}
  >
    {icon} 
    <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 400, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: showDelete ? '20px' : '0' }}>
      {label}
    </span>
    
    {showDelete && (
      <button 
        className="delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete(e); }}
        style={{ 
          position: 'absolute', right: 8, background: 'none', border: 'none', borderRadius: '6px', padding: 4, 
          cursor: 'pointer', color: T.subColor, opacity: 0, transition: '0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <X size={14} />
      </button>
    )}
  </div>
);

const HeaderBtn = ({ icon, T, onClick }) => (
  <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.sbBorder}`, background: T.chatBg, color: T.sbText, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{icon}</button>
);

export default ChatAI;