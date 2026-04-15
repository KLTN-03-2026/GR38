import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function RegisterPage() {
  const [input, setInput] = useState({
    hoTen: "",
    email: "",
    pass: "",
    confirmPass: "",
  });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(null); // null | "teacher" | "student"
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let err = {};

    if (!input.hoTen.trim()) {
      err.hoTen = "Vui lòng nhập Họ và Tên";
    } else if (input.hoTen.trim().split(" ").length < 2) {
      err.hoTen = "Vui lòng nhập đầy đủ Họ và Tên";
    }
    if (!input.email.trim()) err.email = "Vui lòng nhập Email";
    if (!input.pass.trim()) err.pass = "Vui lòng nhập Mật khẩu";
    if (!input.confirmPass.trim()) {
      err.confirmPass = "Vui lòng nhập lại mật khẩu";
    } else if (input.pass !== input.confirmPass) {
      err.confirmPass = "Mật khẩu nhập lại không khớp";
    }

    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    const existingRaw = JSON.parse(localStorage.getItem("users") || "[]");
    const existing = Array.isArray(existingRaw) ? existingRaw : [existingRaw];

    if (existing.find((u) => u.email === input.email)) {
      setErrors({ email: "Email này đã được đăng ký" });
      return;
    }

    const newUser = {
      email: input.email,
      password: input.pass,
      username: input.hoTen,
      role: role === "teacher" ? "teacher" : role === "student" ? "student" : "user",
    };
    localStorage.setItem("users", JSON.stringify([...existing, newUser]));

    Swal.fire({
      icon: "success",
      title: "ĐĂNG KÝ THÀNH CÔNG",
      text: "Chào mừng bạn đến với Lịch Sử Việt Nam!",
      confirmButtonColor: "#f97316",
    });
    navigate("/");
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm rounded-md border outline-none transition
    ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

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
            className="px-4 py-1.5 text-sm bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition"
          >
            Đăng ký
          </Link>
          <Link
            to="/"
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] bg-white border border-gray-200 rounded-xl p-8">
          <h1 className="text-lg font-semibold text-gray-800 text-center mb-1">
            ĐĂNG KÝ
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Đăng ký để kết nối với chúng tôi
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* HỌ VÀ TÊN */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1.5">
                Họ và Tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="hoTen"
                placeholder="Nguyễn Văn A"
                onChange={handleInput}
                className={inputClass("hoTen")}
              />
              {errors.hoTen && (
                <p className="text-xs text-red-500 mt-1">{errors.hoTen}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="m@example.com"
                onChange={handleInput}
                autoComplete="email"
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* MẬT KHẨU */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1.5">
                Mật khẩu <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="pass"
                placeholder="••••••••••••••••••••"
                onChange={handleInput}
                autoComplete="new-password"
                className={inputClass("pass")}
              />
              {errors.pass && (
                <p className="text-xs text-red-500 mt-1">{errors.pass}</p>
              )}
            </div>

            {/* NHẬP LẠI MẬT KHẨU */}
            <div className="mb-5">
              <label className="block text-sm text-gray-600 mb-1.5">
                Nhập lại mật khẩu <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="confirmPass"
                placeholder="••••••••••••••••••••"
                onChange={handleInput}
                autoComplete="new-password"
                className={inputClass("confirmPass")}
              />
              {errors.confirmPass && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPass}</p>
              )}
            </div>

            {/* BUTTON ĐĂNG KÝ */}
            <button
              type="submit"
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98]"
            >
              ĐĂNG KÝ
            </button>
          </form>

          {/* ĐĂNG KÝ THEO VAI TRÒ */}
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

          {/* DIVIDER */}
          <p className="text-center text-xs text-gray-400 my-3">HOẶC</p>

          {/* BUTTON GMAIL */}
          <button
            type="button"
            className="w-full py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Đăng ký với Gmail
          </button>

          {/* LINK ĐĂNG NHẬP */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Bạn đã có tài khoản?{" "}
            <Link
              to="/"
              className="text-orange-500 font-medium hover:text-orange-600 transition underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;