import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import usersMock from "../../data/UserMock";

function LoginPage() {
  const [input, setInput] = useState({ email: "", pass: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null); // null | "teacher" | "student"
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    let err = {};
    if (!input.email) err.email = "Vui lòng nhập email hợp lệ";
    if (!input.pass) err.pass = "Vui lòng nhập mật khẩu";
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setLoading(true);
    const user = usersMock.find(
      (u) => u.email === input.email && u.password === input.pass,
    );
    setLoading(false);

    if (user) {
      await Swal.fire({
        icon: "success",
        title: "ĐĂNG NHẬP THÀNH CÔNG",
        text: `Xin chào ${user.username} đến với trang Lịch Sử Việt Nam`,
        confirmButtonColor: "#f97316",
      });
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/dashboard");
    } else {
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: "Sai email hoặc mật khẩu",
        confirmButtonColor: "#f97316",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 flex items-center justify-between px-6 h-[52px]">
        <div className="flex items-center gap-2.5">
          <img
            src="/Logo.jpg"
            alt="logo"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-gray-800">
            Lịch sử Việt Nam
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/register"
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Đăng ký
          </Link>
          <Link
            to="/login"
            className="px-4 py-1.5 text-sm bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-xl p-7">
          <h1 className="text-base font-medium text-gray-800 mb-1">
            Đăng nhập
          </h1>
          <p className="text-sm text-gray-400 mb-5">
            Nhập thông tin Email và Mật khẩu
          </p>

          {/* EMAIL */}
          <label className="block text-sm text-gray-500 mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            placeholder="m@example.com"
            value={input.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition mb-1
              ${errors.email
                ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
              }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mb-3">{errors.email}</p>
          )}

          {/* PASSWORD */}
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm text-gray-500">Mật khẩu</label>
            <a href="#" className="text-xs text-orange-500 hover:text-orange-600 transition">
              Bạn quên mật khẩu?
            </a>
          </div>
          <input
            type="password"
            name="pass"
            placeholder="••••••••"
            value={input.pass}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-md border outline-none transition mb-1
              ${errors.pass
                ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
              }`}
          />
          {errors.pass && (
            <p className="text-xs text-red-500 mb-3">{errors.pass}</p>
          )}

          {/* BUTTON ĐĂNG NHẬP */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>

          {/* ĐĂNG NHẬP THEO VAI TRÒ */}
          <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
            {/* GIÁO VIÊN */}
            <button
              type="button"
              onClick={() => setRole(role === "teacher" ? null : "teacher")}
              className={`flex items-center justify-center gap-1.5 py-2 border text-xs font-medium rounded-md transition active:scale-[0.98]
                ${role === "teacher"
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Giáo viên
            </button>

            {/* HỌC SINH */}
            <button
              type="button"
              onClick={() => setRole(role === "student" ? null : "student")}
              className={`flex items-center justify-center gap-1.5 py-2 border text-xs font-medium rounded-md transition active:scale-[0.98]
                ${role === "student"
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              Học sinh
            </button>
          </div>

          {/* BUTTON GMAIL */}
          <button className="w-full mt-2 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z" />
              <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z" />
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z" />
            </svg>
            Đăng nhập với Gmail
          </button>

          {/* LINK ĐĂNG KÝ */}
          <p className="text-center text-sm text-gray-500">
            Bạn đã có tài khoản chưa?{" "}
            <Link
              to="/register"
              className="text-orange-500 font-medium hover:text-orange-600 transition"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;