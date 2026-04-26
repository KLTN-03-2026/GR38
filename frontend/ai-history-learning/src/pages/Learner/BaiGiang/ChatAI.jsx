import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, Search, Image as ImageIcon, Settings, ChevronsUpDown, FileText, Loader2 } from "lucide-react";
import api from "../../../lib/api"; 

// Import Assets
import logoApp from "../../../assets/logo.jpg"; 
import logoAI from "../../../assets/logoGV.webp"; 
import logoUserDefault from "../../../assets/logohs.png";

const ChatAI = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("vi");
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    avatar: logoUserDefault
  });

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const scrollRef = useRef(null);

  // 1. Lấy lịch sử chat khi vào trang
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!documentId) return;
      try {
        const res = await api.get(`/ai/chat-history/${documentId}`);
        if (res.data?.success) {
          const history = res.data.data.map((item, index) => ({
            id: index,
            text: item.content,
            sender: item.role === "assistant" ? "ai" : "user"
          }));
          setMessages(history);
        }
      } catch (err) {
        console.error("Không thể lấy lịch sử chat:", err);
        setMessages([{ id: 1, text: "Chào bạn, tôi là trợ lý AI. Hãy đặt câu hỏi hoặc yêu cầu tôi tạo Flashcard/Quiz từ tài liệu này!", sender: "ai" }]);
      }
    };
    fetchChatHistory();
  }, [documentId]);

  // Tự động cuộn xuống
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 2. Logic xử lý lệnh đặc biệt và Chat
  const handleSend = async () => {
    if (!input.trim() || !documentId || isTyping) return;

    const currentInput = input.trim();
    const lowerInput = currentInput.toLowerCase();
    
    // Thêm tin nhắn user vào UI
    const userMsg = { id: Date.now(), text: currentInput, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let res;
      
      // KIỂM TRA LỆNH: TẠO FLASHCARD
      if (lowerInput.includes("tạo flashcard")) {
        res = await api.post("/ai/generate-flashcards", { documentId, count: 10 });
        if (res.data?.success) {
          const count = res.data.data?.cards?.length || 0;
          addAiMessage(`✨ Đã tạo xong ${count} Flashcards cho bạn! Bạn có thể xem chúng ở tab Flashcard.`);
        } else {
          addAiMessage("Server không trả về dữ liệu thành công. Vui lòng kiểm tra lại tài liệu.");
        }
      } 
      // KIỂM TRA LỆNH: TẠO QUIZ
      else if (lowerInput.includes("tạo quiz") || lowerInput.includes("làm bài tập")) {
        res = await api.post("/ai/generate-quiz", { documentId, numQuestions: 5, title: "Quiz ôn tập" });
        if (res.data?.success) {
          const total = res.data.data?.totalQuestions || 0;
          addAiMessage(`📝 Tôi đã chuẩn bị xong Quiz gồm ${total} câu hỏi dựa trên nội dung tài liệu.`);
        }
      }
      // KIỂM TRA LỆNH: TÓM TẮT
      else if (lowerInput.includes("tóm tắt")) {
        res = await api.post("/ai/generate-summary", { documentId });
        if (res.data?.success) {
          addAiMessage(`📋 **Tóm tắt tài liệu:**\n${res.data.data.summary}`);
        }
      }
      // CHAT BÌNH THƯỜNG
      else {
        res = await api.post("/ai/chat", { documentId, question: currentInput });
        if (res.data?.success) {
          addAiMessage(res.data.data.answer);
        } else {
          addAiMessage("AI không thể tìm thấy thông tin phù hợp trong tài liệu này.");
        }
      }
    } catch (err) {
      console.error("Lỗi API chi tiết:", err.response?.data || err.message);
      addAiMessage("Xin lỗi, hệ thống đang gặp sự cố khi kết nối server. Hãy kiểm tra Backend hoặc API Key.");
    } finally {
      setIsTyping(false);
    }
  };

  const addAiMessage = (text) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), text, sender: "ai" }]);
  };

  const handleNewChat = () => {
    setMessages([{ 
      id: Date.now(), 
      text: "Phiên chat mới đã bắt đầu. Bạn muốn tôi giúp gì với tài liệu này?", 
      sender: "ai" 
    }]);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      alert(`Hệ thống đang xử lý file: ${file.name}`);
    }
  };

  return (
    <div className="flex w-full h-[600px] bg-white rounded-xl overflow-hidden border border-[#E4E4E7] shadow-lg font-['Inter']">
      
      {/* SIDEBAR LEFT */}
      <div className="w-[256px] bg-[#FAFAFA] border-r border-[#E5E7EB] flex flex-col">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#E5E7EB] cursor-pointer hover:bg-gray-50 transition-all">
            <div className="w-8 h-8 rounded-md overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${logoApp})` }} />
            <span className="flex-1 font-semibold text-sm text-[#3F3F46] truncate">Lịch sử Việt Nam</span>
            <ChevronsUpDown size={16} className="text-[#3F3F46]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-4">
          <div>
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center justify-between px-3 py-2 text-[#3F3F46] hover:bg-gray-100 rounded-md transition-all"
            >
              <span className="text-xs font-medium uppercase tracking-wider">New chat</span>
              <Plus size={14} />
            </button>
            <div className="mt-2 ml-2 pl-3 border-l border-[#E5E7EB] flex flex-col gap-1">
              <p className="text-sm text-[#3F3F46] py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer truncate italic">
                Tài liệu: {documentId?.slice(-6) || "Chưa chọn"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-auto border-t pt-4">
            <div className="flex items-center gap-3 p-2 text-sm text-[#3F3F46] hover:bg-gray-100 rounded cursor-pointer">
              <Search size={16} /> Tìm kiếm chat
            </div>
            <div onClick={() => imageInputRef.current.click()} className="flex items-center gap-3 p-2 text-sm text-[#3F3F46] hover:bg-gray-100 rounded cursor-pointer">
              <ImageIcon size={16} /> Images
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" />
            </div>
            <div onClick={() => setLanguage(language === "vi" ? "en" : "vi")} className="flex items-center gap-3 p-2 text-sm text-[#3F3F46] hover:bg-gray-100 rounded cursor-pointer">
              <Settings size={16} /> {language === "vi" ? "Tiếng Việt" : "English"}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-all">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img src={userData.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3F3F46] truncate">{userData.name}</p>
              <p className="text-[11px] text-[#71717A] truncate">{userData.email}</p>
            </div>
            <ChevronsUpDown size={14} className="text-[#3F3F46]" />
          </div>
        </div>
      </div>

      {/* CHAT AREA RIGHT */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E4E4E7] shadow-sm">
              <img src={logoAI} alt="AI Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#09090B]">Trợ lý Giáo viên AI</h3>
              <p className="text-[11px] text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => pdfInputRef.current.click()}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E4E4E7] shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Plus size={20} />
            <input type="file" ref={pdfInputRef} onChange={handlePdfChange} className="hidden" accept=".pdf" />
          </button>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === "ai" ? "items-start" : "items-end"}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] shadow-sm flex items-center gap-2 whitespace-pre-line ${
                msg.sender === "ai" ? "bg-[#F4F4F5] text-[#09090B] rounded-tl-none" : "bg-[#1473E6] text-white rounded-tr-none"
              }`}>
                {msg.text.includes("Flashcards") || msg.text.includes("Tài liệu") ? <FileText size={16} /> : null}
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 text-xs italic ml-2">
              <Loader2 size={14} className="animate-spin" /> AI đang xử lý...
            </div>
          )}
        </div>

        {/* Chat Compose */}
        <div className="p-6 border-t border-[#E4E4E7]">
          <div className="flex items-center gap-2 p-1 border border-[#E4E4E7] rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Gõ 'tạo flashcard', 'tạo quiz' hoặc đặt câu hỏi..."
              className="flex-1 px-4 py-2 outline-none text-sm text-[#09090B]"
              disabled={isTyping}
            />
            <button 
              onClick={handleSend}
              className="bg-[#1473E6] text-white p-2 rounded-md hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50"
              disabled={!input.trim() || isTyping}
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;