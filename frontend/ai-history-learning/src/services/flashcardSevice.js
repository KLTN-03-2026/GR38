/**
 * Flashcard Service - API client cho quản lý flashcard
 *
 * Các chức năng:
 * - Lấy danh sách bộ flashcard
 * - Lấy chi tiết bộ flashcard
 * - Tạo / cập nhật / xoá bộ flashcard
 * - Lấy các thẻ trong bộ flashcard
 * - Thêm / xoá thẻ
 */
import api from "../lib/api";

export const flashcardService = {
  /**
   * Lấy danh sách bộ flashcard
   * @param {Object} params - Tham số lọc / phân trang
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.keyword - Tìm kiếm theo tiêu đề
   * @returns {Promise<Object>} Danh sách bộ flashcard và thông tin phân trang
   */
  getAll: async (params = {}) => {
    const res = await api.get("/flashcards", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết một bộ flashcard
   * @param {string|number} id - ID bộ flashcard
   * @returns {Promise<Object>} Thông tin bộ flashcard
   */
  getById: async (id) => {
    const res = await api.get(`/flashcards/${id}`);
    return res.data;
  },

  /**
   * Tạo bộ flashcard mới
   * @param {Object} data - Thông tin bộ flashcard
   * @param {string} data.title - Tiêu đề
   * @param {string} data.description - Mô tả
   * @param {string} data.category - Danh mục / chủ đề lịch sử
   * @returns {Promise<Object>} Bộ flashcard vừa tạo
   */
  create: async (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
    };
    const res = await api.post("/flashcards", payload);
    return res.data;
  },

  /**
   * Cập nhật bộ flashcard
   * @param {string|number} id - ID bộ flashcard
   * @param {Object} data - Thông tin cần cập nhật
   * @returns {Promise<Object>} Bộ flashcard sau khi cập nhật
   */
  update: async (id, data) => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
    };
    const res = await api.put(`/flashcards/${id}`, payload);
    return res.data;
  },

  /**
   * Xoá bộ flashcard
   * @param {string|number} id - ID bộ flashcard
   * @returns {Promise<Object>} Kết quả xoá
   */
  delete: async (id) => {
    const res = await api.delete(`/flashcards/${id}`);
    return res.data;
  },

  /**
   * Lấy danh sách thẻ trong một bộ flashcard
   * @param {string|number} deckId - ID bộ flashcard
   * @returns {Promise<Array>} Danh sách thẻ
   */
  getCards: async (deckId) => {
    const res = await api.get(`/flashcards/${deckId}/cards`);
    return res.data;
  },

  /**
   * Thêm thẻ mới vào bộ flashcard
   * @param {string|number} deckId - ID bộ flashcard
   * @param {Object} data - Nội dung thẻ
   * @param {string} data.front - Mặt trước (câu hỏi / sự kiện)
   * @param {string} data.back - Mặt sau (đáp án / giải thích)
   * @returns {Promise<Object>} Thẻ vừa thêm
   */
  addCard: async (deckId, data) => {
    const payload = {
      front: data.front,
      back: data.back,
    };
    const res = await api.post(`/flashcards/${deckId}/cards`, payload);
    return res.data;
  },

  /**
   * Xoá một thẻ khỏi bộ flashcard
   * @param {string|number} deckId - ID bộ flashcard
   * @param {string|number} cardId - ID thẻ
   * @returns {Promise<Object>} Kết quả xoá
   */
  deleteCard: async (deckId, cardId) => {
    const res = await api.delete(`/flashcards/${deckId}/cards/${cardId}`);
    return res.data;
  },
};