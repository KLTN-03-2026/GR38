import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import api from "../../../lib/api";
import Swal from "sweetalert2";

const ReportDetail = ({ report, onBack, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Hàm cập nhật trạng thái báo cáo
  const updateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);

      // Mapping nhãn hiển thị cho thông báo thành công
      const statusLabels = {
        resolved: "Đã xử lý",
        in_progress: "Đang xử lý",
        rejected: "Từ chối/Xóa",
      };

      await api.patch(`/reports/${report._id}/status`, {
        status: newStatus,
        adminNotes: "Cập nhật từ chi tiết báo cáo",
      });

      await Swal.fire({
        title: "Thành công!",
        text: `Đã chuyển trạng thái sang: ${statusLabels[newStatus]}`,
        icon: "success",
        confirmButtonColor: "#F26739",
      });

      // Gọi onRefresh để trang cha cập nhật lại danh sách theo bộ lọc hiện tại
      if (onRefresh) onRefresh();

      // Quay về trang danh sách
      onBack();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể kết nối đến máy chủ hoặc cập nhật trạng thái.",
        icon: "error",
        confirmButtonColor: "#F26739",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-['Inter'] bg-slate-50 min-h-screen p-8">
      {/* Nút quay lại */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-[#F26739] transition-colors font-medium group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Trở về danh sách</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Khối bên trái: Chi tiết nội dung */}
        <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-50 bg-slate-50/30">
            <h1 className="text-xl font-bold text-slate-900 uppercase mb-2 tracking-tight">
              Chi tiết báo cáo sự cố
            </h1>
            <p className="text-sm text-slate-600 font-medium mb-1">
              Hệ thống hỗ trợ học tập Lịch sử Việt Nam
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Mã ID: {report._id}
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-y-6 mb-10">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Thông tin người gửi
                </p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-slate-500">Họ và tên:</span>{" "}
                    <span className="font-semibold text-slate-900">
                      {report.reporterId?.fullName || "Người dùng ẩn danh"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Email:</span>{" "}
                    <span className="text-slate-900">
                      {report.reporterId?.email || "Chưa cập nhật"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Thông tin thời gian
                </p>
                <p className="text-sm text-slate-600">
                  Ngày gửi:{" "}
                  <span className="text-slate-900">
                    {new Date(report.createdAt).toLocaleString("vi-VN")}
                  </span>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Phân loại:{" "}
                  <span className="font-bold text-[#F26739] bg-orange-50 px-2 py-0.5 rounded">
                    {report.targetType}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative">
              <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 rounded">
                Nội dung chi tiết
              </div>
              <p className="text-slate-700 leading-relaxed italic text-lg">
                "{report.description}"
              </p>
            </div>
          </div>
        </div>

        {/* Khối bên phải: Xử lý hành động */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sticky top-8">
            <h2 className="text-lg font-bold text-slate-900 text-center mb-6">
              Bảng điều khiển xử lý
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-200">
                <span className="text-sm text-slate-500 font-medium">
                  Trạng thái hiện tại:
                </span>
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                    report.status === "pending"
                      ? "text-red-600 bg-red-50 border border-red-100"
                      : report.status === "resolved"
                        ? "text-green-600 bg-green-50 border border-green-100"
                        : "text-yellow-600 bg-yellow-50 border border-yellow-100"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {/* Nhóm nút hành động */}
              <div className="flex flex-col gap-3 mt-8">
                <button
                  disabled={isUpdating || report.status === "resolved"}
                  onClick={() => updateStatus("resolved")}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 transition-all font-bold disabled:opacity-40 disabled:grayscale shadow-lg shadow-green-100"
                >
                  <CheckCircle size={18} /> Duyệt & Hoàn tất
                </button>

                <button
                  disabled={isUpdating || report.status === "in_progress"}
                  onClick={() => updateStatus("in_progress")}
                  className="flex items-center justify-center gap-2 bg-yellow-500 text-white py-3.5 rounded-xl hover:bg-yellow-600 transition-all font-bold disabled:opacity-40 disabled:grayscale shadow-lg shadow-yellow-100"
                >
                  <Clock size={18} /> Đang xử lý
                </button>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    disabled={isUpdating}
                    onClick={() => updateStatus("rejected")}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all font-bold disabled:opacity-40 border border-transparent hover:border-red-100"
                  >
                    <XCircle size={18} /> Từ chối báo cáo
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[10px] text-center text-slate-400 italic">
              Lưu ý: Mọi thao tác thay đổi trạng thái sẽ được ghi lại vào nhật
              ký hệ thống của quản trị viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
