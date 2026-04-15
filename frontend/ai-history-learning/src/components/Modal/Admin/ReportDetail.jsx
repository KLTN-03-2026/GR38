import React from "react";
import { ArrowLeft,  } from "lucide-react";

const ReportDetail = ({ report, onBack }) => {
  // Dữ liệu mẫu nếu không có props truyền vào
  const data = report || {
    id: "001",
    projectName:
      "XÂY DỰNG WEBSITE Hỗ trợ ôn tập lịch sử Việt Nam tích hợp trợ lý trí tuệ nhân tạo",
    user: {
      id: "111",
      name: "Phan Mạnh Quỳnh",
      date: "15/02/2026",
      role: "Giáo viên",
    },
    issues: [
      {
        stt: 1,
        content: "Chat AI không được",
        type: "Lỗi AI",
        status: "Chưa xử lý",
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col font-['Inter'] bg-slate-50 min-h-screen p-8">
      {/* Nút quay lại */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Trở về</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Khối bên trái: Chi tiết nội dung báo cáo */}
        <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-50">
            <h1 className="text-xl font-bold text-slate-900 uppercase mb-2">
              Chi tiết báo cáo
            </h1>
            <p className="text-sm text-slate-600 font-medium mb-1">
              {data.projectName}
            </p>
            <p className="text-xs text-slate-400">Mã báo cáo: {data.id}</p>
          </div>

          <div className="p-8">
            {/* Thông tin người dùng */}
            <div className="grid grid-cols-2 gap-y-4 mb-10">
              <div>
                <p className="text-xs font-bold text-slate-900 mb-1">
                  Thông tin người dùng
                </p>
                <p className="text-sm text-slate-600">Mã: {data.user.id}</p>
                <p className="text-sm text-slate-600">
                  Họ và tên: {data.user.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mt-5">
                  Ngày gửi báo cáo: {data.user.date}
                </p>
                <p className="text-sm text-slate-600">
                  Chức vụ : {data.user.role}
                </p>
              </div>
            </div>

            {/* Bảng nội dung sự cố */}
            <div className="overflow-hidden border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-bold text-slate-900 text-center w-16">
                      STT
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-900">
                      Nội dung
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-900">
                      Loại sự cố
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-900 text-center">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.issues.map((issue, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-slate-900 text-center font-medium">
                        {issue.stt}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {issue.content}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {issue.type}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                          {issue.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Khối bên phải: Xử lý báo cáo */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-lg font-bold text-slate-900 text-center mb-6">
              Xử lý báo cáo
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                <span className="text-sm font-bold text-slate-900">
                  Báo cáo
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-slate-900">
                  Tổng báo cáo:
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {data.issues.length.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Nhóm nút hành động */}
              <div className="grid grid-cols-3 gap-2 mt-8">
                <button className="flex flex-col items-center justify-center gap-2 bg-[#F26739] text-white py-3 px-2 rounded-lg hover:opacity-90 transition-all shadow-sm">
                  <span className="text-xs font-bold">Duyệt</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 bg-[#F26739] text-white py-3 px-2 rounded-lg hover:opacity-90 transition-all shadow-sm">
                  <span className="text-xs font-bold">Xóa</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 bg-[#F26739] text-white py-3 px-2 rounded-lg hover:opacity-90 transition-all shadow-sm">
                  <span className="text-xs font-bold">Từ chối</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
