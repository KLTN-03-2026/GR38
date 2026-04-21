/**
 * Learner Service - API client cho quản lý học sinh
 *
 * Các chức năng:
 * - Lấy danh sách học sinh
 * - Lấy chi tiết học sinh
 * - Cập nhật thông tin học sinh
 * - Lấy tiến độ học tập
 * - Lấy lịch sử bài thi
 */
import api from "../lib/api";

export const learnerService = {
  /**
   * Lấy danh sách học sinh
   * @param {Object} params - Tham số lọc / phân trang
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.keyword - Tìm kiếm theo tên / email
   * @returns {Promise<Object>} Danh sách học sinh và thông tin phân trang
   */
  getAll: async (params = {}) => {
    const res = await api.get("/learners", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết học sinh
   * @param {string|number} id - ID học sinh
   * @returns {Promise<Object>} Thông tin học sinh
   */
  getById: async (id) => {
    const res = await api.get(`/learners/${id}`);
    return res.data;
  },

  /**
   * Cập nhật thông tin học sinh
   * @param {string|number} id - ID học sinh
   * @param {Object} data - Thông tin cần cập nhật
   * @param {string} data.firstName - Tên
   * @param {string} data.lastName - Họ
   * @param {string} data.phoneNumber - Số điện thoại
   * @param {string} data.dateOfBirth - Ngày sinh (ISO string)
   * @returns {Promise<Object>} Thông tin sau khi cập nhật
   */
  update: async (id, data) => {
    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber,
      date_of_birth: data.dateOfBirth,
    };
    const res = await api.put(`/learners/${id}`, payload);
    return res.data;
  },

  /**
   * Lấy tiến độ học tập của học sinh
   * @param {string|number} learnerId - ID học sinh
   * @returns {Promise<Object>} Tiến độ học tập theo từng môn / bài
   */
  getProgress: async (learnerId) => {
    const res = await api.get(`/learners/${learnerId}/progress`);
    return res.data;
  },

  /**
   * Lấy lịch sử làm bài thi của học sinh
   * @param {string|number} learnerId - ID học sinh
   * @param {Object} params - Tham số lọc / phân trang
   * @returns {Promise<Object>} Lịch sử bài thi và điểm số
   */
  getExamHistory: async (learnerId, params = {}) => {
    const res = await api.get(`/learners/${learnerId}/exam-history`, { params });
    return res.data;
  },
};