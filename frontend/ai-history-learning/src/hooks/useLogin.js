import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const ROLE_CONFIG = {
  ADMIN:   { path: "/admin",   label: "Quản trị viên" },
  TEACHER: { path: "/teacher", label: "Giáo viên" },
  LEARNER: { path: "/learner", label: "Người học" },
};

export const useLogin = () => {
  const { setAuthUser } = useAuth(); 
  const [input, setInput] = useState({ email: "", pass: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const err = {};
    if (!input.email) err.email = "Vui lòng nhập email";
    if (!input.pass)  err.pass  = "Vui lòng nhập mật khẩu";
    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    try {
      const resData = await authService.login(input.email, input.pass);
      const user = resData.data || resData; 
      const roleLabel = ROLE_CONFIG[user.role]?.label ?? user.role;

      // 1. Hiện thông báo và CHỜ tắt
      await Swal.fire({
        icon: "success",
        title: "ĐĂNG NHẬP THÀNH CÔNG",
        html: `Xin chào <b>${user.fullName}</b><br/><span style="font-size:13px;color:#6b7280">Vai trò: ${roleLabel}</span>`,
        confirmButtonColor: "#f97316",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // 2. Chờ xong mới set user và chuyển trang
      setAuthUser(user);
      const path = ROLE_CONFIG[user.role]?.path || "/";
      navigate(path);
    } catch (error) {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.response?.data?.error || "";

      const isAuthError = [400, 401, 403, 404].includes(status);
      const msg = isAuthError
        ? "Tài khoản hoặc mật khẩu không chính xác"
        : serverMsg || "Lỗi server, vui lòng thử lại sau";

      Swal.fire({
        icon: "error", title: isAuthError ? "Đăng nhập thất bại" : "Có lỗi xảy ra", text: msg, confirmButtonColor: "#f97316",
      });
      setErrors({ pass: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const resData = await authService.googleAuth({
        token: credentialResponse.credential, 
      });

      const user = resData.data || resData;
      const roleLabel = ROLE_CONFIG[user.role]?.label ?? user.role;

      // 1. Hiện thông báo và CHỜ tắt
      await Swal.fire({
        icon: "success",
        title: "ĐĂNG NHẬP THÀNH CÔNG",
        html: `Xin chào <b>${user.fullName || 'bạn'}</b><br/><span style="font-size:13px;color:#6b7280">Vai trò: ${roleLabel}</span>`,
        confirmButtonColor: "#f97316",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // 2. Chờ xong mới set user và chuyển trang
      setAuthUser(user);
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || "Đăng nhập Google thất bại";
      Swal.fire({ icon: "error", title: "Lỗi đăng nhập", text: msg, confirmButtonColor: "#f97316" });
    } finally {
      setLoading(false);
    }
  };

  return { input, errors, loading, showPass, setShowPass, handleChange, handleLogin, handleGoogleSuccess };
};