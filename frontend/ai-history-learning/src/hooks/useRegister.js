import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authService } from "@/services/authService"; 
import { useAuth } from "@/context/AuthContext"; 

export const useRegister = () => {
  const { setAuthUser } = useAuth(); 
  const [input, setInput] = useState({ hoTen: "", email: "", pass: "", passwordConfirm: "" });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
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


  // XỬ LÝ GOOGLE LOGIN/REGISTER 
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    
    try {
      let resData = await authService.googleAuth({
        token: credentialResponse.credential, 
      });


      if (resData.requireRole) {
        setLoading(false); 

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

        if (!roleFromPopup) return; 

        setLoading(true);
        setRole(roleFromPopup);

        resData = await authService.googleAuth({
          token: credentialResponse.credential, 
          role: roleFromPopup,
        });
      }

      // 4. XỬ LÝ KẾT QUẢ CUỐI CÙNG 

      
      if (resData.isPendingApproval) {
        await Swal.fire({
          icon: "info",
          title: "CHỜ PHÊ DUYỆT",
          text: resData.message,
          confirmButtonColor: "#f97316"
        });
        navigate("/"); 
        return; 
      }

      const user = resData.data || resData.user || resData;

      const isNewUser = resData.isNewUser;
      const titleMsg = isNewUser ? "ĐĂNG KÝ THÀNH CÔNG" : "ĐĂNG NHẬP THÀNH CÔNG";
      const textMsg = isNewUser 
        ? "Chào mừng bạn đến với Lịch Sử Việt Nam!" 
        : "Chào mừng bạn quay trở lại!";

      await Swal.fire({
        icon: "success",
        title: titleMsg,
        text: textMsg,
        confirmButtonColor: "#f97316",
        timer: 1500, 
        timerProgressBar: true,
        showConfirmButton: false 
      });
      
      setAuthUser(user);
      navigate("/");

    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Lỗi server khi xác thực Google";
      Swal.fire({
        icon: "error", title: "Thất bại", text: errorMsg, confirmButtonColor: "#f97316"
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

    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    try {
      const resData = await authService.register({
        fullName: input.hoTen.trim(),
        email: input.email.trim(),
        password: input.pass,
        passwordConfirm: input.passwordConfirm,
        role,
      });
      
      if (resData.isPendingApproval) {
        await Swal.fire({
          icon: "info",
          title: "ĐĂNG KÝ THÀNH CÔNG",
          text: resData.message,
          confirmButtonColor: "#f97316"
        });
        navigate("/"); 
        return; 
      }

      const user = resData.data || resData;

      await Swal.fire({
        icon: "success",
        title: "ĐĂNG KÝ THÀNH CÔNG",
        text: `Chào mừng ${input.hoTen} đến với Lịch Sử Việt Nam!`,
        confirmButtonColor: "#f97316",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      setAuthUser(user);
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || "Lỗi server";
      Swal.fire({ icon: "error", title: "Đăng ký thất bại", text: msg, confirmButtonColor: "#f97316" });
    } finally {
      setLoading(false);
    }
  };

  return { input, errors, role, loading, handleInput, handleRoleSelect, handleSubmit, handleGoogleSuccess };
};