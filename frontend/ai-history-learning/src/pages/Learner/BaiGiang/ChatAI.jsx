import React, { useState, useRef } from "react";
import { Send, Plus, ChevronDown, Search, Image as ImageIcon, Settings, ChevronsUpDown, FileText } from "lucide-react";

// Import Assets
import logoApp from "../../../assets/logo.jpg"; 
import logoAI from "../../../assets/logoGV.webp"; 
import logoUserDefault from "../../../assets/logohs.png";

const ChatAI = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào, tôi là trợ lý lịch sử. Tôi có thể giúp gì cho bạn?", sender: "ai" },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("vi");
  const [userData, setUserData] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    avatar: logoUserDefault
  });

  // Refs cho các loại file khác nhau
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: language === "vi" ? "Đang xử lý câu hỏi của bạn..." : "Processing your request...", 
          sender: "ai" 
        }
      ]);
    }, 1000);
  };

  const handleNewChat = () => {
    setMessages([{ 
      id: Date.now(), 
      text: language === "vi" ? "Phiên chat mới đã bắt đầu." : "New chat started.", 
      sender: "ai" 
    }]);
  };

  // Hàm xử lý khi chọn file PDF
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Vui lòng chỉ chọn định dạng PDF");
        return;
      }
      // Gửi thông báo giả lập vào chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `[Tài liệu]: ${file.name}`,
        sender: "user"
      }]);
      alert(`Đã tải lên file: ${file.name}. Hệ thống AI đang phân tích nội dung PDF...`);
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
              <p className="text-sm text-[#3F3F46] py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer truncate italic">Chiến tranh Điện Biên Phủ</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-auto border-t pt-4">
            <div className="flex items-center gap-3 p-2 text-sm text-[#3F3F46] hover:bg-gray-100 rounded cursor-pointer">
              <Search size={16} /> Tìm kiếm chat
            </div>
            <div 
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-3 p-2 text-sm text-[#3F3F46] hover:bg-gray-100 rounded cursor-pointer"
            >
              <ImageIcon size={16} /> Images
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" />
            </div>
            <div 
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="flex items-center gap-3 p-2 text-sm text-[#3F3F46] hover:bg-gray-100 rounded cursor-pointer"
            >
              <Settings size={16} /> 
              {language === "vi" ? "Tiếng Việt" : "English"}
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
        {/* Chat Header */}
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
          
          {/* Nút dấu cộng (+) để tải PDF */}
          <button 
            onClick={() => pdfInputRef.current.click()}
            title="Tải lên tài liệu PDF"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E4E4E7] shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Plus size={20} />
            <input 
              type="file" 
              ref={pdfInputRef} 
              onChange={handlePdfChange} 
              className="hidden" 
              accept=".pdf" 
            />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === "ai" ? "items-start" : "items-end"}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[14px] shadow-sm flex items-center gap-2 ${
                msg.sender === "ai" 
                ? "bg-[#F4F4F5] text-[#09090B] rounded-tl-none" 
                : "bg-[#1473E6] text-white rounded-tr-none"
              }`}>
                {msg.text.startsWith("[Tài liệu]") && <FileText size={16} />}
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Compose */}
        <div className="p-6 border-t border-[#E4E4E7]">
          <div className="flex items-center gap-2 p-1 border border-[#E4E4E7] rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={language === "vi" ? "Hỏi AI về tài liệu vừa tải lên..." : "Ask AI about the uploaded document..."}
              className="flex-1 px-4 py-2 outline-none text-sm text-[#09090B]"
            />
            <button 
              onClick={handleSend}
              className="bg-[#1473E6] text-white p-2 rounded-md hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;