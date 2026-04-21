/**
 * Document Service - API client cho quản lý tài liệu lịch sử
 *
 * Các chức năng:
 * - Lấy danh sách tài liệu
 * - Lấy chi tiết tài liệu
 * - Tạo / cập nhật / xoá tài liệu
 * - Upload file tài liệu
 */
import api from "../lib/api";

export const documentService = {
  /**
   * Lấy danh sách tài liệu
   * @param {Object} params - Tham số lọc / phân trang
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.keyword - Tìm kiếm theo tiêu đề
   * @param {string} params.category - Lọc theo danh mục
   * @returns {Promise<Object>} Danh sách tài liệu và thông tin phân trang
   */
  getAll: async (params = {}) => {
    const res = await api.get("/documents", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết một tài liệu
   * @param {string|number} id - ID tài liệu
   * @returns {Promise<Object>} Thông tin chi tiết tài liệu
   */
  getById: async (id) => {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },

  /**
   * Tạo tài liệu mới
   * @param {Object} data - Thông tin tài liệu
   * @param {string} data.title - Tiêu đề
   * @param {string} data.description - Mô tả
   * @param {string} data.category - Danh mục
   * @param {string} data.content - Nội dung
   * @returns {Promise<Object>} Tài liệu vừa tạo
   */
  create: async (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      content: data.content,
    };
    const res = await api.post("/documents", payload);
    return res.data;
  },

  /**
   * Cập nhật tài liệu
   * @param {string|number} id - ID tài liệu
   * @param {Object} data - Thông tin cần cập nhật
   * @returns {Promise<Object>} Tài liệu sau khi cập nhật
   */
  update: async (id, data) => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      content: data.content,
    };
    const res = await api.put(`/documents/${id}`, payload);
    return res.data;
  },

  /**
   * Xoá tài liệu
   * @param {string|number} id - ID tài liệu
   * @returns {Promise<Object>} Kết quả xoá
   */
  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  /**
   * Upload file tài liệu (PDF, Word, ...)
   * @param {File} file - File cần upload
   * @param {Object} metadata - Thông tin kèm theo
   * @param {string} metadata.title - Tiêu đề tài liệu
   * @param {string} metadata.category - Danh mục
   * @returns {Promise<Object>} Thông tin file sau khi upload
   */
  upload: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(metadata).forEach(([key, value]) =>
      formData.append(key, value)
    );
    const res = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};