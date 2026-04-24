import api from "../lib/api";

export const quizService = {
  // Lấy danh sách quiz theo tài liệu
  getByDocument: async (documentId) => {
    const res = await api.get(`/quizzes/document/${documentId}`);
    return res;
  },

  // Lấy chi tiết 1 quiz (để làm bài)
  getById: async (id) => {
    const res = await api.get(`/quizzes/quiz/${id}`);
    return res;
  },

  // Lấy lịch sử tất cả quiz đã làm (dùng cho trang Tạo Quiz standalone)
  getMyHistory: async () => {
    const res = await api.get(`/quizzes/my-history`);
    return res;
  },

  // Xem chi tiết 1 kết quả đã nộp
  getResult: async (resultId) => {
    const res = await api.get(`/quizzes/detail/${resultId}`);
    return res;
  },
create: async (data) => {
  const payload = {
    title:       data.title,
    description: data.description,
    difficulty:  data.difficulty,
    time_limit:  data.timeLimit,   // ← server dùng snake_case
    documentId:  data.documentId,  // ← thêm dòng này
    questions:   data.questions,
  };
  console.log("📤 Gửi lên server:", JSON.stringify(payload, null, 2));
  const res = await api.post("/quizzes", payload);
  return res;
},

  update: async (id, data) => {
    const res = await api.put(`/quizzes/${id}`, {
      title:       data.title,
      description: data.description,
      difficulty:  data.difficulty,
      time_limit:  data.timeLimit,
      questions:   data.questions,
    });
    return res;
  },

  delete: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res;
  },

  // Fix: QuizPage truyền { answers: [...] } rồi, service chỉ forward thẳng
  submit: async (quizId, payload) => {
    const res = await api.post(`/quizzes/${quizId}/submit`, payload);
    return res;
  },

  getResults: async (quizId) => {
    const res = await api.get(`/quizzes/${quizId}/results`);
    return res;
  },
};