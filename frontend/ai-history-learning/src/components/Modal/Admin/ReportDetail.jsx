import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Tag, FileText } from "lucide-react";
import api from "../../../lib/api";
import Swal from "sweetalert2";

const ReportDetail = ({ report, onBack, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Logic xử lý tách chuỗi để hiển thị Tiêu đề và Mô tả riêng biệt
  const parsedData = (() => {
    const rawContent = report.description || "";
    const match = rawContent.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { extractedTitle: match[1], extractedDesc: match[2] };
    }
    return { extractedTitle: "Không có tiêu đề", extractedDesc: rawContent };
  })();

  const ISSUE_TYPE_LABELS = {
    historical_fact: "Sai thông tin lịch sử",
    timeline: "Sai thời gian",
    inappropriate_behavior: "Hành vi không chuẩn mực",
    spam: "Spam",
    typo: "Lỗi tài liệu",
    other: "Khác",
  };

  const updateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);

      // 1. Nội dung này sẽ lưu vào DB và hiển thị cho NGƯỜI HỌC (Người báo cáo)
      const adminNotes =
        newStatus === "resolved"
          ? "Cảm ơn bạn, Admin đã tiếp nhận và xử lý khiếu nại này."
          : "Báo cáo không hợp lệ hoặc không đủ thông tin để xử lý.";

      // 2. Nội dung này hiển thị cho ADMIN (Người đang thao tác)
      const successMessage =
        newStatus === "resolved"
          ? "Đã duyệt báo cáo thành công!"
          : "Đã từ chối báo cáo này.";

      const response = await api.patch(`reports/${report._id}/status`, {
        status: newStatus,
        adminNotes: adminNotes,
      });

      if (response.data.success) {
        // Hiển thị thông báo phù hợp với vai trò Admin
        await Swal.fire({
          title: "Thành công!",
          text: successMessage,
          icon: "success",
          confirmButtonColor: "#F26739",
          confirmButtonText: "Đóng",
        });

        if (onRefresh) onRefresh();
        onBack();
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi xử lý!",
        text: "Không thể cập nhật trạng thái báo cáo.",
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
            <h1 className="text-xl font-bold text-slate-900 uppercase">
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
                  Thông tin gửi
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-center gap-4">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-blue-600 uppercase mb-1">
                    Loại sự cố
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {ISSUE_TYPE_LABELS[report.issueType] || "Khác"}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 flex items-center gap-4">
                <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-indigo-600 uppercase mb-1">
                    Tiêu đề
                  </p>
                  <p className="text-lg font-bold text-indigo-900 truncate">
                    {parsedData.extractedTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative mt-4">
              <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase border border-slate-100 rounded">
                Mô tả chi tiết
              </div>
              <p className="text-slate-700 text-base leading-relaxed pt-2">
                {parsedData.extractedDesc || "Không có nội dung mô tả"}
              </p>
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
                  {report.status === "pending"
                    ? "Chưa xử lý"
                    : report.status === "resolved"
                      ? "Đã xử lý"
                      : "Từ chối"}
                </span>
              </div>
              <div className="flex flex-col gap-3 mt-8">
                <button
                  disabled={isUpdating || report.status !== "pending"}
                  onClick={() => updateStatus("resolved")}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 font-bold disabled:opacity-40 shadow-lg shadow-green-100 transition-all"
                >
                  <CheckCircle size={18} /> Duyệt & Hoàn tất
                </button>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    disabled={isUpdating || report.status !== "pending"}
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
