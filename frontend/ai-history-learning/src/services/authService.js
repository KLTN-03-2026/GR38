/**
 * Auth Service - API client cho xác thực người dùng
 */
import api from "../lib/api";

export const authService = {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} data
   * @param {string} data.fullName - Họ và tên
   * @param {string} data.email - Email
   * @param {string} data.password - Mật khẩu
   * @param {string} data.passwordConfirm - Xác nhận mật khẩu
   * @param {string} data.role - TEACHER | LEARNER
   */
  register: async (data) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      role: data.role,
    };
    const res = await api.post("/auth/register", payload);
    
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get("/auth/profile");
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put("/auth/profile", data);
    return res.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await api.post("/auth/change-password", { currentPassword, newPassword });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  },
};