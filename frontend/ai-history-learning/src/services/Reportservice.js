/**
 * Report Service - API client cho quản lý báo cáo
 *
 * Các chức năng:
 * - Lấy thống kê dashboard
 * - Lấy danh sách báo cáo
 * - Lấy chi tiết báo cáo
 * - Báo cáo hoạt động theo thời gian
 * - Xuất báo cáo (Excel / PDF)
 */
import api from "../lib/api";

export const reportService = {
  /**
   * Lấy thống kê tổng quan cho dashboard
   * @returns {Promise<Object>} Số liệu thống kê (tổng user, giáo viên, học sinh, tài liệu...)
   */
  getDashboardStats: async () => {
    const res = await api.get("/reports/dashboard");
    return res.data;
  },

  /**
   * Lấy danh sách báo cáo
   * @param {Object} params - Tham số lọc / phân trang
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.type - Loại báo cáo
   * @returns {Promise<Object>} Danh sách báo cáo và thông tin phân trang
   */
  getAll: async (params = {}) => {
    const res = await api.get("/reports", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết một báo cáo
   * @param {string|number} id - ID báo cáo
   * @returns {Promise<Object>} Thông tin chi tiết báo cáo
   */
  getById: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  /**
   * Lấy báo cáo hoạt động theo khoảng thời gian
   * @param {string} from - Ngày bắt đầu (ISO string)
   * @param {string} to - Ngày kết thúc (ISO string)
   * @returns {Promise<Object>} Dữ liệu hoạt động theo thời gian
   */
  getActivity: async (from, to) => {
    const res = await api.get("/reports/activity", { params: { from, to } });
    return res.data;
  },

  /**
   * Xuất báo cáo ra file
   * @param {string} type - Định dạng xuất: 'excel' | 'pdf'
   * @param {Object} params - Tham số lọc
   * @returns {Promise<Blob>} File blob để download
   */
  export: async (type = "excel", params = {}) => {
    const res = await api.get("/reports/export", {
      params: { type, ...params },
      responseType: "blob",
    });
    return res.data;
  },
};