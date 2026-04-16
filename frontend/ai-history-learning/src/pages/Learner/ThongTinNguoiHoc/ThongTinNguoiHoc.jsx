import React, { useState } from "react";
import logoHS from "../../../assets/logohs.png";

const ThongTinNguoiHoc = () => {
  const [showModal, setShowModal] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert("Cập nhật thông tin cá nhân thành công!");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    alert("Cập nhật mật khẩu thành công!");
    setShowModal(false);
  };

  return (
    /* Container chính - Giữ nguyên vị trí nhưng tăng độ phủ */
    <div className="absolute left-[235px] top-[64px] w-[calc(100%-235px)] h-[calc(100vh-64px)] flex flex-col items-center px-8 py-6 bg-[#FAFAFA] font-['Inter'] overflow-y-auto">
      
      {/* Header Section */}
      <div className="w-full h-[40px] flex flex-row justify-center items-center mb-4">
        <h1 className="text-[26px] font-semibold tracking-[0.4px] text-[#09090B]">
          Thông tin cá nhân
        </h1>
      </div>

      {/* Main Content Card - Tăng chiều cao (h-[750px]) và thu hẹp chiều rộng (w-[700px]) */}
      <div className="relative w-[700px]">
        <div className="w-full h-[750px] bg-white border border-[#E4E4E7] shadow-sm rounded-[16px] flex flex-col items-center p-8">
          
          {/* Avatar Section - Thu nhỏ lại một chút */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden mb-3 border border-gray-100 shadow-sm">
              <img src={logoHS} alt="User Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-[22px] font-semibold text-[#09090B]">
              Nguyễn Văn A
            </h2>
            <p className="text-[13px] text-[#71717A]">
              nguyenvana@gmail.com
            </p>
          </div>

          {/* Form Fields - Thu nhỏ chiều rộng form (w-[500px]) */}
          <form onSubmit={handleUpdateProfile} className="w-[500px] flex flex-col gap-5">
            {[
              { label: "Họ và tên", value: "Nguyễn Văn A", type: "text" },
              { label: "Email", value: "nguyenvana@gmail.com", type: "email" },
              { label: "Số điện thoại", value: "0851225478", type: "text" },
              { label: "Mật khẩu", value: "••••••••••••••••", type: "password", disabled: true },
            ].map((field, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#09090B] flex items-center">
                  {field.label} {index !== 3 && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={field.type}
                  defaultValue={field.value}
                  disabled={field.disabled}
                  className="w-full h-10 px-4 bg-white border border-[#E4E4E7] rounded-lg text-[13px] text-[#09090B] outline-none focus:border-[#F26739] transition-all"
                />
              </div>
            ))}

            {/* Buttons Group */}
            <div className="flex flex-col gap-3 mt-6">
              <button 
                type="submit"
                className="w-full h-10 bg-[#F26739] text-white text-[14px] font-semibold rounded-lg hover:bg-orange-600 shadow-sm transition-all active:scale-[0.98]"
              >
                Xác nhận thay đổi
              </button>
              <button 
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full h-10 border border-[#F26739] text-[#F26739] text-[14px] font-semibold rounded-lg hover:bg-orange-50 transition-all active:scale-[0.98]"
              >
                Thay đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- MODAL ĐỔI MẬT KHẨU --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowModal(false)}
          />
          
          <div className="relative bg-white w-[400px] p-6 rounded-[16px] shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <h2 className="text-[22px] font-bold text-[#000000] mb-1">Đổi mật khẩu</h2>
            <p className="text-[12px] text-gray-500 mb-6 text-center">
              Nhập email liên kết để đổi mật khẩu
            </p>

            <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-[#09090B]">Gmail <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  defaultValue="nguyenvana@gmail.com" 
                  className="w-full h-10 px-4 border border-[#E4E4E7] rounded-lg text-[13px] outline-none"
                />
              </div>

              <button type="button" className="w-full h-10 bg-[#F26739] text-white text-[13px] font-bold rounded-lg transition-colors hover:bg-orange-600">
                Lấy mã xác thực
              </button>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-[#09090B]">Nhập mã xác thực <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Gồm 6 số" 
                  className="w-full h-10 px-4 border border-[#E4E4E7] rounded-lg text-[13px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-[#09090B]">Nhập mật khẩu mới <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  placeholder="***********" 
                  className="w-full h-10 px-4 border border-[#E4E4E7] rounded-lg text-[13px] outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-10 bg-[#F26739] text-white text-[13px] font-bold rounded-lg mt-2 shadow-md hover:bg-orange-600 transition-all"
              >
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongTinNguoiHoc;