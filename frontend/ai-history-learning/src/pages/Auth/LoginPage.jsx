import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { authService } from "../../services/authService";

// CHỈ CẬP NHẬT ĐIỀU HƯỚNG 
const ROLE_CONFIG = {
  ADMIN: { path: "/admin", label: "Quản trị viên" },
  TEACHER: { path: "/teacher", label: "Giáo viên" },
  LEARNER: { path: "/learner", label: "Học sinh" },
};

function LoginPage() {
  const [input, setInput] = useState({ email: "", pass: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const err = {};
    if (!input.email) err.email = "Vui lòng nhập email";
    if (!input.pass) err.pass = "Vui lòng nhập mật khẩu";
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setLoading(true);

    try {
  const resData = await authService.login(input.email, input.pass);
  const user = resData.data;

      const roleLabel = ROLE_CONFIG[user.role]?.label ?? user.role;

      await Swal.fire({
        icon: "success",
        title: "ĐĂNG NHẬP THÀNH CÔNG",
        html: `Xin chào <b>${user.fullName}</b><br/><span style="font-size:13px;color:#6b7280">Vai trò: ${roleLabel}</span>`,
        confirmButtonColor: "#f97316",
        timer: 1800,
        timerProgressBar: true,
      });

      const path = ROLE_CONFIG[user.role]?.path;
      if (path) navigate(path);
    } catch (error) {
      const msg = error.response?.data?.error ?? "Lỗi server, vui lòng thử lại";

      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: msg,
        confirmButtonColor: "#f97316",
      });
      setErrors({ pass: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url('/thumnail.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-[360px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-7 mx-4 shadow-xl">
        <div className="flex flex-col items-center mb-5">
          <img
            src="/Logo.jpg"
            alt="logo"
            className="w-12 h-12 rounded-full object-cover mb-2 shadow"
          />
          <h1 className="text-base font-semibold text-gray-800">
            Lịch sử Việt Nam
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Nhập thông tin Email và Mật khẩu
          </p>
        </div>

        <label className="block text-sm text-gray-500 mb-1.5">Email</label>
        <input
          type="email"
          name="email"
          placeholder="m@example.com"
          value={input.email}
          onChange={handleChange}
          autoComplete="off"
          className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition mb-1
            ${
              errors.email
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
            }`}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mb-3">{errors.email}</p>
        )}

        <label className="block text-sm text-gray-500 mb-1.5">Mật khẩu</label>
        <input
          type="password"
          name="pass"
          placeholder="••••••••"
          value={input.pass}
          onChange={handleChange}
          autoComplete="new-password"
          className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition mb-1
            ${
              errors.pass
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
            }`}
        />
        {errors.pass && (
          <p className="text-xs text-red-500 mb-3">{errors.pass}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm text-gray-500 mb-2">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-orange-500 font-medium hover:text-orange-600 transition"
          >
            Đăng ký
          </Link>
        </p>

        <p className="text-center">
          <button
            type="button"
            className="text-xs text-orange-500 hover:text-orange-600 transition"
          >
            Bạn quên mật khẩu?
          </button>
        </p>
      </div>
    </div>
  );
}
export default LoginPage;