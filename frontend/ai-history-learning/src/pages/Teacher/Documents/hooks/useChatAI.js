import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../../../lib/api";
import logoUserDefault from "../../../../assets/logohs.png";

// ✅ export default function (không phải const)
export default function useChatAI(documentId) {
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [isTyping, setIsTyping]           = useState(false);
  const [activeSide, setActiveSide]       = useState("chat");
  const [pendingAction, setPendingAction] = useState(null);
  const [dark, setDark]                   = useState(false);

  const [userData] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        name:   u?.fullName     || "Giáo viên",
        email:  u?.email        || "",
        avatar: u?.profileImage || logoUserDefault,
      };
    } catch {
      return { name: "Giáo viên", email: "", avatar: logoUserDefault };
    }
  });

  const scrollRef   = useRef(null);
  const textareaRef = useRef(null);

  const addMsg = useCallback((sender, text, extra = {}) =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender, text, ts: Date.now(), ...extra }])
  , []);

  useEffect(() => {
    const load = async () => {
      if (!documentId) {
        addMsg("ai", "Xin chào! Tôi là trợ lý AI dành cho giáo viên. Bạn có thể:\n• Tạo Flashcard tự động từ tài liệu\n• Tạo bộ Quiz cho học sinh\n• Tóm tắt nội dung bài học\n• Đặt bất kỳ câu hỏi nào về tài liệu");
        return;
      }
      try {
        const res = await api.get(`/ai/chat-history/${documentId}`);
        if (res.data?.success) {
          const hist = res.data.data.map((item, i) => ({
            id: i, text: item.content,
            sender: item.role === "assistant" ? "ai" : "user",
            ts: Date.now(),
          }));
          setMessages(hist.length ? hist : []);
          if (!hist.length) addMsg("ai", "Xin chào! Tài liệu đã sẵn sàng. Hãy hỏi tôi bất cứ điều gì hoặc chọn một hành động phía dưới.");
        }
      } catch {
        addMsg("ai", "Xin chào! Tôi là trợ lý AI dành cho giáo viên. Chọn hành động bên dưới hoặc đặt câu hỏi về tài liệu.");
      }
    };
    load();
  }, [documentId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleConfirmCount = async (num, { onDone, onError }) => {
    const action = pendingAction;
    addMsg("user", action === "flashcard" ? `Tạo ${num} Flashcard` : `Tạo ${num} câu Quiz`);
    try {
      if (action === "flashcard") {
        const res = await api.post("/ai/generate-flashcards", { documentId, count: num });
        if (res.data?.success) {
          const count = res.data.data?.cards?.length ?? 0;
          onDone(`Đã tạo ${count} Flashcard thành công!\nBạn có thể xem và chỉnh sửa trong tab Flashcard.`);
          addMsg("ai", `Đã tạo ${count} Flashcard thành công!\n\nBạn có thể xem và chỉnh sửa trong tab Flashcard.`, { type: "action-result", actionLabel: "Tạo Flashcard" });
        }
      } else {
        const res = await api.post("/ai/generate-quiz", { documentId, numQuestions: num, title: "Quiz ôn tập" });
        if (res.data?.success) {
          const total = res.data.data?.totalQuestions ?? 0;
          onDone(`Đã tạo Quiz với ${total} câu hỏi!\nNgười học có thể làm bài trong mục Quiz bên cạnh.`);
          addMsg("ai", `Đã tạo Quiz với ${total} câu hỏi!\n\nNgười học có thể làm bài trong mục Quiz bên cạnh.`, { type: "action-result", actionLabel: "Tạo Quiz" });
        }
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      onError();
    }
  };

  const handleSend = async (override) => {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;
    const lower = text.toLowerCase();
    if (lower.includes("tạo flashcard"))                               { setPendingAction("flashcard"); setInput(""); return; }
    if (lower.includes("tạo quiz") || lower.includes("làm bài tập"))  { setPendingAction("quiz");      setInput(""); return; }
    addMsg("user", text);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "40px";
    setIsTyping(true);
    try {
      let res;
      if (lower.includes("tóm tắt")) {
        res = await api.post("/ai/generate-summary", { documentId });
        if (res.data?.success) addMsg("ai", `Tóm tắt tài liệu:\n\n${res.data.data.summary}`, { type: "action-result", actionLabel: "Tóm tắt" });
      } else if (lower.includes("giải thích")) {
        const concept = text.replace(/giải thích/i, "").trim();
        res = await api.post("/ai/explain-concept", { documentId, concept: concept || text });
        if (res.data?.success) addMsg("ai", res.data.data.explanation, { type: "action-result", actionLabel: "Giải thích khái niệm" });
      } else {
        res = await api.post("/ai/chat", { documentId, question: text });
        if (res.data?.success) addMsg("ai", res.data.data.answer);
        else addMsg("ai", "AI không tìm thấy thông tin phù hợp. Vui lòng thử câu hỏi khác.");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      addMsg("ai", "Xin lỗi, hệ thống gặp sự cố. Vui lòng thử lại sau.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    addMsg("ai", "Phiên chat mới. Hãy đặt câu hỏi hoặc chọn một hành động!");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return {
    messages, input, setInput,
    isTyping, activeSide, setActiveSide,
    pendingAction, setPendingAction,
    dark, setDark,
    userData,
    scrollRef, textareaRef,
    handleSend, handleNewChat, handleKey, handleConfirmCount,
  };
}