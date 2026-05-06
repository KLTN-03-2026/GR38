import { useState, useRef, useEffect, useCallback } from "react";
import api from "@/lib/api";
import logoUserDefault from "@/assets/img/logohs.png";

// ── Thông báo loading cho từng action ─────────────────────────────────────────
const LOADING_MESSAGES = {
  summary:   "Đang tóm tắt tài liệu, vui lòng chờ...",
  concept:   "Đang phân tích và giải thích khái niệm...",
  chat:      "Đang tìm câu trả lời...",
  flashcard: "Đang tạo Flashcard từ tài liệu...",
  quiz:      "Đang tạo bộ câu hỏi Quiz...",
};

// ── Thông báo lỗi cụ thể theo status ──────────────────────────────────────────
const getErrorMessage = (err, action) => {
  const status = err?.response?.status;
  const serverMsg = err?.response?.data?.error || err?.response?.data?.message;

  if (status === 401) return "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy tài liệu. Vui lòng kiểm tra lại.";
  if (status === 429) return "Hệ thống đang bận, vui lòng thử lại sau ít phút.";
  if (status >= 500)  return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  if (!err?.response) return "Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.";
  if (serverMsg)      return serverMsg;

  const defaults = {
    summary:   "Không thể tóm tắt tài liệu lúc này. Vui lòng thử lại.",
    concept:   "Không thể giải thích khái niệm lúc này. Vui lòng thử lại.",
    chat:      "AI không thể trả lời lúc này. Vui lòng thử lại.",
    flashcard: "Không thể tạo Flashcard lúc này. Vui lòng thử lại.",
    quiz:      "Không thể tạo Quiz lúc này. Vui lòng thử lại.",
  };
  return defaults[action] || "Có lỗi xảy ra. Vui lòng thử lại.";
};

// ── Helpers quản lý danh sách phiên ──────────────────────────────────────────
const SESSION_INDEX_KEY = (docId) => `chat_sessions_${docId}`;
const SESSION_KEY       = (docId, sid) => `chat_session_${docId}_${sid}`;

const getSessions = (docId) => {
  try { return JSON.parse(localStorage.getItem(SESSION_INDEX_KEY(docId)) || "[]"); }
  catch { return []; }
};

const saveSession = (docId, sid, messages) => {
  try {
    const toSave = messages.filter(m => !m.isLoading);
    if (toSave.length === 0) return;
    localStorage.setItem(SESSION_KEY(docId, sid), JSON.stringify(toSave));
    // Cập nhật index
    const sessions = getSessions(docId);
    const exists = sessions.find(s => s.id === sid);
    const preview = toSave.find(m => m.sender === "user")?.text?.slice(0, 40) || "Phiên chat";
    if (exists) {
      exists.preview = preview;
      exists.updatedAt = Date.now();
    } else {
      sessions.unshift({ id: sid, preview, createdAt: Date.now(), updatedAt: Date.now() });
    }
    // Giữ tối đa 20 phiên
    const trimmed = sessions.slice(0, 20);
    localStorage.setItem(SESSION_INDEX_KEY(docId), JSON.stringify(trimmed));
  } catch {}
};

const loadSession = (docId, sid) => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY(docId, sid)) || "[]"); }
  catch { return []; }
};

const deleteSession = (docId, sid) => {
  try {
    localStorage.removeItem(SESSION_KEY(docId, sid));
    const sessions = getSessions(docId).filter(s => s.id !== sid);
    localStorage.setItem(SESSION_INDEX_KEY(docId), JSON.stringify(sessions));
  } catch {}
};

const newSessionId = () => `s_${Date.now()}`;

