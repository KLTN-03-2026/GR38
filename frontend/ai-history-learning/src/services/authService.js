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
   * @param {string} data.role - TEACHER | STUDENT 
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

  /**
   * Đăng nhập tài khoản truyền thống
   * @param {string} email 
   * @param {string} password 
   */
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

  /**
   * Đăng xuất người dùng
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  },

  /**
   * Yêu cầu gửi mã OTP về email (Bước 1)
   * @param {string} email - Email đã đăng ký của người dùng
   */
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data; 
  },

  /**
   * Gửi mã OTP và Mật khẩu mới để đặt lại (Bước 2)
   * @param {Object} data
   * @param {string} data.email - Email của người dùng
   * @param {string} data.otp - Mã OTP 6 số nhận được từ email
   * @param {string} data.newPassword - Mật khẩu mới muốn đặt
   */
  resetPassword: async (data) => {
    const payload = {
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    };
    const res = await api.post("/auth/reset-password", payload);
    return res.data; 
  },
};