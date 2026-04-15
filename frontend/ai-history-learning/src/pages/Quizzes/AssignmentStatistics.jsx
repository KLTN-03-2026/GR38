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

const STATUS_CONFIG = {
  "Chưa làm bài": {
    bg: "#FCEBEB",
    color: "#A32D2D",
    dot: "#E24B4A",
  },
  "Đã làm bài": {
    bg: "#EAF3DE",
    color: "#3B6D11",
    dot: "#639922",
  },
  "Đang làm": {
    bg: "#FAEEDA",
    color: "#854F0B",
    dot: "#BA7517",
  },
};

const STATS = [
  { label: "Tổng người đọc",       value: 108, icon: "users",   accent: "#185FA5", bg: "#E6F1FB" },
  { label: "Đã làm bài kiểm tra",  value: 70,  icon: "check",   accent: "#3B6D11", bg: "#EAF3DE" },
  { label: "Chưa làm bài",         value: 2,   icon: "x",       accent: "#A32D2D", bg: "#FCEBEB" },
  { label: "Đang làm",             value: 5,   icon: "clock",   accent: "#854F0B", bg: "#FAEEDA" },
];

const ICON_PATHS = {
  users:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  check:  <><polyline points="20 6 9 17 4 12"/></>,
  x:      <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  clock:  <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  edit:   <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:  <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></>,
  warn:   <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
};

const Icon = ({ name, size = 16, color = "currentColor" }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {ICON_PATHS[name]}
  </svg>
);

