import React from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";
import { useLogin } from "../../hooks/useLogin"; // Sửa lại đường dẫn import hook của bạn

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function LoginPage() {
  // Rút gọn toàn bộ logic nhờ Custom Hook
  const {
    input,
    errors,
    loading,
    showPass,
    setShowPass,
    handleChange,
    handleLogin,
    handleGoogleSuccess,
  } = useLogin();

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm rounded-md border outline-none transition
    ${errors[field]
      ? "border-red-400 bg-red-50"
      : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"}`;

  return (
    <div className="min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: "url('/thumnail.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-[360px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-7 mx-4 shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <img src="/Logo.jpg" alt="logo" className="w-12 h-12 rounded-full object-cover mb-2 shadow" />
          <h1 className="text-base font-semibold text-gray-800">Lịch sử Việt Nam</h1>
          <p className="text-xs text-gray-400 mt-1">Nhập thông tin Email và Mật khẩu</p>
        </div>

        {/* Form Đăng nhập truyền thống */}
        <form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <label className="block text-sm text-gray-500 mb-1.5">Email</label>
          <input
            type="email" name="email" placeholder="m@example.com"
            value={input.email} onChange={handleChange} autoComplete="off"
            className={`${inputClass("email")} mb-1`}
          />
          {errors.email && <p className="text-xs text-red-500 mb-3">{errors.email}</p>}

          {/* Password */}
          <label className="block text-sm text-gray-500 mb-1.5">Mật khẩu</label>
          <div className="relative mb-1">
            <input
              type={showPass ? "text" : "password"} name="pass" placeholder="••••••••"
              value={input.pass} onChange={handleChange} autoComplete="new-password"
              className={`${inputClass("pass")} pr-10`}
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              {showPass ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.pass && <p className="text-xs text-red-500 mb-3">{errors.pass}</p>}

          <button type="submit" disabled={loading}
            className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-3">
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* Dòng chữ Hoặc */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-400 bg-transparent">Hoặc</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* 🔥 NÚT ĐĂNG NHẬP GOOGLE */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Đăng nhập Google thất bại!",
                confirmButtonColor: "#f97316",
              });
            }}
            width="300"
            useOneTap={false} 
            shape="rectangular"
          />

        {/* Các liên kết dưới cùng */}
        <p className="text-center text-sm text-gray-500 mb-2 mt-2">
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="text-orange-500 font-medium hover:text-orange-600 transition">Đăng ký</Link>
        </p>
        <p className="text-center">
          <Link to="/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 transition">
            Bạn quên mật khẩu?
          </Link>
        </p>
      </div>
    </div>
  );
}