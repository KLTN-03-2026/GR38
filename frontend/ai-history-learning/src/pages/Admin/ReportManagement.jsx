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
  const [filterType, setFilterType] = useState("Loại báo cáo");
  const [filterStatus, setFilterStatus] = useState("Trạng thái");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // Thêm state để lưu số lượng tổng cho các thẻ thống kê
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    rejected: 0,
  });

  const itemsPerPage = 5;

  const parseDescription = (rawContent = "") => {
    const match = rawContent.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { title: match[1], desc: match[2] };
    }
    return { title: "Không có tiêu đề", desc: rawContent };
  };

  const ISSUE_TYPE_LABELS = {
    historical_fact: "Sai thông tin lịch sử",
    timeline: "Sai thời gian",
    inappropriate_behavior: "Hành vi không chuẩn mực",
    spam: "Spam",
    typo: "Lỗi tài liệu",
    other: "Khác",
  };

  const STATUS_LABELS = {
    pending: "Chưa xử lý",
    resolved: "Đã xử lý",
    rejected: "Từ chối",
  };

  const STATUS_FILTER_VALUES = {
    "Chưa xử lý": "pending",
    "Đã xử lý": "resolved",
    "Từ chối": "rejected",
  };

  const REPORT_CATEGORIES = [
    "Loại báo cáo",
    ...Object.values(ISSUE_TYPE_LABELS),
  ];

  // Hàm lấy số liệu thống kê tổng (không phân trang)
  const fetchAllStats = async () => {
    try {
      // Gọi API với limit lớn để lấy toàn bộ dữ liệu phục vụ đếm số lượng
      const response = await api.get(`/reports?limit=9999`);
      if (response.data.success) {
        const allData = response.data.data;
        setStats({
          pending: allData.filter((r) => r.status === "pending").length,
          resolved: allData.filter((r) => r.status === "resolved").length,
          rejected: allData.filter((r) => r.status === "rejected").length,
        });
      }
    } catch (err) {
      console.error("Lỗi khi lấy thống kê:", err);
    }
  };

  const fetchReports = async (page = 1, statusFilter = "") => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page, limit: itemsPerPage });
      if (statusFilter && statusFilter !== "Trạng thái") {
        const statusValue = STATUS_FILTER_VALUES[statusFilter];
        if (statusValue) params.append("status", statusValue);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, filterStatus);
    fetchAllStats(); // Cập nhật số liệu thống kê mỗi khi trạng thái lọc thay đổi
  }, [filterStatus]);

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const typeLabel = ISSUE_TYPE_LABELS[item.issueType] || "Khác";
      const { title, desc } = parseDescription(item.description);
      const matchSearch =
        item.reporterId?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        typeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType =
        filterType === "Loại báo cáo" || typeLabel === filterType;
      return matchSearch && matchType;
    });
  }, [reports, searchQuery, filterType]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await api.patch(`/reports/${reportId}/status`, {
        status: newStatus,
        adminNotes: "Cập nhật từ hệ thống quản lý",
      });
      Swal.fire("Thành công!", "Đã cập nhật trạng thái báo cáo.", "success");
      fetchReports(currentPage, filterStatus);
      fetchAllStats();
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể cập nhật trạng thái.", "error");
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => fetchReports(i, filterStatus)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
            currentPage === i
              ? "bg-[#F26739] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-[#F26739]"
          }`}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  if (viewingReport) {
    return (
      <ReportDetail
        report={viewingReport}
        onBack={() => setViewingReport(null)}
        onRefresh={() => {
          fetchReports(currentPage, filterStatus);
          fetchAllStats();
        }}
      />
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen font-['Inter']">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">
        Quản lý báo cáo
      </h1>
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
              placeholder="Lọc theo tên người gửi, tiêu đề hoặc nội dung..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterDropdown
            label={filterType}
            options={REPORT_CATEGORIES}
            onSelect={setFilterType}
          />
          <FilterDropdown
            label={filterStatus}
            options={["Trạng thái", "Chưa xử lý", "Đã xử lý", "Từ chối"]}
            onSelect={setFilterStatus}
          />
        </div>

        {/* CÁC THẺ THỐNG KÊ HIỂN THỊ SỐ LIỆU TỔNG */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Tổng sự cố"
            value={totalReports}
            icon={<Info size={16} />}
          />
          <StatCard
            label="Đã xử lý"
            value={stats.resolved}
            icon={<Wrench size={16} />}
          />
          <StatCard
            label="Chưa xử lý"
            value={stats.pending}
            icon={<ClipboardList size={16} />}
          />
          <StatCard
            label="Từ chối"
            value={stats.rejected}
            icon={<AlertCircle size={16} />}
            isAlert
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Danh sách yêu cầu báo cáo
        </h2>
        <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-b border-gray-300 font-bold text-slate-700">
              <tr>
                <th className="px-4 py-4 border-r border-gray-200 w-24 text-center">
                  Mã
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Người gửi
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Ngày gửi
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Loại sự cố
                </th>
                <th className="px-4 py-4 border-r border-gray-200 text-center">
                  Tiêu đề
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
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Không tìm thấy dữ liệu.
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
                    <td className="px-4 py-4 border-r border-gray-200 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-100">
                        {ISSUE_TYPE_LABELS[report.issueType] || "Khác"}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200 text-center font-medium text-slate-700 truncate max-w-[250px]">
                      {parseDescription(report.description).title}
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-[10px] font-bold inline-block w-24 uppercase shadow-sm ${
                          report.status === "pending"
                            ? "bg-red-100 text-red-700"
                            : report.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {STATUS_LABELS[report.status] || report.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewingReport(report)}
                          className="p-1.5 border border-gray-300 rounded hover:border-[#F26739] hover:text-[#F26739] shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center py-4 text-sm text-gray-500 font-medium">
          <span>
            Hiển thị {filteredReports.length} / {totalReports} báo cáo
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchReports(currentPage - 1, filterStatus)}
              className="p-2 border border-gray-200 rounded-md bg-white disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">{renderPageNumbers()}</div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchReports(currentPage + 1, filterStatus)}
              className="p-2 border border-gray-200 rounded-md bg-white disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, isAlert }) => (
  <div className="border border-gray-200 p-5 rounded-2xl relative bg-white hover:shadow-md transition-all">
    <div
      className={`absolute top-4 right-4 ${isAlert ? "text-red-400" : "text-gray-300"}`}
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
        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm min-w-[160px] text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
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
