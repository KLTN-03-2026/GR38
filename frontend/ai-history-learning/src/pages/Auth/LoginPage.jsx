import React from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";
import { useLogin } from "../../hooks/useLogin"; 

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
  const {
    input, errors, loading, showPass, setShowPass,
    handleChange, handleLogin, handleGoogleSuccess,
  } = useLogin();

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm rounded-md border outline-none transition
    ${errors[field]
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center relative py-6"
      style={{
        backgroundImage: `url('/thumnail.jpg')`, backgroundSize: "cover",
        backgroundPosition: "center", backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Đồng bộ kích thước width, padding và thanh cuộn ẩn giống trang đăng ký */}
      <div 
        className="relative z-10 w-full max-w-[420px] max-h-[95vh] overflow-y-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-xl mx-4 [&::-webkit-scrollbar]:hidden"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {/* Logo & Tiêu đề */}
        <div className="flex flex-col items-center mb-5">
          <img src="/Logo.jpg" alt="logo" className="w-12 h-12 rounded-full object-cover mb-2 shadow" />
          <h1 className="text-lg font-semibold text-gray-800 mb-1">ĐĂNG NHẬP</h1>
          <p className="text-sm text-gray-400 text-center">Nhập thông tin Email và Mật khẩu</p>
        </div>

        {/* Form Đăng nhập */}
        <form onSubmit={handleLogin} noValidate>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Email <span className="text-red-400">*</span></label>
            <input
              type="email" name="email" placeholder="m@example.com"
              value={input.email} onChange={handleChange} autoComplete="off"
              className={inputClass("email")}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Mật khẩu <span className="text-red-400">*</span>
            </label>
            <div className="relative">
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
            <div className="flex justify-end mt-1.5 mb-1">
              <Link to="/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 transition">
                Quên mật khẩu?
              </Link>
            </div>
            {errors.pass && <p className="text-xs text-red-500 mt-1">{errors.pass}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-2">
            {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
          </button>
        </form>

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-xs text-gray-400 bg-transparent">Hoặc</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* NÚT ĐĂNG NHẬP BẰNG GOOGLE */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              Swal.fire({
                icon: "error", title: "Lỗi", text: "Đăng nhập Google thất bại!", confirmButtonColor: "#f97316",
              });
            }}
            width="350"
            useOneTap={false} 
            shape="rectangular"
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="text-orange-500 font-medium hover:text-orange-600 transition underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}