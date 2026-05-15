import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";

const AccountDetail = ({ account, onBack, onUpdate, onDelete }) => {
  const normalizeRole = (role) => (role || "").toString().toUpperCase();

  const getRoleLabel = (role) =>
    normalizeRole(role) === "TEACHER"
      ? "Giáo viên"
      : normalizeRole(role) === "LEARNER"
        ? "Người học"
        : role || "";

  // Logic trọng tâm: Learner thì luôn là Active nếu không bị Admin khóa
  const getInitialStatus = () => {
    if (account.isDisabledByAdmin) return "Đã vô hiệu hóa";
    // Nếu là Learner, bỏ qua trạng thái isActive của DB (vì Learner mặc định là active)
    if (normalizeRole(account.role) === "LEARNER") return "Đang hoạt động";
    // Teacher thì mới xét xem đã được duyệt (isActive) chưa
    return account.isActive ? "Đang hoạt động" : "Chờ xử lý";
  };

  const [formData, setFormData] = useState({
    ...account,
    statusText: getInitialStatus(),
  });

  // Đồng bộ lại status nếu role thay đổi trong lúc Admin đang chỉnh sửa
  useEffect(() => {
    if (
      normalizeRole(formData.role) === "LEARNER" &&
      formData.statusText === "Chờ xử lý"
    ) {
      setFormData((prev) => ({ ...prev, statusText: "Đang hoạt động" }));
    }
  }, [formData.role]);

  const handleEditSubmit = () => {
    Swal.fire({
      title: "Xác nhận thay đổi?",
      text: "Hành động này sẽ cập nhật trạng thái hoạt động của người dùng.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      confirmButtonText: "Cập nhật",
    }).then((result) => {
      if (result.isConfirmed) {
        let activeStatus = false;
        let disabledByAdmin = false;
        let teacherApprovalStatus = undefined;

        if (formData.statusText === "Đang hoạt động") {
          activeStatus = true;
          disabledByAdmin = false;
          if (normalizeRole(formData.role) === "TEACHER")
            teacherApprovalStatus = "approved";
        } else if (formData.statusText === "Đã vô hiệu hóa") {
          activeStatus = false;
          disabledByAdmin = true;
        } else {
          // Chỉ Teacher mới có thể ở trạng thái này
          activeStatus = false;
          disabledByAdmin = false;
          teacherApprovalStatus = "pending";
        }

        const payload = {
          _id: formData._id || formData.id,
          role: normalizeRole(formData.role),
          isActive: activeStatus,
          isDisabledByAdmin: disabledByAdmin,
          ...(teacherApprovalStatus ? { teacherApprovalStatus } : {}),
        };

        if (onUpdate) onUpdate(payload);
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
        <span>Trở về danh sách</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-5xl mx-auto w-full">
        {/* CHỈ HIỆN CẢNH BÁO DUYỆT VỚI TEACHER */}
        {formData.statusText === "Chờ xử lý" &&
          normalizeRole(formData.role) === "TEACHER" && (
            <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-amber-500" size={24} />
                <div>
                  <p className="text-amber-900 font-bold">
                    Giáo viên đang chờ phê duyệt
                  </p>
                  <p className="text-amber-700 text-sm">
                    Cần kích hoạt để giáo viên này có thể tham gia giảng dạy.
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
            <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
              {formData.fullName || formData.name}
            </h2>
            <div
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase mb-4 ${
                formData.statusText === "Đang hoạt động"
                  ? "bg-green-500"
                  : formData.statusText === "Chờ xử lý"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
            >
              {formData.statusText}
            </div>

            {/* HIỂN THỊ NGÀY TẠO ACC THEO YÊU CẦU CỦA HOÀI EM */}
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-6">
              <Calendar size={14} />
              <span>
                Ngày tạo:{" "}
                {formData.createdAt
                  ? new Date(formData.createdAt).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
            </div>

            <span
              className={`w-full py-2 text-white text-center rounded-lg font-bold text-xs ${normalizeRole(formData.role) === "TEACHER" ? "bg-blue-600" : "bg-indigo-500"}`}
            >
              {getRoleLabel(formData.role)}
            </span>
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
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email || ""}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Vai trò hệ thống
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-orange-100 cursor-pointer"
                >
                  <option value="TEACHER">Giáo Viên</option>
                  <option value="LEARNER">Người Học</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">
                  Trạng thái hoạt động
                </label>
                <select
                  value={formData.statusText}
                  onChange={(e) =>
                    setFormData({ ...formData, statusText: e.target.value })
                  }
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-orange-100 cursor-pointer"
                >
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
                Lưu và Cập nhật
              </button>
              <button
                onClick={() =>
                  onDelete(
                    formData._id || formData.id,
                    formData.fullName || formData.name,
                  )
                }
                className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all"
              >
                Xóa tài khoản này
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
