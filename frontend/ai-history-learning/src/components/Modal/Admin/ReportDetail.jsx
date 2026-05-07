import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Clock, Tag } from "lucide-react";
import api from "../../../lib/api";
import Swal from "sweetalert2";

const ReportDetail = ({ report, onBack, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const parseReportContent = (description = "") => {
    const match = description.match(/^\[(.*?)\](.*)/);
    if (match) return { title: match[1].trim(), content: match[2].trim() };
    return { title: "Thông tin sự cố", content: description };
  };

  const { title, content } = parseReportContent(report.description);

  const updateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);

      // Map giá trị string khớp với Backend
      const statusMapping = {
        resolved: "resolved",
        in_progress: "pending", // Backend dùng 'pending' cho trạng thái chờ/đang xử lý
        rejected: "rejected",
      };

      const displayLabel = {
        resolved: "Đã xử lý",
        in_progress: "Đang xử lý",
        rejected: "Từ chối",
      };

      const response = await api.patch(`reports/${report._id}/status`, {
        status: statusMapping[newStatus],
        adminNotes: `Quản trị viên đã cập nhật trạng thái: ${displayLabel[newStatus]}`,
      });

      if (response.data.success) {
        await Swal.fire({
          title: "Thành công!",
          text: `Đã chuyển trạng thái sang: ${displayLabel[newStatus]}`,
          icon: "success",
          confirmButtonColor: "#F26739",
        });
        if (onRefresh) onRefresh();
        onBack();
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);

      let msg = "Không thể kết nối đến máy chủ.";
      if (error.response?.status === 404)
        msg =
          "Lỗi 404: Không tìm thấy đường dẫn (Kiểm tra lại Route PUT ở Backend).";

      Swal.fire({
        title: "Lỗi xử lý!",
        text: msg,
        icon: "error",
        confirmButtonColor: "#F26739",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-['Inter'] bg-slate-50 min-h-screen p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-[#F26739] font-medium group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Trở về danh sách</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-50 bg-slate-50/30">
            <h1 className="text-xl font-bold text-slate-900 uppercase mb-2">
              Chi tiết báo cáo sự cố
            </h1>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-y-6 mb-10">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">
                  Người báo cáo
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {report.reporterId?.fullName || "Ẩn danh"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {report.reporterId?.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">
                  Thông tin gốc
                </p>
                <p className="text-sm text-slate-900">
                  {new Date(report.createdAt).toLocaleString("vi-VN")}
                </p>
                <div className="mt-2">
                  <span className="text-[10px] font-bold bg-orange-50 text-[#F26739] px-2 py-1 rounded border border-orange-100 uppercase">
                    Mục: {report.targetType}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-center gap-4">
              <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-blue-600 uppercase mb-1">
                  Tiêu đề báo cáo
                </p>
                <p className="text-lg font-bold text-blue-900">{title}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative mt-4">
              <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase border border-slate-100 rounded">
                Mô tả
              </div>
              <p className="text-slate-700 italic text-lg pt-2">"{content}"</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sticky top-8 text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Xử lý báo cáo
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-200">
                <span className="text-sm text-slate-500 font-medium">
                  Trạng thái hiện tại:
                </span>
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                    report.status === "pending"
                      ? "bg-red-50 text-red-600"
                      : report.status === "resolved"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button
                  disabled={isUpdating}
                  onClick={() => updateStatus("resolved")}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 font-bold disabled:opacity-40 shadow-lg shadow-green-100 transition-all"
                >
                  <CheckCircle size={18} /> Duyệt & Hoàn tất
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => updateStatus("in_progress")}
                  className="flex items-center justify-center gap-2 bg-yellow-500 text-white py-4 rounded-xl hover:bg-yellow-600 font-bold disabled:opacity-40 shadow-lg shadow-yellow-100 transition-all"
                >
                  <Clock size={18} /> Đang xử lý
                </button>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    disabled={isUpdating}
                    onClick={() => updateStatus("rejected")}
                    className="w-full flex items-center justify-center gap-2 bg-white text-slate-400 py-4 rounded-xl hover:text-red-600 hover:border-red-200 border border-slate-200 font-bold disabled:opacity-40 transition-all"
                  >
                    <XCircle size={18} /> Từ chối báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
