import api from "../lib/api";

export const quizService = {
  // ==========================================
  // 1. NHÓM DÀNH CHO LEARNER (HỌC SINH LÀM BÀI)
  // ==========================================

  // Lấy danh sách tất cả quiz (Có tối ưu payload, phân trang, tìm kiếm)
  getAllQuizzes: async (params) => {
    // params ví dụ: { page: 1, limit: 12, search: "Quang Trung" }
    const res = await api.get("/quizzes", { params });
    return res;
  },

  // Lấy danh sách quiz theo ID của tài liệu/bài học
  getByDocument: async (documentId) => {
    const res = await api.get(`/quizzes/document/${documentId}`);
    return res;
  },

  // Lấy chi tiết đề thi để LÀM BÀI (Đã bị ẩn đáp án đúng từ Backend)
  getQuizForPlay: async (id) => {
    const res = await api.get(`/quizzes/play/${id}`);
    return res;
  },

  // Nộp bài thi và chấm điểm
  submit: async (quizId, userAnswers, timeSpent = 0) => {
    const res = await api.post(`/quizzes/${quizId}/submit`, {
      userAnswers: userAnswers,
      timeSpent: timeSpent, // Đẩy lên số giây học sinh đã dùng để làm bài
    });
    return res;
  },

  // Lấy lịch sử tất cả các bài quiz đã làm của user hiện tại
  getMyHistory: async () => {
    const res = await api.get(`/quizzes/my-history`);
    return res;
  },

  // Xem chi tiết lại 1 bài thi đã nộp (để xem câu đúng/sai)
  getResultDetail: async (resultId) => {
    const res = await api.get(`/quizzes/detail/${resultId}`);
    return res;
  },

  // ==========================================
  // 2. NHÓM DÀNH CHO TEACHER / ADMIN (QUẢN LÝ ĐỀ THI)
  // ==========================================

  // Lấy danh sách tất cả các đề thi do chính Giáo viên này tạo ra
  getTeacherQuizzes: async () => {
    const res = await api.get("/quizzes/my-quizzes");
    return res;
  },

  // Lấy chi tiết đề thi (Full thông tin bao gồm đáp án đúng để sửa)
  getById: async (id) => {
    const res = await api.get(`/quizzes/quiz/${id}`);
    return res;
  },

  // Tạo đề thi mới (Dùng FormData vì có upload ảnh bìa)
  create: async (data, thumbnailFile) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    if (data.documentId) formData.append("documentId", data.documentId);
    
    // Convert mảng câu hỏi thành JSON String để đính kèm vào Form Data
    formData.append("questions", JSON.stringify(data.questions));

    // Đính kèm file ảnh nếu giáo viên có tải lên
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    const res = await api.post("/quizzes/manual", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },

  // Sửa thông tin chung của đề thi (Tiêu đề, mô tả, ảnh bìa...)
  update: async (id, data, thumbnailFile) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.tags) formData.append("tags", JSON.stringify(data.tags));
    
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    const res = await api.put(`/quizzes/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },

  // Sửa chi tiết nội dung của MỘT câu hỏi cụ thể trong đề
  updateQuestion: async (quizId, questionId, questionData) => {
    const res = await api.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
    return res;
  },

  // Xóa đề thi
  delete: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res;
  },
};