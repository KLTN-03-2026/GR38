/**
 * Account Service - API client cho quản lý tài khoản
 *
 * Các chức năng:
 * - Lấy danh sách tài khoản
 * - Tạo tài khoản mới
 * - Cập nhật tài khoản
 * - Xoá tài khoản
 * - Khoá / mở khoá tài khoản
 */
import api from "../lib/api";

export const accountService = {
  /**
   * Lấy danh sách tất cả tài khoản
   * @param {Object} params - Tham số lọc / phân trang
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.role - Lọc theo vai trò (ADMIN | TEACHER | LEARNER)
   * @param {string} params.keyword - Tìm kiếm theo tên / email
   * @returns {Promise<Object>} Danh sách tài khoản và thông tin phân trang
   */
  getAll: async (params = {}) => {
    const res = await api.get("/accounts", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết một tài khoản
   * @param {string|number} id - ID tài khoản
   * @returns {Promise<Object>} Thông tin tài khoản
   */
  getById: async (id) => {
    const res = await api.get(`/accounts/${id}`);
    return res.data;
  },

  /**
   * Tạo tài khoản mới
   * @param {Object} data - Thông tin tài khoản
   * @param {string} data.firstName - Tên
   * @param {string} data.lastName - Họ
   * @param {string} data.email - Email
   * @param {string} data.password - Mật khẩu
   * @param {string} data.role - Vai trò (ADMIN | TEACHER | LEARNER)
   * @returns {Promise<Object>} Tài khoản vừa tạo
   */
  create: async (data) => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
    };
    const res = await api.post("/accounts", payload);
    return res.data;
  },

  /**
   * Cập nhật thông tin tài khoản
   * @param {string|number} id - ID tài khoản
   * @param {Object} data - Thông tin cần cập nhật
   * @returns {Promise<Object>} Tài khoản sau khi cập nhật
   */
  update: async (id, data) => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role,
    };
    const res = await api.put(`/accounts/${id}`, payload);
    return res.data;
  },

  /**
   * Xoá tài khoản
   * @param {string|number} id - ID tài khoản
   * @returns {Promise<Object>} Kết quả xoá
   */
  delete: async (id) => {
    const res = await api.delete(`/accounts/${id}`);
    return res.data;
  },

  /**
   * Khoá hoặc mở khoá tài khoản
   * @param {string|number} id - ID tài khoản
   * @returns {Promise<Object>} Trạng thái mới của tài khoản
   */
  toggleStatus: async (id) => {
    const res = await api.patch(`/accounts/${id}/toggle-status`);
    return res.data;
  },
};