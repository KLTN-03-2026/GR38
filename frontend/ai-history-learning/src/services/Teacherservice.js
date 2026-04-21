/**
 * Teacher Service - API client cho quản lý giáo viên
 *
 * Các chức năng:
 * - Lấy danh sách giáo viên
 * - Lấy chi tiết giáo viên
 * - Cập nhật hồ sơ giáo viên
 * - Lấy danh sách lớp học của giáo viên
 * - Lấy báo cáo hoạt động
 */
import api from "../lib/api";

export const teacherService = {
  /**
   * Lấy danh sách giáo viên
   * @param {Object} params - Tham số lọc / phân trang
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.keyword - Tìm kiếm theo tên / email
   * @returns {Promise<Object>} Danh sách giáo viên và thông tin phân trang
   */
  getAll: async (params = {}) => {
    const res = await api.get("/teachers", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết giáo viên
   * @param {string|number} id - ID giáo viên
   * @returns {Promise<Object>} Thông tin giáo viên
   */
  getById: async (id) => {
    const res = await api.get(`/teachers/${id}`);
    return res.data;
  },

  /**
   * Cập nhật hồ sơ giáo viên
   * @param {string|number} id - ID giáo viên
   * @param {Object} data - Thông tin cần cập nhật
   * @param {string} data.firstName - Tên
   * @param {string} data.lastName - Họ
   * @param {string} data.phoneNumber - Số điện thoại
   * @param {string} data.bio - Giới thiệu bản thân
   * @returns {Promise<Object>} Hồ sơ sau khi cập nhật
   */
  update: async (id, data) => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber,
      bio: data.bio,
    };
    const res = await api.put(`/teachers/${id}`, payload);
    return res.data;
  },

  /**
   * Lấy danh sách lớp học của giáo viên
   * @param {string|number} teacherId - ID giáo viên
   * @returns {Promise<Array>} Danh sách lớp học
   */
  getClasses: async (teacherId) => {
    const res = await api.get(`/teachers/${teacherId}/classes`);
    return res.data;
  },

  /**
   * Lấy báo cáo hoạt động của giáo viên
   * @param {string|number} teacherId - ID giáo viên
   * @param {Object} params - Tham số lọc theo thời gian
   * @param {string} params.from - Ngày bắt đầu (ISO string)
   * @param {string} params.to - Ngày kết thúc (ISO string)
   * @returns {Promise<Object>} Báo cáo hoạt động
   */
  getReport: async (teacherId, params = {}) => {
    const res = await api.get(`/teachers/${teacherId}/report`, { params });
    return res.data;
  },
};