/**
 * AI Service - API client cho các tính năng AI học lịch sử
 *
 * Các chức năng:
 * - Chat với AI về lịch sử
 * - Tạo câu hỏi từ nội dung
 * - Kiểm tra và giải thích đáp án
 * - Tóm tắt nội dung lịch sử
 * - Gợi ý bài học tiếp theo
 */
import api from "../lib/api";

export const aiService = {
  /**
   * Chat với AI về lịch sử
   * @param {Array} messages - Lịch sử hội thoại
   * @param {string} messages[].role - Vai trò: 'user' | 'assistant'
   * @param {string} messages[].content - Nội dung tin nhắn
   * @param {string} context - Ngữ cảnh / tài liệu tham khảo
   * @returns {Promise<Object>} Phản hồi từ AI
   */
  chat: async (messages, context = "") => {
    const payload = { messages, context };
    const res = await api.post("/ai/chat", payload);
    return res.data;
  },

  /**
   * Tạo câu hỏi lịch sử từ nội dung văn bản
   * @param {string} content - Nội dung cần tạo câu hỏi
   * @param {Object} options - Tuỳ chọn
   * @param {number} options.count - Số lượng câu hỏi muốn tạo (mặc định: 5)
   * @param {string} options.difficulty - Độ khó: EASY | MEDIUM | HARD
   * @param {string} options.type - Dạng câu hỏi: MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER
   * @returns {Promise<Array>} Danh sách câu hỏi được tạo
   */
  generateQuestions: async (content, options = {}) => {
    const payload = {
      content,
      count: options.count ?? 5,
      difficulty: options.difficulty ?? "MEDIUM",
      type: options.type ?? "MULTIPLE_CHOICE",
    };
    const res = await api.post("/ai/generate-questions", payload);
    return res.data;
  },

  /**
   * Kiểm tra đáp án và nhận giải thích từ AI
   * @param {string|number} questionId - ID câu hỏi
   * @param {string} answer - Đáp án người dùng chọn
   * @returns {Promise<Object>} Kết quả đúng/sai và giải thích chi tiết
   */
  checkAnswer: async (questionId, answer) => {
    const payload = {
      question_id: questionId,
      answer,
    };
    const res = await api.post("/ai/check-answer", payload);
    return res.data;
  },

  /**
   * Tóm tắt nội dung lịch sử
   * @param {string} text - Văn bản cần tóm tắt
   * @param {number} maxLength - Độ dài tóm tắt tối đa (số từ)
   * @returns {Promise<Object>} Nội dung đã được tóm tắt
   */
  summarize: async (text, maxLength = 300) => {
    const payload = { text, max_length: maxLength };
    const res = await api.post("/ai/summarize", payload);
    return res.data;
  },

  /**
   * Gợi ý bài học tiếp theo cho học sinh
   * @param {string|number} learnerId - ID học sinh
   * @returns {Promise<Array>} Danh sách bài học được gợi ý
   */
  suggestNextLesson: async (learnerId) => {
    const res = await api.get(`/ai/suggest/${learnerId}`);
    return res.data;
  },

  /**
   * Phân tích điểm yếu của học sinh và đề xuất ôn tập
   * @param {string|number} learnerId - ID học sinh
   * @returns {Promise<Object>} Phân tích điểm yếu và tài liệu gợi ý
   */
  analyzeWeakPoints: async (learnerId) => {
    const res = await api.get(`/ai/analyze/${learnerId}`);
    return res.data;
  },
};