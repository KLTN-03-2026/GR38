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

  if (res.data.token) {

    localStorage.setItem(
      "token",
      JSON.stringify({
        access_token: res.data.token,
        refresh_token: res.data.refresh_token ?? null,
      })
    );
  }

  if (res.data.data) {
    localStorage.setItem("user", JSON.stringify(res.data.data));
    localStorage.setItem("role", res.data.data.role);
  }
  return res.data;
},
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  },
};