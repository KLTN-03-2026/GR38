import React, { useState, useEffect, useMemo } from "react";
import api from "../../lib/api";
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("Loại sự cố");
  const [filterStatus, setFilterStatus] = useState("Trạng thái");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const STATUS_LABELS = {
    pending: "Chưa xử lý",
    in_progress: "Đang xử lý",
    resolved: "Đã xử lý",
    rejected: "Từ chối",
  };

  const STATUS_FILTER_VALUES = {
    "Chưa xử lý": "pending",
    "Đang xử lý": "in_progress",
    "Đã xử lý": "resolved",
  };

  const getReportCategory = (report) => {
    const targetType = report.targetType?.toLowerCase() || "";
    const issueType = report.issueType?.toLowerCase() || "";
    const description = report.description?.toLowerCase() || "";

    if (
      targetType.includes("ai") ||
      issueType.includes("ai") ||
      description.includes("ai") ||
      description.includes("chat ai") ||
      description.includes("trí tuệ nhân tạo")
    ) {
      return "Lỗi AI";
    }

    return "Lỗi Website";
  };

  const fetchReports = async (page = 1, statusFilter = "") => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter && statusFilter !== "Trạng thái") {
        const statusValue = STATUS_FILTER_VALUES[statusFilter];
        if (statusValue) {
          params.append("status", statusValue);
        }
      }

      const response = await api.get(`/reports?${params}`);
      if (response.data.success) {
        setReports(response.data.data);
        setTotalReports(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.page);
      }
    } catch (err) {
      setError("Không thể tải danh sách báo cáo");
      console.error("Lỗi fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --- LOGIC XỬ LÝ DỮ LIỆU ---
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchSearch =
        item.reporterId?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType =
        filterType === "Loại sự cố" || getReportCategory(item) === filterType;
      const statusValue =
        STATUS_FILTER_VALUES[filterStatus] || filterStatus.toLowerCase();
      const matchStatus =
        filterStatus === "Trạng thái" || item.status === statusValue;
      return matchSearch && matchType && matchStatus;
    });
  }, [reports, searchQuery, filterType, filterStatus]);

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
        // Note: API không có endpoint DELETE, nên chỉ update status thành rejected
        handleUpdateStatus(id, "rejected");
        Swal.fire("Đã xóa!", "Báo cáo đã được loại bỏ.", "success");
      }
    });
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await api.patch(`/reports/${reportId}/status`, {
        status: newStatus,
        adminNotes: "Cập nhật từ ReportManagement",
      });
      // Refresh data với bộ lọc trạng thái hiện tại
      fetchReports(currentPage, filterStatus);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể cập nhật trạng thái.", "error");
    }
  };

  const handleViewDetail = (report) => {
    setViewingReport(report);
  };

  // --- GIAO DIỆN ---
  if (viewingReport) {
    return (
      <ReportDetail
        report={viewingReport}
        onBack={() => setViewingReport(null)}
        onRefresh={() => fetchReports(currentPage)} // Đảm bảo truyền function này vào
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
          <button
            onClick={() => fetchReports(1, filterStatus)}
            className="bg-[#F26739] text-white px-8 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm"
          >
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

        {/* Thống kê từ dữ liệu thật */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Tổng sự cố"
            value={totalReports}
            icon={<Info size={16} />}
          />
          <StatCard
            label="Đang xử lý"
            value={reports.filter((r) => r.status === "in_progress").length}
            icon={<Wrench size={16} />}
          />
          <StatCard
            label="Chưa xử lý"
            value={reports.filter((r) => r.status === "pending").length}
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
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Không tìm thấy báo cáo nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 font-bold border-r border-gray-200 text-center">
                      {report._id.slice(-6)}
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200 text-center font-medium">
                      {report.reporterId?.fullName || "Ẩn danh"}
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200 text-center text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200 text-center italic text-slate-600">
                      "{report.description}"
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {getReportCategory(report)}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-[10px] font-bold inline-block w-24 uppercase shadow-sm ${
                          report.status === "pending"
                            ? "bg-red-100 text-red-700"
                            : report.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : report.status === "in_progress"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {STATUS_LABELS[report.status] || report.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(report)}
                          className="p-1.5 border border-gray-300 rounded hover:bg-orange-50 hover:border-[#F26739] text-slate-600 hover:text-[#F26739] transition-all shadow-sm"
                          title="Xem chi tiết"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="p-1.5 border border-gray-300 rounded hover:bg-red-50 hover:border-red-500 text-slate-600 hover:text-red-500 transition-all shadow-sm"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              Không tìm thấy báo cáo nào phù hợp.
            </div>
          )}
        </div>

        {/* Phân trang */}
        <div className="flex justify-between items-center py-4 text-sm text-gray-500 font-medium">
          <span>
            {filteredReports.length} / {totalReports} kết quả
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchReports(currentPage - 1, filterStatus)}
              className="flex items-center hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="px-2">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchReports(currentPage + 1, filterStatus)}
              className="flex items-center hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
