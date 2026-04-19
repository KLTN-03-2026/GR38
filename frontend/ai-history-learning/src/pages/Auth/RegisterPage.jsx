import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function RegisterPage() {
  const [input, setInput] = useState({
    hoTen: "",
    email: "",
    pass: "",
    confirmPass: "",
  });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
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
    if (!role) {
      err.role = "Vui lòng chọn vai trò";
    }

    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/v1/auth/register", {
        fullName: input.hoTen,
        email: input.email,
        password: input.pass,
        passwordConfirm: input.confirmPass,
        role: role, // "Teacher" hoặc "Learner"
      });

      await Swal.fire({
        icon: "success",
        title: "ĐĂNG KÝ THÀNH CÔNG",
        text: `Chào mừng ${input.hoTen} đến với Lịch Sử Việt Nam!`,
        confirmButtonColor: "#f97316",
        timer: 2000,
        timerProgressBar: true,
      });

      navigate("/");

    } catch (error) {
      const msg = error.response?.data?.error ?? "Lỗi server, vui lòng thử lại";

      // Nếu lỗi liên quan email thì hiện dưới ô email
      if (msg.toLowerCase().includes("email")) {
        setErrors({ email: msg });
      } else {
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text: msg,
          confirmButtonColor: "#f97316",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm rounded-md border outline-none transition
    ${errors[field]
      ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

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
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40" />

      {/* FORM */}
      <div className="relative z-10 w-full max-w-[420px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-xl mx-4 my-6">
        <h1 className="text-lg font-semibold text-gray-800 text-center mb-1">ĐĂNG KÝ</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Đăng ký để kết nối với chúng tôi</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* HỌ VÀ TÊN */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1.5">
              Họ và Tên <span className="text-red-400">*</span>
            </label>
            <input type="text" name="hoTen" placeholder="Nguyễn Văn A"
              onChange={handleInput} className={inputClass("hoTen")} />
            {errors.hoTen && <p className="text-xs text-red-500 mt-1">{errors.hoTen}</p>}
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input type="email" name="email" placeholder="m@example.com"
              onChange={handleInput} autoComplete="off" className={inputClass("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* MẬT KHẨU */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1.5">
              Mật khẩu <span className="text-red-400">*</span>
            </label>
            <input type="password" name="pass" placeholder="••••••••"
              onChange={handleInput} autoComplete="new-password" className={inputClass("pass")} />
            {errors.pass && <p className="text-xs text-red-500 mt-1">{errors.pass}</p>}
          </div>

          {/* NHẬP LẠI MẬT KHẨU */}
          <div className="mb-5">
            <label className="block text-sm text-gray-600 mb-1.5">
              Nhập lại mật khẩu <span className="text-red-400">*</span>
            </label>
            <input type="password" name="confirmPass" placeholder="••••••••"
              onChange={handleInput} autoComplete="new-password" className={inputClass("confirmPass")} />
            {errors.confirmPass && <p className="text-xs text-red-500 mt-1">{errors.confirmPass}</p>}
          </div>

          {/* CHỌN VAI TRÒ */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1.5">
              Vai trò <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* GIÁO VIÊN */}
              <button
                type="button"
                onClick={() => {
                  setRole(role === "Teacher" ? null : "Teacher");
                  setErrors((prev) => ({ ...prev, role: "" }));
                }}
                className={`flex items-center justify-center gap-1.5 py-2 border text-xs font-medium rounded-md transition
                  ${role === "Teacher"
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

              {/* NGƯỜI HỌC */}
              <button
                type="button"
                onClick={() => {
                  setRole(role === "Learner" ? null : "Learner");
                  setErrors((prev) => ({ ...prev, role: "" }));
                }}
                className={`flex items-center justify-center gap-1.5 py-2 border text-xs font-medium rounded-md transition
                  ${role === "Learner"
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Người học
              </button>
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          {/* BUTTON ĐĂNG KÝ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Bạn đã có tài khoản?{" "}
          <Link to="/" className="text-orange-500 font-medium hover:text-orange-600 transition underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;