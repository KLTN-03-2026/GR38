import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";

const AccountDetail = ({ account, onBack, onUpdate, onDelete }) => {
  const initialStatus = account.isActive
    ? "Đang hoạt động"
    : account.isDisabledByAdmin
      ? "Đã vô hiệu hóa"
      : "Chờ xử lý";

  const [formData, setFormData] = useState({
    ...account,
    statusText: initialStatus,
  });

  const handleEditSubmit = () => {
    Swal.fire({
      title: "Xác nhận lưu?",
      text: "Hệ thống sẽ cập nhật trạng thái mới cho tài khoản này.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      confirmButtonText: "Xác nhận",
    }).then((result) => {
      if (result.isConfirmed) {
        onUpdate({
          _id: formData._id || formData.id,
          role: formData.role,
          isActive: formData.statusText === "Đang hoạt động",
          isDisabledByAdmin: formData.statusText === "Đã vô hiệu hóa",
        });
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
        <span>Quay lại</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-5xl mx-auto w-full">
        {initialStatus === "Chờ xử lý" && (
          <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-500" size={24} />
              <div>
                <p className="text-amber-900 font-bold">Yêu cầu đăng ký mới</p>
                <p className="text-amber-700 text-sm">
                  Tài khoản này cần được phê duyệt để truy cập hệ thống.
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setFormData({ ...formData, statusText: "Đang hoạt động" })
              }
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition-all"
            >
              Kích hoạt ngay
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row p-8 gap-12">
          <div className="w-full md:w-1/3 flex flex-col items-center p-8 bg-slate-50/50 border border-slate-100 rounded-2xl h-fit">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 overflow-hidden border-4 border-white shadow-lg">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={64} className="text-slate-300" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase text-center">
              {formData.fullName || formData.name}
            </h2>
            <div
              className={`px-4 py-1 rounded-full text-[10px] font-bold text-white uppercase mb-4 ${
                formData.statusText === "Đang hoạt động"
                  ? "bg-green-500"
                  : formData.statusText === "Chờ xử lý"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
            >
              {formData.statusText}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-6">
              <Calendar size={14} />
              Tham gia:{" "}
              {new Date(formData.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Họ và tên
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.fullName || formData.name || ""}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email || ""}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Vai trò
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="TEACHER">TEACHER</option>
                  <option value="LEARNER">LEARNER</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Trạng thái phê duyệt
                </label>
                <select
                  value={formData.statusText}
                  onChange={(e) =>
                    setFormData({ ...formData, statusText: e.target.value })
                  }
                  className={`w-full p-3 bg-white border rounded-xl font-semibold outline-none focus:ring-2 focus:ring-orange-100 ${formData.statusText === "Chờ xử lý" ? "border-amber-300 text-amber-600" : "border-slate-200"}`}
                >
                  <option value="Chờ xử lý">Chờ xử lý</option>
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Đã vô hiệu hóa">Đã vô hiệu hóa</option>
                </select>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <button
                onClick={handleEditSubmit}
                className="w-full py-4 bg-[#F26739] text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Lưu thay đổi
              </button>
              <button
                onClick={() =>
                  onDelete(formData._id || formData.id, formData.fullName)
                }
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
