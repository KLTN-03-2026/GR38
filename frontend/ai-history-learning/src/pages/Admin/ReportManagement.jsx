import React, { useState, useMemo } from "react";
import ReportDetail from "../../components/Modal/Admin/ReportDetail";
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
import Swal from "sweetalert2";

const ReportManagement = () => {
  const [reportData, setReportData] = useState([
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
  ]);

  const [viewingReport, setViewingReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("Loại sự cố");
  const [filterStatus, setFilterStatus] = useState("Trạng thái");

  // --- LOGIC XỬ LÝ DỮ LIỆU ---
  const filteredReports = useMemo(() => {
    return reportData.filter((item) => {
      const matchSearch =
        item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === "Loại sự cố" || item.type === filterType;
      const matchStatus =
        filterStatus === "Trạng thái" || item.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [reportData, searchQuery, filterType, filterStatus]);

  // --- CÁC HÀM THAO TÁC ---
  const handleDelete = (id) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Báo cáo này sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setReportData(reportData.filter((r) => r.id !== id));
        Swal.fire("Đã xóa!", "Báo cáo đã được loại bỏ.", "success");
      }
    });
  };

  const handleViewDetail = (item) => {
    // Chuyển đổi format dữ liệu để khớp với ReportDetail.jsx
    const formattedReport = {
      id: item.id.toString(),
      projectName: "HỆ THỐNG HỖ TRỢ HỌC TẬP LỊCH SỬ VIỆT NAM",
      user: {
        id: item.id,
        name: item.user,
        date: item.date,
        role: "Người dùng hệ thống",
      },
      issues: [
        { stt: 1, content: item.content, type: item.type, status: item.status },
      ],
    };
    setViewingReport(formattedReport);
  };

  // --- GIAO DIỆN ---
  if (viewingReport) {
    return (
      <ReportDetail
        report={viewingReport}
        onBack={() => setViewingReport(null)}
      />
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen font-['Inter']">
      <h1 className="text-2xl font-bold mb-6">Quản lý báo cáo</h1>

      {/* Tìm kiếm và Lọc */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">
          Tìm kiếm và lọc
        </h2>
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Lọc theo tên người gửi hoặc nội dung..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-[#F26739] text-white px-8 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm">
            Tìm
          </button>

          <FilterDropdown
            label={filterType}
            options={["Loại sự cố", "Lỗi Website", "Lỗi AI"]}
            onSelect={setFilterType}
          />
          <FilterDropdown
            label={filterStatus}
            options={["Trạng thái", "Chưa xử lý", "Đang xử lý", "Đã xử lý"]}
            onSelect={setFilterStatus}
          />
        </div>

        {/* Thống kê (Giữ nguyên số liệu bạn yêu cầu) */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Tổng sự cố" value="175" icon={<Info size={16} />} />
          <StatCard label="Đang xử lý" value="70" icon={<Wrench size={16} />} />
          <StatCard
            label="Chưa xử lý"
            value="100"
            icon={<ClipboardList size={16} />}
          />
          <StatCard
            label="Sự cố nghiêm trọng"
            value="0"
            icon={<AlertCircle size={16} />}
            isAlert
          />
        </div>
      </div>

      {/* Danh sách yêu cầu */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Danh sách yêu cầu báo cáo
        </h2>
        <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-b border-gray-300 font-bold text-slate-700">
              <tr>
                <th className="px-4 py-4 border-r border-gray-200 w-24 text-center">
                  Mã yêu cầu
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Tên tài khoản
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Ngày gửi
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Nội dung yêu cầu
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Loại sự cố
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Trạng thái
                </th>
                <th className="px-4 py-4 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-4 font-bold border-r border-gray-200 text-center">
                    {item.id}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center font-medium">
                    {item.user}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center text-slate-500">
                    {item.date}
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center italic text-slate-600">
                    "{item.content}"
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200 text-center">
                    <span
                      className={`${item.color} text-white px-3 py-1 rounded-md text-[10px] font-bold inline-block w-24 uppercase shadow-sm`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="p-1.5 border border-gray-300 rounded hover:bg-orange-50 hover:border-[#F26739] text-slate-600 hover:text-[#F26739] transition-all shadow-sm"
                        title="Xem chi tiết"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 border border-gray-300 rounded hover:bg-red-50 hover:border-red-500 text-slate-600 hover:text-red-500 transition-all shadow-sm"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              Không tìm thấy báo cáo nào phù hợp.
            </div>
          )}
        </div>

        {/* Phân trang (Giữ nguyên UI của bạn) */}
        <div className="flex justify-between items-center py-4 text-sm text-gray-500 font-medium">
          <span>
            {filteredReports.length} / {reportData.length} kết quả
          </span>
          <div className="flex items-center gap-2">
            <button className="flex items-center hover:text-gray-900 transition-colors">
              <ChevronLeft size={16} /> Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#F26739] rounded-md text-[#F26739] font-bold bg-orange-50">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:text-gray-900">
              2
            </button>
            <span className="px-1">...</span>
            <button className="flex items-center hover:text-gray-900 transition-colors">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CON (Helper Components) ---

const StatCard = ({ label, value, icon, isAlert }) => (
  <div className="border border-gray-200 p-5 rounded-2xl relative bg-white hover:shadow-md transition-shadow">
    <div
      className={`absolute top-4 right-4 ${isAlert ? "text-yellow-400" : "text-gray-300"}`}
    >
      {icon}
    </div>
    <p className="text-sm font-bold text-gray-500 mb-1">{label}</p>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const FilterDropdown = ({ label, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm min-w-[140px] text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt}
              className="px-4 py-2 text-sm hover:bg-orange-50 hover:text-[#F26739] cursor-pointer"
              onClick={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
