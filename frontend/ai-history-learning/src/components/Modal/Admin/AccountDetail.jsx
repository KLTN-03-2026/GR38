import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import Swal from "sweetalert2";

const AccountDetail = ({ account, onBack, onUpdate, onDelete }) => {
  // 1. Quản lý dữ liệu nhập liệu bằng State
  const [formData, setFormData] = useState({ ...account });

  if (!account) return null;

  // 2. Hàm xử lý khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Hàm xử lý Chỉnh sửa
  const handleEditSubmit = () => {
    Swal.fire({
      title: "Xác nhận cập nhật?",
      text: "Thông tin tài khoản sẽ được thay đổi trên hệ thống.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        if (onUpdate) onUpdate(formData);
        Swal.fire("Thành công!", "Tài khoản đã được cập nhật.", "success");
      }
    });
  };

  // 4. Hàm xử lý Xóa
  const handleDeleteClick = () => {
    Swal.fire({
      title: "Xóa tài khoản?",
      text: `Bạn không thể hoàn tác sau khi xóa tài khoản ${formData.name}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        if (onDelete) onDelete(formData.id);
        onBack();
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col font-['Inter'] p-8 pt-16 bg-slate-50 min-h-screen">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6 font-semibold w-fit"
      >
        <ArrowLeft size={20} />
        <span>Trở về</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="py-6 text-center border-b border-slate-50">
          <h1 className="text-2xl font-bold text-slate-900">
            Chi tiết tài khoản
          </h1>
        </div>

        <div className="flex flex-col md:flex-row p-8 gap-12">
          {/* Cột trái: Profile Card */}
          <div className="w-full md:w-1/3 flex flex-col items-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm h-fit">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User size={48} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {formData.name}
            </h2>
            <p className="text-slate-400 text-sm mb-6">ID: {formData.id}</p>
            <span
              className={`w-full py-2 text-white text-center rounded-lg font-semibold text-sm ${formData.role === "Giáo viên" ? "bg-[#1D72D6]" : "bg-[#6366f1]"}`}
            >
              {formData.role}
            </span>
          </div>

          {/* Cột phải: Form nhập liệu */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Họ và tên
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Ngày sinh
                </label>
                <div className="relative group">
                  <input
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Số điện thoại
                </label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Vai trò
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none"
                >
                  <option value="Giáo viên">Giáo viên</option>
                  <option value="Học sinh">Học sinh</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Đã vô hiệu hóa">Đã vô hiệu hóa</option>
                </select>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <button
                onClick={handleEditSubmit}
                className="w-full py-3 bg-[#F26739] text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-sm"
              >
                Lưu thay đổi
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
