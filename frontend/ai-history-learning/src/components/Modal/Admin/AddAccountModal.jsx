import React, { useState } from "react";
import { X, Info } from "lucide-react";

const AddAccountModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "TEACHER",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Tự động gán mật khẩu dựa trên vai trò để tránh lỗi thiếu dữ liệu phía API
    const defaultPassword =
      formData.role === "TEACHER" ? "Teacher@123" : "Learner@123";

    const payload = {
      ...formData,
      password: defaultPassword,
      isActive: true, // Admin thêm thì mặc định kích hoạt luôn
      isDisabledByAdmin: false,
    };

    onAdd(payload);
    onClose();
    setFormData({ fullName: "", email: "", role: "TEACHER" }); // Reset form
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">
            Thêm tài khoản mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Họ tên</label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                className="px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-[#F26739]"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                Địa chỉ Email
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-[#F26739]"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                Vai trò
              </label>
              <select
                className="px-4 py-3 bg-slate-50 border rounded-xl outline-none"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="TEACHER">Giáo viên</option>
                <option value="LEARNER">Người học</option>
              </select>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
              <Info size={20} className="text-[#F26739] shrink-0" />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-[#F26739]">Thông tin mật khẩu:</p>
                Mật khẩu mặc định:{" "}
                <span className="font-bold">
                  {formData.role === "TEACHER" ? "Teacher@123" : "Learner@123"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#F26739] text-white font-bold rounded-xl shadow-lg hover:opacity-90"
            >
              Xác nhận thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
