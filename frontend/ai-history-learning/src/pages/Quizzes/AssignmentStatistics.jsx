import React, { useState } from "react";
const initialData = [
  { ma: 101, ten: "Trận chiến điện biên phủ",          ngay: "18/10/2004", sl: "0/108",   diem: "0/10",   tt: "Chưa làm bài" },
  { ma: 110, ten: "Chiến tranh giải phóng miền nam",    ngay: "12/01/2004", sl: "108/108", diem: "8.5/10", tt: "Đã làm bài"   },
  { ma: 220, ten: "Kháng chiến chống phát xít Nhật",    ngay: "17/09/2004", sl: "108/108", diem: "9/10",   tt: "Đã làm bài"   },
  { ma: 430, ten: "Nạn đói 1945",                       ngay: "24/10/2004", sl: "108/108", diem: "9/10",   tt: "Đã làm bài"   },
  { ma: 550, ten: "Bác hồ đọc bảng tuyên ngôn",         ngay: "19/12/2004", sl: "108/108", diem: "2/10",   tt: "Đã làm bài"   },
  { ma: 601, ten: "100 năm kháng chiến chống Pháp",     ngay: "16/03/2004", sl: "108/108", diem: "7.5/10", tt: "Đã làm bài"   },
  { ma: 602, ten: "Cuộc đời của chủ tịch Hồ Chí Minh", ngay: "18/10/2004", sl: "88/108",  diem: "0/10",   tt: "Đang làm"     },
];
const STATUS_STYLES = {
  "Chưa làm bài": "bg-red-100 text-red-700",
  "Đã làm bài":   "bg-green-100 text-green-700",
  "Đang làm":     "bg-amber-100 text-amber-700",
};
const STATS = [
  { label: "Tổng học sinh",       value: 108 },
  { label: "Đã làm bài kiểm tra", value: 70  },
  { label: "Chưa làm bài",        value: 2   },
  { label: "Đang làm",            value: 5   },
];
export default function AssignmentStatistics() {
  const [data, setData]                 = useState(initialData);
  const [search, setSearch]             = useState("");
  const [filterScore, setFilterScore]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editRow, setEditRow]     = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [deleteRow, setDeleteRow] = useState(null);
  const handleEditOpen = (row) => {
    setEditRow(row);
    setEditForm({ ...row });
  };
  const handleEditSave = () => {
    setData((prev) => prev.map((r) => (r.ma === editForm.ma ? { ...editForm } : r)));
    setEditRow(null);
  };
  const handleDeleteConfirm = () => {
    setData((prev) => prev.filter((r) => r.ma !== deleteRow.ma));
    setDeleteRow(null);
  };
  const filtered = data.filter((row) => {
    const matchSearch = row.ten.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? row.tt === filterStatus : true;

    // Lọc theo điểm
    const score = parseFloat(row.diem); // "8.5/10" -> 8.5
    let matchScore = true;
    if (filterScore === "0-5")  matchScore = score >= 0 && score < 5;
    if (filterScore === "5-8")  matchScore = score >= 5 && score < 8;
    if (filterScore === "8-10") matchScore = score >= 8 && score <= 10;
    return matchSearch && matchStatus && matchScore;
  });
  return (
    <div>
      <h1 className="text-xl font-medium text-gray-800 mb-5">Thống kê bài làm</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-500 mb-3">Tìm kiếm và lọc</p>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Lọc theo tên bài làm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
          <button className="h-9 px-4 bg-[#F26739] hover:bg-orange-600 text-white text-sm rounded-lg transition-colors">
            Tìm
          </button>
          <select value={filterScore} onChange={(e) => setFilterScore(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none">
            <option value="">Lọc theo điểm</option>
            <option value="0-5">0 – 5</option>
            <option value="5-8">5 – 8</option>
            <option value="8-10">8 – 10</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none">
            <option value="">Trạng thái</option>
            <option value="Đã làm bài">Đã làm bài</option>
            <option value="Chưa làm bài">Chưa làm bài</option>
            <option value="Đang làm">Đang làm</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-medium text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
      <h2 className="text-sm font-medium text-gray-800 mb-2">Danh sách bài làm</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="text-left px-4 py-3 border-b border-gray-200 w-16">Mã</th>
              <th className="text-left px-4 py-3 border-b border-gray-200">Tên bài làm</th>
              <th className="text-left px-4 py-3 border-b border-gray-200 w-28">Ngày làm</th>
              <th className="text-center px-4 py-3 border-b border-gray-200 w-32">Số lượng bài làm</th>
              <th className="text-center px-4 py-3 border-b border-gray-200 w-32">Điểm trung bình</th>
              <th className="text-center px-4 py-3 border-b border-gray-200 w-32">Trạng thái</th>
              <th className="text-center px-4 py-3 border-b border-gray-200 w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <tr key={row.ma} className={index !== filtered.length - 1 ? "border-b border-gray-100" : ""}>
                <td className="px-4 py-3 font-medium">{row.ma}</td>
                <td className="px-4 py-3">{row.ten}</td>
                <td className="px-4 py-3 text-gray-500">{row.ngay}</td>
                <td className="px-4 py-3 text-center">{row.sl}</td>
                <td className="px-4 py-3 text-center">{row.diem}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[row.tt]}`}>
                    {row.tt}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => handleEditOpen(row)}
                      className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-colors"
                      title="Sửa"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteRow(row)}
                      className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors"
                      title="Xóa"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">1 / 10 trang</span>
          <div className="flex gap-1 items-center">
            {["‹ Previous", "1", "2", "3", "…", "Next ›"].map((page, i) => (
              <button key={i}
                className={`h-7 min-w-[28px] px-2 border rounded text-xs transition-colors ${
                  page === "1"
                    ? "bg-[#F26739] text-white border-[#F26739]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-base font-medium text-gray-800 mb-4">Sửa bài làm</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tên bài làm</label>
                <input
                  type="text"
                  value={editForm.ten}
                  onChange={(e) => setEditForm({ ...editForm, ten: e.target.value })}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ngày làm</label>
                <input
                  type="text"
                  value={editForm.ngay}
                  onChange={(e) => setEditForm({ ...editForm, ngay: e.target.value })}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Trạng thái</label>
                <select
                  value={editForm.tt}
                  onChange={(e) => setEditForm({ ...editForm, tt: e.target.value })}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="Đã làm bài">Đã làm bài</option>
                  <option value="Chưa làm bài">Chưa làm bài</option>
                  <option value="Đang làm">Đang làm</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditRow(null)}
                className="h-9 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSave}
                className="h-9 px-4 bg-[#F26739] hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-800 text-center mb-1">Xác nhận xóa</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Bạn có chắc muốn xóa bài làm <span className="font-medium text-gray-700">"{deleteRow.ten}"</span> không?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteRow(null)}
                className="flex-1 h-9 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

// ── Shared style tokens ──────────────────────────────────────────────────────
const selectStyle = {
  height: 38,
  padding: "0 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 13,
  color: "#374151",
  background: "#fff",
  outline: "none",
  cursor: "pointer",
};

const btnPrimary = {
  height: 38,
  padding: "0 16px",
  background: "#F26739",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const btnSecondary = {
  height: 38,
  padding: "0 16px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const iconBtn = () => ({
  width: 30, height: 30,
  border: "1px solid #E5E7EB",
  borderRadius: 6,
  background: "transparent",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s",
  padding: 0,
});

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#6B7280",
  marginBottom: 5,
};

const inputStyle = {
  width: "100%",
  height: 38,
  padding: "0 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 13,
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};
const backdropStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.45)",
};
const modalStyle = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  padding: 24,
  width: "100%",
  maxWidth: 440,
  boxSizing: "border-box",
};

