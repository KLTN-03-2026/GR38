import { useState, useEffect, useRef } from "react";

const useChatAI = (documentId) => {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Chào bạn! Tôi là trợ lý AI học tập. Bạn cần hỗ trợ gì về tài liệu này?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dark, setDark] = useState(false);
  
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Giả lập thông tin người dùng từ hệ thống
  const userData = {
    name: "Lương Công Phúc",
    role: "Sinh viên",
    avatar: "https://ui-avatars.com/api/?name=Phuc&background=6366f1&color=fff"
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (forcedText = null) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg = { id: Date.now(), role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Logic giả lập phản hồi của AI
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: `Tôi đã nhận được câu hỏi: "${textToSend}". Hệ thống đang xử lý kiến thức từ tài liệu...`
      }]);
    }, 1500);
  };

  return {
    messages, input, setInput, isTyping, dark, setDark,
    userData, scrollRef, textareaRef, handleSend
  };
};

export default useChatAI;