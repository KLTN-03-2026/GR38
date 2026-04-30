import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authService } from "@/services/authService";

export const useForgotPassword = () => {
  const [step, setStep] = useState(1); // Bước 1: Nhập email, Bước 2: Nhập OTP & Mật khẩu mới
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Xử lý Gửi OTP (Bước 1)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email) {
      setErrors({ email: "Vui lòng nhập email của bạn" });
      return;
    }

    setLoading(true);
    try {
      // Sử dụng authService thay cho fetch
      const data = await authService.forgotPassword(email);
      
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: data.message || "Mã OTP đã được gửi đến email của bạn",
        confirmButtonColor: "#f97316",
      });
      setStep(2); // Chuyển sang form nhập OTP

    } catch (err) {
      // Axios trả về lỗi trong err.response.data
      const errorMessage = err.response?.data?.error || "Không thể kết nối đến máy chủ";
      setErrors({ email: errorMessage });
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: errorMessage,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đổi mật khẩu (Bước 2)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    
    let currentErrors = {};
    if (!otp || otp.length !== 6) currentErrors.otp = "Mã OTP phải gồm 6 chữ số";
    if (!newPassword || newPassword.length < 6) currentErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setLoading(true);
    try {
      // Sử dụng authService thay cho fetch
      const data = await authService.resetPassword({ email, otp, newPassword });

      Swal.fire({
        icon: "success",
        title: "Hoàn tất",
        text: data.message || "Đặt lại mật khẩu thành công!",
        confirmButtonColor: "#f97316",
      }).then(() => {
        navigate("/login"); // Đổi pass thành công thì điều hướng về trang đăng nhập
      });

    } catch (err) {
      // Axios trả về lỗi trong err.response.data
      const errorMessage = err.response?.data?.error || "Lỗi khi đổi mật khẩu";
      setErrors({ form: errorMessage });
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: errorMessage,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};