import React from "react";
import {
  Info,
  Wrench,
  ClipboardList,
  AlertCircle,
  Edit3,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const ReportManagement = () => {
  const reports = [
    {
      id: 101,
      user: "Phan Mạnh Quỳnh",
      date: "15/02/2025",
      content: "Không tải file PDF được",
      type: "Lỗi Website",
      status: "Chưa xử lý",
      color: "bg-red-600",
    },
    {
      id: 110,
      user: "Lâm Minh Phú",
      date: "14/09/2025",
      content: "Không nộp bài được",
      type: "Lỗi Website",
      status: "Đã xử lý",
      color: "bg-green-500",
    },
    {
      id: 220,
      user: "Lý Thành Ân",
      date: "09/02/2025",
      content: "Không làm quiz được",
      type: "Lỗi Website",
      status: "Đã xử lý",
      color: "bg-green-500",
    },
    {
      id: 430,
      user: "Đinh Bảo Toàn",
      date: "23/07/2025",
      content: "Chat AI không trả lời",
      type: "Lỗi AI",
      status: "Đang xử lý",
      color: "bg-yellow-500",
    },
    {
      id: 550,
      user: "Nguyễn Việt Dũng",
      date: "23/07/2025",
      content: "Làm flashCard lỗi",
      type: "Lỗi Website",
      status: "Đã xử lý",
      color: "bg-green-500",
    },
    {
      id: 601,
      user: "Bùi Phú Hùng",
      date: "20/05/2025",
      content: "Màn hình không hiển thị",
      type: "Lỗi Website",
      status: "Đã xử lý",
      color: "bg-green-500",
    },
    {
      id: 602,
      user: "Nguyễn Tấn Hoàng",
      date: "22/04/2025",
      content: "Lỗi chức năng thêm",
      type: "Lỗi Website",
      status: "Đã xử lý",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Quản lý báo cáo</h1>

      {/* Tìm kiếm và Lọc */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Tìm kiếm và lọc</h2>
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Lọc theo tên khách thuê"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button className="bg-[#F26739] text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
            Tìm
          </button>

          <FilterDropdown label="Giới tính" />
          <FilterDropdown label="Loại sự cố" />
          <FilterDropdown label="Trạng thái" />
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Tổng sự cố" value="175" icon={<Info size={16} />} />
          <StatCard label="Đang xử lý" value="70" icon={<Wrench size={16} />} />
          <StatCard
            label="Chưa xử lý"
            value="100"
            icon={<ClipboardList size={16} />}
          />
          <StatCard
            label="Chưa xử lý"
            value="0"
            icon={<AlertCircle size={16} />}
            isAlert
          />
        </div>
      </div>

      {/* Danh sách yêu cầu */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Danh sách yêu cầu báo cáo</h2>
        <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white border-b border-gray-300 font-bold">
              <tr>
                <th className="px-4 py-4 border-r border-gray-200 w-24">
                  Mã yêu cầu
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center w-40">
                  Tên tài khoản
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center w-40">
                  Ngày gửi yêu cầu
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center w-64">
                  Nội dung yêu cầu
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center w-32">
                  Loại sự cố
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center w-32">
                  Trạng thái
                </th>
                <th className="px-4 py-4 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 font-bold border-r border-gray-200 text-center">
                    {item.id}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center">
                    {item.user}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center">
                    {item.date}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center">
                    {item.content}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center">
                    {item.type}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center">
                    <span
                      className={`${item.color} text-white px-3 py-1 rounded-md text-[11px] font-bold inline-block w-24`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 border border-gray-300 rounded hover:bg-gray-100 shadow-sm text-gray-600">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1 border border-gray-300 rounded hover:bg-red-50 shadow-sm text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex justify-between items-center py-4 text-sm text-gray-500 font-medium">
          <span>7 / 10 trang</span>
          <div className="flex items-center gap-2">
            <button className="flex items-center hover:text-gray-900">
              <ChevronLeft size={16} /> Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-900 font-bold bg-white">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:text-gray-900">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:text-gray-900">
              3
            </button>
            <span className="px-1">...</span>
            <button className="flex items-center hover:text-gray-900">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, isAlert }) => (
  <div className="border border-gray-200 p-5 rounded-2xl relative bg-white">
    <div
      className={`absolute top-4 right-4 ${isAlert ? "text-yellow-400" : "text-gray-300"}`}
    >
      {icon}
    </div>
    <p className="text-sm font-bold text-gray-800 mb-1">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const FilterDropdown = ({ label }) => (
  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm min-w-[120px] text-gray-700 cursor-pointer hover:bg-gray-100">
    <span>{label}</span>
    <ChevronDown size={14} className="text-gray-400 ml-2" />
  </div>
);

export default ReportManagement;
