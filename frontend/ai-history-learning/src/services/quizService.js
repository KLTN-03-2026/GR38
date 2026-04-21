/**
 * Quiz Service - API client cho quản lý bài kiểm tra
 *
 * Các chức năng:
 * - Lấy danh sách bài quiz
 * - Lấy chi tiết bài quiz
 * - Tạo / cập nhật / xoá bài quiz
 * - Nộp bài và lấy kết quả
 * - Lấy lịch sử làm bài
 */
import api from "../lib/api";

export const quizService = {
  /**
   * Lấy danh sách bài quiz
   * @param {Object} params - Tham số lọc / phân trang
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.keyword - Tìm kiếm theo tiêu đề
   * @param {string} params.difficulty - Lọc theo độ khó (EASY | MEDIUM | HARD)
   * @returns {Promise<Object>} Danh sách bài quiz và thông tin phân trang
   */
  getAll: async (params = {}) => {
    const res = await api.get("/quizzes", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết một bài quiz (bao gồm câu hỏi)
   * @param {string|number} id - ID bài quiz
   * @returns {Promise<Object>} Thông tin bài quiz và danh sách câu hỏi
   */
  getById: async (id) => {
    const res = await api.get(`/quizzes/${id}`);
    return res.data;
  },

  /**
   * Tạo bài quiz mới
   * @param {Object} data - Thông tin bài quiz
   * @param {string} data.title - Tiêu đề
   * @param {string} data.description - Mô tả
   * @param {string} data.difficulty - Độ khó (EASY | MEDIUM | HARD)
   * @param {number} data.timeLimit - Thời gian làm bài (giây)
   * @param {Array}  data.questions - Danh sách câu hỏi
   * @returns {Promise<Object>} Bài quiz vừa tạo
   */
  create: async (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      time_limit: data.timeLimit,
      questions: data.questions,
    };
    const res = await api.post("/quizzes", payload);
    return res.data;
  },

  /**
   * Cập nhật bài quiz
   * @param {string|number} id - ID bài quiz
   * @param {Object} data - Thông tin cần cập nhật
   * @returns {Promise<Object>} Bài quiz sau khi cập nhật
   */
  update: async (id, data) => {
    const payload = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      time_limit: data.timeLimit,
      questions: data.questions,
    };
    const res = await api.put(`/quizzes/${id}`, payload);
    return res.data;
  },

  /**
   * Xoá bài quiz
   * @param {string|number} id - ID bài quiz
   * @returns {Promise<Object>} Kết quả xoá
   */
  delete: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data;
  },

  /**
   * Nộp bài quiz và nhận kết quả
   * @param {string|number} quizId - ID bài quiz
   * @param {Array} answers - Danh sách đáp án
   * @param {string|number} answers[].questionId - ID câu hỏi
   * @param {string} answers[].answer - Đáp án đã chọn
   * @returns {Promise<Object>} Kết quả bài nộp (điểm, đáp án đúng/sai)
   */
  submit: async (quizId, answers) => {
    const payload = {
      answers: answers.map((a) => ({
        question_id: a.questionId,
        answer: a.answer,
      })),
    };
    const res = await api.post(`/quizzes/${quizId}/submit`, payload);
    return res.data;
  },

  /**
   * Lấy lịch sử làm bài của user hiện tại
   * @param {Object} params - Tham số lọc / phân trang
   * @returns {Promise<Object>} Lịch sử làm bài và điểm số
   */
  getHistory: async (params = {}) => {
    const res = await api.get("/quizzes/history", { params });
    return res.data;
  },

  /**
   * Lấy kết quả chi tiết của một lần làm bài
   * @param {string|number} attemptId - ID lần làm bài
   * @returns {Promise<Object>} Kết quả chi tiết từng câu
   */
  getAttemptResult: async (attemptId) => {
    const res = await api.get(`/quizzes/attempts/${attemptId}`);
    return res.data;
  },
};