export default function AssignmentStatistics() {
  const [data, setData]                 = useState(initialData);
  const [search, setSearch]             = useState("");
  const [filterScore, setFilterScore]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editRow, setEditRow]           = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [deleteRow, setDeleteRow]       = useState(null);

  // ── logic giữ nguyên từ code gốc ──────────────────────────────────────────
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
    const score = parseFloat(row.diem);
    let matchScore = true;
    if (filterScore === "0-5")  matchScore = score >= 0 && score < 5;
    if (filterScore === "5-8")  matchScore = score >= 5 && score < 8;
    if (filterScore === "8-10") matchScore = score >= 8 && score <= 10;
    return matchSearch && matchStatus && matchScore;
  });
  // ──────────────────────────────────────────────────────────────────────────

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status];
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: cfg.bg,
        color: cfg.color,
      }}>
        <span style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }} />
        {status}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>
          Thống kê bài làm
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          Theo dõi tiến độ làm bài của người đọc
        </p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}>
        {STATS.map((stat) => (
          <div key={stat.label} style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: "14px 16px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{stat.label}</span>
              <span style={{
                width: 32, height: 32,
                borderRadius: 8,
                background: stat.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon name={stat.icon} size={15} color={stat.accent} />
              </span>
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Tìm kiếm & lọc
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
              <Icon name="search" size={14} color="#9CA3AF" />
            </span>
            <input
              type="text"
              placeholder="Lọc theo tên bài làm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                paddingLeft: 34,
                paddingRight: 12,
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 13,
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            style={selectStyle}
          >
            <option value="">Lọc theo điểm</option>
            <option value="0-5">0 – 5 điểm</option>
            <option value="5-8">5 – 8 điểm</option>
            <option value="8-10">8 – 10 điểm</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={selectStyle}
          >
            <option value="">Trạng thái</option>
            <option value="Đã làm bài">Đã làm bài</option>
            <option value="Chưa làm bài">Chưa làm bài</option>
            <option value="Đang làm">Đang làm</option>
          </select>

          <button style={btnPrimary}>Tìm kiếm</button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>Danh sách bài làm</h2>
          <span style={{ fontSize: 12, color: "#6B7280" }}>
            {filtered.length} bài / {data.length} tổng
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Mã", "Tên bài làm", "Ngày làm", "Số lượng người đọc", "Điểm trung bình", "Trạng thái", "Thao tác"].map((h, i) => (
                <th key={h} style={{
                  padding: "10px 14px",
                  textAlign: i >= 3 ? "center" : "left",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                  borderBottom: "1px solid #E5E7EB",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                  Không tìm thấy bài làm phù hợp
                </td>
              </tr>
            )}
            {filtered.map((row, index) => (
              <tr
                key={row.ma}
                style={{
                  borderBottom: index !== filtered.length - 1 ? "1px solid #F3F4F6" : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 14px", color: "#9CA3AF", fontWeight: 500 }}>#{row.ma}</td>
                <td style={{ padding: "12px 14px", color: "#111827", fontWeight: 500, maxWidth: 240 }}>
                  {row.ten}
                </td>
                <td style={{ padding: "12px 14px", color: "#6B7280" }}>{row.ngay}</td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 13, color: "#374151",
                  }}>
                    <Icon name="users" size={13} color="#9CA3AF" />
                    {row.sl}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    background: parseFloat(row.diem) >= 8 ? "#EAF3DE"
                              : parseFloat(row.diem) >= 5 ? "#FAEEDA"
                              : "#FCEBEB",
                    color: parseFloat(row.diem) >= 8 ? "#3B6D11"
                         : parseFloat(row.diem) >= 5 ? "#854F0B"
                         : "#A32D2D",
                  }}>
                    {row.diem}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <StatusBadge status={row.tt} />
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <button
                      onClick={() => handleEditOpen(row)}
                      title="Sửa"
                      style={iconBtn()}
                      onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                    >
                      <Icon name="edit" size={13} color="#3B82F6" />
                    </button>
                    <button
                      onClick={() => setDeleteRow(row)}
                      title="Xóa"
                      style={iconBtn()}
                      onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                    >
                      <Icon name="trash" size={13} color="#EF4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          borderTop: "1px solid #F3F4F6",
        }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>1 / 10 trang</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["‹", "1", "2", "3", "…", "›"].map((p, i) => (
              <button key={i} style={{
                height: 30, minWidth: 30, padding: "0 8px",
                border: `1px solid ${p === "1" ? "#F26739" : "#E5E7EB"}`,
                borderRadius: 6,
                fontSize: 12,
                background: p === "1" ? "#F26739" : "transparent",
                color: p === "1" ? "#fff" : "#374151",
                cursor: "pointer",
              }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────── */}
      {editRow && (
        <div style={backdropStyle}>
          <div style={modalStyle}>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>Chỉnh sửa bài làm</h3>
              <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>Cập nhật thông tin bài làm</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Tên bài làm</label>
                <input
                  type="text"
                  value={editForm.ten}
                  onChange={(e) => setEditForm({ ...editForm, ten: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Ngày làm</label>
                <input
                  type="text"
                  value={editForm.ngay}
                  onChange={(e) => setEditForm({ ...editForm, ngay: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Trạng thái</label>
                <select
                  value={editForm.tt}
                  onChange={(e) => setEditForm({ ...editForm, tt: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Đã làm bài">Đã làm bài</option>
                  <option value="Chưa làm bài">Chưa làm bài</option>
                  <option value="Đang làm">Đang làm</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button onClick={() => setEditRow(null)} style={btnSecondary}>Hủy</button>
              <button onClick={handleEditSave} style={btnPrimary}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ────────────────────────────────────────────── */}
      {deleteRow && (
        <div style={backdropStyle}>
          <div style={{ ...modalStyle, maxWidth: 380, textAlign: "center" }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: "50%",
              background: "#FEF2F2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <Icon name="warn" size={22} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Xác nhận xóa</h3>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
              Bạn có chắc muốn xóa bài làm{" "}
              <strong style={{ color: "#111827" }}>"{deleteRow.ten}"</strong> không?
              Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteRow(null)} style={{ ...btnSecondary, flex: 1, justifyContent: "center" }}>
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1, height: 38,
                  background: "#EF4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Xóa bài làm
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