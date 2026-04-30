// src/hooks/useRegister.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authService } from "@/services/authService"; 

export const useRegister = () => {
  const [input, setInput] = useState({
    hoTen: "",
    email: "",
    pass: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Hook chuyển hướng của React Router
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(role === selectedRole ? null : selectedRole);
    setErrors((prev) => ({ ...prev, role: "" }));
  };

  // 🔥 Hàm xử lý khi Component <GoogleLogin /> trả về kết quả thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    let selectedRole = role;

    // Nếu người dùng bấm thẳng Google mà chưa chọn Role -> Hiển thị Popup hỏi
    if (!selectedRole) {
      const { value: roleFromPopup } = await Swal.fire({
        title: "Bạn là ai?",
        text: "Vui lòng chọn vai trò để hoàn tất đăng ký",
        icon: "question",
        input: "radio",
        inputOptions: {
          LEARNER: "Người học",
          TEACHER: "Giáo viên",
        },
        inputValidator: (value) => {
          if (!value) return "Bạn cần chọn một vai trò!";
        },
        confirmButtonText: "Tiếp tục",
        confirmButtonColor: "#f97316",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      });

      if (!roleFromPopup) return; // Nếu bấm Hủy thì dừng lại
      selectedRole = roleFromPopup;
      setRole(roleFromPopup);
    }

    setLoading(true);
    try {
      // Gửi Token (credential) xuống Backend
      const res = await authService.googleAuth({
        token: credentialResponse.credential, // Component này trả về 'credential'
        role: selectedRole,
      });

      if (res.success) {
        // Thông báo đẹp mắt
        await Swal.fire({
          icon: "success",
          title: "ĐĂNG KÝ THÀNH CÔNG",
          text: "Chào mừng bạn đến với Lịch Sử Việt Nam!",
          confirmButtonColor: "#f97316",
          timer: 1500, // Đóng nhanh hơn 1 chút để vào trang chủ luôn
          timerProgressBar: true,
          showConfirmButton: false // Ẩn nút OK để tự động chuyển trang mượt hơn
        });
        
        // 🔥 CHUYỂN HƯỚNG ĐẾN TRANG CHỦ LUÔN THEO Ý BẠN
        navigate("/");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Lỗi server khi đăng ký bằng Google";
      Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let err = {};

    const name = input.hoTen?.trim() || "";
    if (!name) err.hoTen = "Vui lòng nhập Họ và Tên";
    else if (name.replace(/\s/g, "").length < 3) err.hoTen = "Họ tên phải có ít nhất 3 ký tự";
    
    if (!input.email.trim()) err.email = "Vui lòng nhập Email";
    if (!input.pass.trim()) err.pass = "Vui lòng nhập Mật khẩu";
    if (!input.passwordConfirm.trim()) err.passwordConfirm = "Vui lòng nhập lại mật khẩu";
    else if (input.pass !== input.passwordConfirm) err.passwordConfirm = "Mật khẩu nhập lại không khớp";
    
    if (!role) err.role = "Vui lòng chọn vai trò";

    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        fullName: input.hoTen.trim(),
        email: input.email.trim(),
        password: input.pass,
        passwordConfirm: input.passwordConfirm,
        role,
      });
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "ĐĂNG KÝ THÀNH CÔNG",
          text: `Chào mừng ${input.hoTen} đến với Lịch Sử Việt Nam!`,
          confirmButtonColor: "#f97316",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
        
        navigate("/");
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || "Lỗi server";
      Swal.fire({ icon: "error", title: "Đăng ký thất bại", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return {
    input,
    errors,
    role,
    loading,
    handleInput,
    handleRoleSelect,
    handleSubmit,
    handleGoogleSuccess, 
  };
};