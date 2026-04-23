import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

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
    if (!input.email.trim()) err.email = "Vui lòng nhập email";
    if (!input.pass.trim())  err.pass  = "Vui lòng nhập mật khẩu";
    
    if (Object.keys(err).length) { 
      setErrors(err); 
      return; 
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/login", { 
        email: input.email, 
        password: input.pass 
      });

      const { token, data: user } = res.data;
      localStorage.setItem("token", token); 
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role.toLowerCase());

      await Swal.fire({
        icon: "success",
        title: "ĐĂNG NHẬP THÀNH CÔNG",
        text: `Chào mừng ${user.fullName} quay trở lại!`,
        confirmButtonColor: "#f97316",
        timer: 2000,
        timerProgressBar: true,
      });

      const role = user.role.toLowerCase();
      navigate(role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/learner");

    } catch (error) {
      const msg = error.response?.data?.error || "Email hoặc mật khẩu không chính xác";
      
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: msg,
        confirmButtonColor: "#f97316",
      });
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
        backgroundImage: `url('${process.env.PUBLIC_URL}/thumnail.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 w-full max-w-[400px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-xl mx-4">
        <div className="flex flex-col items-center mb-6">
          {/* ĐÃ SỬA: Trỏ đúng tên file Logo.jpg của bạn */}
          <img 
            src={`${process.env.PUBLIC_URL}/Logo.jpg`} 
            alt="Logo" 
            className="w-20 h-20 mb-2 object-contain rounded-full shadow-sm" 
          />
          <h1 className="text-lg font-semibold text-gray-800 text-center mb-1">ĐĂNG NHẬP</h1>
          <p className="text-sm text-gray-400 text-center">Nhập thông tin Email và Mật khẩu</p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input 
              type="email" 
              name="email"
              placeholder="m@example.com"
              className={inputClass("email")}
              value={input.email}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1.5">
              Mật khẩu <span className="text-red-400">*</span>
            </label>
            <input 
              type="password" 
              name="pass"
              placeholder="••••••••"
              className={inputClass("pass")}
              value={input.pass}
              onChange={handleChange}
            />
            {errors.pass && <p className="text-xs text-red-500 mt-1">{errors.pass}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Đang xác thực..." : "ĐĂNG NHẬP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Bạn chưa có tài khoản?{" "}
            <Link to="/register" className="text-orange-500 font-medium hover:text-orange-600 transition underline">
              Đăng ký ngay
            </Link>
          </p>
          <button className="text-gray-400 text-xs mt-3 hover:text-gray-600 transition">
            Quên mật khẩu?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;