export default function useChatAI(documentId) {
  // Phiên hiện tại
  const [currentSid, setCurrentSid] = useState(() => {
    if (!documentId) return newSessionId();
    const sessions = getSessions(documentId);
    return sessions[0]?.id || newSessionId();
  });

  const [messages, setMessages] = useState(() => {
    if (!documentId) return [];
    const sessions = getSessions(documentId);
    if (sessions.length === 0) return [];
    return loadSession(documentId, sessions[0].id);
  });

  // Danh sách phiên để hiển thị sidebar
  const [sessionList, setSessionList] = useState(() =>
    documentId ? getSessions(documentId) : []
  );

  const [input, setInput]                 = useState("");
  const [isTyping, setIsTyping]           = useState(false);
  const [activeSide, setActiveSide]       = useState("chat");
  const [pendingAction, setPendingAction] = useState(null);
  const [dark, setDark]                   = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  // Lưu messages vào phiên hiện tại mỗi khi thay đổi
  useEffect(() => {
    if (!documentId || messages.length === 0) return;
    saveSession(documentId, currentSid, messages);
    setSessionList(getSessions(documentId));
  }, [messages, documentId, currentSid]);

  // ── Thêm message vào danh sách ────────────────────────────────────────────
  const addMsg = useCallback((sender, text, extra = {}) =>
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender, text, ts: Date.now(), ...extra,
    }])
  , []);

  // ── Xóa loading message (dùng ref id) ─────────────────────────────────────
  const addLoadingMsg = useCallback((text) => {
    const id = Date.now() + Math.random();
    setMessages(prev => [...prev, { id, sender: "ai", text, ts: Date.now(), isLoading: true }]);
    return id;
  }, []);

  const removeMsg = useCallback((id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  // Load lịch sử chat khi mở tài liệu
  useEffect(() => {
    const load = async () => {
      if (!documentId) {
        addMsg("ai",
          "Xin chào! Tôi là trợ lý AI dành cho giáo viên. Bạn có thể:\n" +
          "• Tạo Flashcard tự động từ tài liệu\n" +
          "• Tạo bộ Quiz cho học sinh\n" +
          "• Tóm tắt nội dung bài học\n" +
          "• Giải thích bất kỳ khái niệm nào trong tài liệu"
        );
        return;
      }

      // Nếu đã có messages từ phiên hiện tại thì không fetch lại
      const existing = loadSession(documentId, currentSid);
      if (existing.length > 0) {
        setMessages(existing);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const res = await api.get(`/ai/chat-history/${documentId}`);
        if (res.data?.success) {
          const hist = res.data.data;
          if (Array.isArray(hist) && hist.length > 0) {
            const mapped = hist.map((item, i) => ({
              id: i,
              text: item.content,
              sender: item.role === "assistant" ? "ai" : "user",
              ts: Date.now(),
            }));
            setMessages(mapped);
          } else {
            addMsg("ai",
              "Xin chào! Tài liệu đã sẵn sàng. Hãy hỏi tôi bất cứ điều gì hoặc chọn một hành động phía dưới."
            );
          }
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404 || !err?.response) {
          addMsg("ai",
            "Xin chào! Tôi là trợ lý AI dành cho giáo viên. Chọn hành động bên dưới hoặc đặt câu hỏi về tài liệu."
          );
        } else {
          addMsg("ai", `Không thể tải lịch sử chat (${getErrorMessage(err, "chat")}) Bạn vẫn có thể tiếp tục chat bình thường.`);
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };
    load();
  }, [documentId]);

  // ── Auto scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // ── Xử lý confirm số lượng flashcard/quiz ─────────────────────────────────
  const handleConfirmCount = async ({ count, title, timeLimit }, { onDone, onError } = {}) => {
    const action = pendingAction;
    setPendingAction(null);

    const displayTitle = title || (action === "flashcard" ? "Flashcard mới" : "Quiz ôn tập");

    addMsg(
      "user",
      action === "flashcard"
        ? `Tạo ${count} Flashcard${title ? ` — "${title}"` : ""}`
        : `Tạo Quiz "${displayTitle}" — ${count} câu · ${timeLimit} phút`
    );

    const loadId = addLoadingMsg(LOADING_MESSAGES[action] || "Đang xử lý...");

    try {
      if (action === "flashcard") {
        const res = await api.post("/ai/generate-flashcards", {
          documentId,
          count,
          title: displayTitle,
        });
        if (res.data?.success) {
          const created = res.data.data?.cards?.length ?? count;
          const msg = `Đã tạo ${created} Flashcard thành công!\n\nBạn có thể xem và chỉnh sửa trong tab Flashcard.`;
          removeMsg(loadId);
          onDone?.(msg);
          addMsg("ai", msg, { type: "action-result", actionLabel: "Tạo Flashcard" });
        } else {
          throw new Error(res.data?.error || "Tạo flashcard thất bại");
        }
      } else {
        const res = await api.post("/ai/generate-quiz", {
          documentId,
          numQuestions: count,
          title: displayTitle,
          timeLimit,
        });
        if (res.data?.success) {
          const total = res.data.data?.totalQuestions ?? count;
          const msg = `Đã tạo Quiz "${displayTitle}" với ${total} câu hỏi · ${timeLimit} phút!\n\nHọc sinh có thể làm bài trong mục Quiz bên cạnh.`;
          removeMsg(loadId);
          onDone?.(msg);
          addMsg("ai", msg, { type: "action-result", actionLabel: "Tạo Quiz" });
        } else {
          throw new Error(res.data?.error || "Tạo quiz thất bại");
        }
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      removeMsg(loadId);
      const errMsg = getErrorMessage(err, action);
      onError?.(errMsg);
      addMsg("ai", `❌ ${errMsg}`, { type: "error" });
    }
  };

  // ── Xử lý confirm giải thích khái niệm ───────────────────────────────────
  const handleConfirmConcept = async (concept, { onDone, onError } = {}) => {
    addMsg("user", `Giải thích khái niệm: ${concept}`);
    const loadId = addLoadingMsg(LOADING_MESSAGES.concept);
    try {
      const res = await api.post("/ai/explain-concept", { documentId, concept });
      if (res.data?.success) {
        const explanation = res.data.data?.explanation || res.data.data;
        removeMsg(loadId);
        onDone?.("Đã giải thích xong!");
        addMsg("ai", explanation, { type: "action-result", actionLabel: "Giải thích khái niệm" });
      } else {
        throw new Error(res.data?.error || "Giải thích thất bại");
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      removeMsg(loadId);
      const errMsg = getErrorMessage(err, "concept");
      onError?.(errMsg);
      addMsg("ai", `❌ ${errMsg}`, { type: "error" });
    }
  };

  // ── Gửi tin nhắn / xử lý lệnh ─────────────────────────────────────────────
  const handleSend = async (override) => {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;
    const lower = text.toLowerCase();

    if (lower.includes("tạo flashcard")) {
      setPendingAction("flashcard");
      setInput("");
      return;
    }
    if (lower.includes("tạo quiz") || lower.includes("làm bài tập")) {
      setPendingAction("quiz");
      setInput("");
      return;
    }
    if (lower.includes("giải thích khái niệm") || lower === "giải thích") {
      setPendingAction("concept");
      setInput("");
      return;
    }

    addMsg("user", text);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "40px";
    setIsTyping(true);

    const loadId = addLoadingMsg(
      lower.includes("tóm tắt") ? LOADING_MESSAGES.summary : LOADING_MESSAGES.chat
    );

    try {
      let res;

      if (lower.includes("tóm tắt")) {
        res = await api.post("/ai/generate-summary", { documentId });
        removeMsg(loadId);
        if (res.data?.success) {
          const summary = res.data.data?.summary || res.data.data;
          addMsg("ai", `📄 **Tóm tắt tài liệu:**\n\n${summary}`, {
            type: "action-result", actionLabel: "Tóm tắt",
          });
        } else {
          throw new Error(res.data?.error || "Tóm tắt thất bại");
        }

      } else if (lower.includes("giải thích") && !lower.includes("khái niệm")) {
        const concept = text.replace(/giải thích/i, "").trim() || text;
        res = await api.post("/ai/explain-concept", { documentId, concept });
        removeMsg(loadId);
        if (res.data?.success) {
          const explanation = res.data.data?.explanation || res.data.data;
          addMsg("ai", explanation, { type: "action-result", actionLabel: "Giải thích khái niệm" });
        } else {
          throw new Error(res.data?.error || "Giải thích thất bại");
        }

      } else {
        res = await api.post("/ai/chat", { documentId, question: text });
        removeMsg(loadId);
        if (res.data?.success) {
          const answer = res.data.data?.answer || res.data.data;
          if (answer) {
            addMsg("ai", answer);
          } else {
            addMsg("ai", "AI không tìm thấy thông tin phù hợp trong tài liệu. Vui lòng thử câu hỏi khác.");
          }
        } else {
          throw new Error(res.data?.error || "Chat thất bại");
        }
      }

    } catch (err) {
      console.error(err?.response?.data || err.message);
      removeMsg(loadId);
      const action = lower.includes("tóm tắt") ? "summary"
                   : lower.includes("giải thích") ? "concept"
                   : "chat";
      addMsg("ai", `❌ ${getErrorMessage(err, action)}`, { type: "error" });
    } finally {
      setIsTyping(false);
    }
  };

  // Tạo phiên chat mới
  const handleNewChat = () => {
    const sid = newSessionId();
    setCurrentSid(sid);
    setMessages([]);
    addMsg("ai", "Phiên chat mới. Hãy đặt câu hỏi hoặc chọn một hành động!");
  };

  // Chuyển sang phiên cũ
  const handleSwitchSession = (sid) => {
    if (sid === currentSid) return;
    const msgs = loadSession(documentId, sid);
    setCurrentSid(sid);
    setMessages(msgs);
    setActiveSide("chat");
  };

  // Xóa phiên
  const handleDeleteSession = (sid) => {
    deleteSession(documentId, sid);
    setSessionList(getSessions(documentId));
    if (sid === currentSid) handleNewChat();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return {
    messages, input, setInput,
    isTyping, isLoadingHistory,
    activeSide, setActiveSide,
    pendingAction, setPendingAction,
    dark, setDark,
    userData,
    scrollRef, textareaRef,
    handleSend, handleNewChat, handleKey,
    handleConfirmCount,
    handleConfirmConcept,
    sessionList, currentSid,
    handleSwitchSession, handleDeleteSession,
  };
}