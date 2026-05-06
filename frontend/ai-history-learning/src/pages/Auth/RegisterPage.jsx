import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";
import { GoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";

function RegisterPage() {
  const {
    input, errors, role, loading,
    handleInput, handleRoleSelect, handleSubmit, handleGoogleSuccess, 
  } = useRegister();

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

      {/* Đã giảm p-8 xuống p-6, thêm max-h-[95vh] và overflow-y-auto để có thể cuộn nếu màn hình quá nhỏ */}
      <div 
        className="relative z-10 w-full max-w-[420px] max-h-[95vh] overflow-y-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-xl mx-4 [&::-webkit-scrollbar]:hidden"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <h1 className="text-lg font-semibold text-gray-800 text-center mb-1">ĐĂNG KÝ</h1>
        <p className="text-sm text-gray-400 text-center mb-4">Đăng ký để kết nối với chúng tôi</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Giảm mb-4 xuống mb-3, mb-1.5 xuống mb-1 để tiết kiệm chiều cao */}
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Họ và Tên <span className="text-red-400">*</span></label>
            <input type="text" name="hoTen" placeholder="Nguyễn Văn A" value={input.hoTen} onChange={handleInput} className={inputClass("hoTen")} />
            {errors.hoTen && <p className="text-xs text-red-500 mt-1">{errors.hoTen}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Email <span className="text-red-400">*</span></label>
            <input type="email" name="email" placeholder="m@example.com" value={input.email} onChange={handleInput} autoComplete="off" className={inputClass("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Mật khẩu <span className="text-red-400">*</span></label>
            <input type="password" name="pass" placeholder="••••••••" value={input.pass} onChange={handleInput} autoComplete="new-password" className={inputClass("pass")} />
            {errors.pass && <p className="text-xs text-red-500 mt-1">{errors.pass}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Nhập lại mật khẩu <span className="text-red-400">*</span></label>
            <input type="password" name="passwordConfirm" placeholder="••••••••" value={input.passwordConfirm} onChange={handleInput} autoComplete="new-password" className={inputClass("passwordConfirm")} />
            {errors.passwordConfirm && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Vai trò <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleRoleSelect("TEACHER")}
                className={`flex items-center justify-center gap-1.5 py-1.5 border text-xs font-medium rounded-md transition
                  ${role === "TEACHER" ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                Giáo viên
              </button>
              <button type="button" onClick={() => handleRoleSelect("LEARNER")}
                className={`flex items-center justify-center gap-1.5 py-1.5 border text-xs font-medium rounded-md transition
                  ${role === "LEARNER" ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                Học sinh
              </button>
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-2">
            {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
          </button>
        </form>

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-xs text-gray-400 bg-transparent">Hoặc</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* NÚT ĐĂNG KÝ BẰNG GOOGLE */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              Swal.fire({ icon: "error", title: "Lỗi", text: "Đăng nhập Google thất bại!" });
            }}
            width="350"
            useOneTap={false}
            shape="rectangular"
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Bạn đã có tài khoản?{" "}
          <Link to="/" className="text-orange-500 font-medium hover:text-orange-600 transition underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;