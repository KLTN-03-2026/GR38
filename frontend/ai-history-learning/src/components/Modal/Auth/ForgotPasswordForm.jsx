import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "@/components/Modal/Auth/Hook/useForgotPassword";

// Tái sử dụng Icon từ LoginPage
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function ForgotPasswordPage() {
  const {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    loading,
    errors,
    handleSendOtp,
    handleResetPassword,
  } = useForgotPassword();

  // State quản lý việc ẩn/hiện mật khẩu ở Bước 2
  const [showPass, setShowPass] = useState(false);

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm rounded-md border outline-none transition
    ${
      errors[field] || errors.form
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
    }`;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/thumnail.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-[360px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-7 mx-4 shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <img
            src="/Logo.jpg"
            alt="logo"
            className="w-12 h-12 rounded-full object-cover mb-2 shadow"
          />
          <h1 className="text-base font-semibold text-gray-800">Lịch sử Việt Nam</h1>
          <p className="text-xs text-gray-400 mt-1">
            {step === 1 ? "Khôi phục mật khẩu của bạn" : "Nhập mã OTP để đổi mật khẩu"}
          </p>
        </div>

        {/* STEP 1: Form Nhập Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate>
            <label htmlFor="email" className="block text-sm text-gray-500 mb-1.5">
              Email đã đăng ký
            </label>
            <input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass("email")} mb-1`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mb-3">{errors.email}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
            >
              {loading ? "Đang gửi mã..." : "Gửi mã OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Form Nhập OTP & Mật khẩu mới */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} noValidate>
            {errors.form && (
              <div className="mb-3 p-2 bg-red-100 text-red-600 text-xs rounded-md text-center">
                {errors.form}
              </div>
            )}
            
            {/* Input OTP */}
            <label htmlFor="otp" className="block text-sm text-gray-500 mb-1.5">
              Mã OTP (6 số)
            </label>
            <input
              id="otp"
              type="text"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`${inputClass("otp")} mb-1 text-center tracking-widest font-bold`}
              autoComplete="off"
            />
            {errors.otp && (
              <p className="text-xs text-red-500 mb-3">{errors.otp}</p>
            )}

            {/* Input Mật khẩu mới có nút Ẩn/Hiện */}
            <label htmlFor="newPassword" className="block text-sm text-gray-500 mb-1.5 mt-2">
              Mật khẩu mới
            </label>
            <div className="relative mb-1">
              <input
                id="newPassword"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputClass("newPassword")} pr-10`} // Thêm pr-10 để không bị lẹm chữ vào icon
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition focus:outline-none"
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 mb-3">{errors.newPassword}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
            </button>
          </form>
        )}

        {/* Dòng phân cách */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Link Quay lại */}
        <p className="text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-orange-500 transition flex items-center justify-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}