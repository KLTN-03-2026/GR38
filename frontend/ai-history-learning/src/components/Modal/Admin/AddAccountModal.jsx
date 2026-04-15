import React, { useState } from "react";
import { X, User, Image as ImageIcon, } from "lucide-react";

const AddAccountModal = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState("info"); // 'info' hoặc 'avatar'
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    role: "Giáo viên",
    status: "Đang hoạt động",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Thêm tài khoản
            </h2>
            <p className="text-slate-500 text-sm">
              Nhập thông tin người dùng mới
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 mx-6 mt-6 rounded-xl">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "info"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500"
            }`}
          >
            <User size={18} /> Thông tin
          </button>
          <button
            onClick={() => setActiveTab("avatar")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "avatar"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500"
            }`}
          >
            <ImageIcon size={18} /> Ảnh Avatar
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === "info" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">
                  Họ tên
                </label>
                <input
                  name="name"
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">
                  Số điện thoại
                </label>
                <input
                  name="phone"
                  onChange={handleChange}
                  placeholder="0xxx..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">
                  Ngày sinh
                </label>
                <div className="relative">
                  <input
                    name="dob"
                    type="date"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">
                  Vai trò
                </label>
                <select
                  name="role"
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Giáo viên">Giáo viên</option>
                  <option value="Học sinh">Học sinh</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">
                  Trạng thái
                </label>
                <select
                  name="status"
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition-all font-semibold text-slate-700"
              >
                <ImageIcon size={20} /> Tải ảnh
              </button>
              <p className="mt-4 text-slate-400 text-sm">
                Ảnh Avatar từ file máy tính
              </p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#F26739] text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-200"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
