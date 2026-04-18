import React, { useState, useRef, useEffect } from "react";

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
  "Chưa làm bài": { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  "Đã làm bài":   { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  "Đang làm":     { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
};

const STATS = [
  {
    label: "Tổng học sinh",
    value: 108,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    accent: "#F26739",
    lightBg: "#FFF4EF",
  },
  {
    label: "Đã làm bài kiểm tra",
    value: 70,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "#16A34A",
    lightBg: "#F0FDF4",
  },
  {
    label: "Chưa làm bài",
    value: 2,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    accent: "#DC2626",
    lightBg: "#FEF2F2",
  },
  {
    label: "Đang làm",
    value: 5,
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "#D97706",
    lightBg: "#FFFBEB",
  },
];

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);

  // Chỉ đóng khi click ra ngoài component
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`custom-select-btn${open ? " open" : ""}`}
      >
        {selected?.dot && (
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: selected.dot, flexShrink: 0, display: "inline-block" }} />
        )}
        <span style={{ flex: 1, textAlign: "left" }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{
            flexShrink: 0,
            color: "#9CA3AF",
            transition: "transform 0.18s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Menu chỉ render khi open === true ── */}
      {open && (
        <div className="custom-select-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-select-option${value === opt.value ? " selected" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.dot ? (
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: opt.dot, flexShrink: 0, display: "inline-block" }} />
              ) : (
                <span style={{ width: 7, display: "inline-block", flexShrink: 0 }} />
              )}
              <span>{opt.label}</span>
              {value === opt.value && (
                <svg width="13" height="13" fill="none" stroke="#F26739" viewBox="0 0 24 24" style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AssignmentStatistics() {
  const [data, setData]                 = useState(initialData);
  const [search, setSearch]             = useState("");
  const [filterScore, setFilterScore]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editRow, setEditRow]           = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [deleteRow, setDeleteRow]       = useState(null);

  const handleEditOpen = (row) => { setEditRow(row); setEditForm({ ...row }); };
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

  return (
    <>
      <style>{`
        .stats-page { font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif; }
        .stat-card {
          background: #fff;
          border: 1px solid #F3F4F6;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: box-shadow 0.18s ease, transform 0.18s ease;
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          transform: translateY(-1px);
        }
        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .filter-bar {
          background: #fff;
          border: 1px solid #F3F4F6;
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          /* z-index cao hơn table để dropdown không bị che */
          position: relative;
          z-index: 10;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .search-wrap svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          height: 38px;
          padding: 0 12px 0 36px;
          border: 1px solid #E5E7EB;
          border-radius: 9px;
          font-size: 13px;
          color: #374151;
          outline: none;
          transition: border-color 0.15s;
          background: #FAFAFA;
        }
        .search-input:focus { border-color: #F26739; background: #fff; }
        .custom-select-btn {
          height: 38px;
          padding: 0 12px;
          border: 1px solid #E5E7EB;
          border-radius: 9px;
          font-size: 13px;
          color: #374151;
          background: #FAFAFA;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-width: 148px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          white-space: nowrap;
        }
        .custom-select-btn:hover {
          border-color: #D1D5DB;
          background: #fff;
        }
        .custom-select-btn.open {
          border-color: #F26739;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(242,103,57,0.1);
        }
        .custom-select-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 100%;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 11px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          /* Đảm bảo luôn hiện trên mọi thứ */
          z-index: 9999;
          padding: 4px;
        }
        .custom-select-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          background: transparent;
          border-radius: 7px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s ease, color 0.12s ease;
          white-space: nowrap;
        }
        .custom-select-option:hover { background: #F9FAFB; color: #111827; }
        .custom-select-option.selected { color: #F26739; font-weight: 600; background: #FFF4EF; }
        .btn-primary {
          height: 38px;
          padding: 0 18px;
          background: #F26739;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #e05525; transform: translateY(-1px); }
        /* Bỏ overflow:hidden khỏi table wrapper để dropdown không bị cắt */
        .table-wrapper {
          background: #fff;
          border: 1px solid #F3F4F6;
          border-radius: 14px;
        }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table thead th {
          padding: 11px 16px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #9CA3AF;
          background: #FAFAFA;
          border-bottom: 1px solid #F3F4F6;
          white-space: nowrap;
        }
        .data-table thead tr th:first-child { border-radius: 14px 0 0 0; }
        .data-table thead tr th:last-child  { border-radius: 0 14px 0 0; }
        .data-table tbody tr {
          border-bottom: 1px solid #F9FAFB;
          transition: background 0.12s;
        }
        .data-table tbody tr:last-child { border-bottom: none; }
        .data-table tbody tr:hover { background: #FAFAFA; }
        .data-table tbody td {
          padding: 12px 16px;
          font-size: 13px;
          color: #374151;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          white-space: nowrap;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .action-btn {
          width: 30px; height: 30px;
          border-radius: 7px;
          border: 1px solid #E5E7EB;
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.14s;
          padding: 0;
        }
        .action-btn:hover { background: #EFF6FF; border-color: #BFDBFE; }
        .action-btn.danger:hover { background: #FEF2F2; border-color: #FECACA; }
        .action-btn svg { color: #9CA3AF; width: 14px; height: 14px; }
        .action-btn:hover svg { color: #3B82F6; }
        .action-btn.danger:hover svg { color: #EF4444; }
        .pagination-btn {
          height: 30px;
          min-width: 30px;
          padding: 0 8px;
          border: 1px solid #E5E7EB;
          border-radius: 7px;
          font-size: 12px;
          background: #fff;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.13s;
        }
        .pagination-btn:hover { background: #F9FAFB; color: #111827; }
        .pagination-btn.active { background: #F26739; color: #fff; border-color: #F26739; font-weight: 600; }
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(3px);
        }
        .modal-box {
          background: #fff;
          border-radius: 16px;
          padding: 28px;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .modal-input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #E5E7EB;
          border-radius: 9px;
          font-size: 13px;
          color: #111827;
          outline: none;
          box-sizing: border-box;
          background: #FAFAFA;
          transition: border-color 0.15s;
        }
        .modal-input:focus { border-color: #F26739; background: #fff; }
        .modal-select {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #E5E7EB;
          border-radius: 9px;
          font-size: 13px;
          color: #111827;
          outline: none;
          box-sizing: border-box;
          background: #FAFAFA;
        }
        .modal-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }
        .score-bar-wrap {
          height: 4px;
          background: #F3F4F6;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 5px;
          width: 60px;
        }
        .score-bar {
          height: 100%;
          border-radius: 2px;
          background: #F26739;
          transition: width 0.3s;
        }
      `}</style>

      <div className="stats-page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
              Thống kê bài làm
            </h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: "4px 0 0" }}>
              Quản lý và theo dõi tiến độ học sinh
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon" style={{ background: s.lightBg }}>
                <span style={{ color: s.accent }}>{s.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "5px 0 0", lineHeight: 1.4 }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          <div className="search-wrap">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm tên bài làm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <CustomSelect
            value={filterScore}
            onChange={setFilterScore}
            placeholder="Lọc theo điểm"
            options={[
              { value: "",     label: "Tất cả điểm" },
              { value: "0-5",  label: "Điểm 0 – 5",  dot: "#EF4444" },
              { value: "5-8",  label: "Điểm 5 – 8",  dot: "#F59E0B" },
              { value: "8-10", label: "Điểm 8 – 10", dot: "#22C55E" },
            ]}
          />

          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Trạng thái"
            options={[
              { value: "",             label: "Tất cả trạng thái" },
              { value: "Đã làm bài",   label: "Đã làm bài",   dot: "#22C55E" },
              { value: "Chưa làm bài", label: "Chưa làm bài", dot: "#EF4444" },
              { value: "Đang làm",     label: "Đang làm",     dot: "#F59E0B" },
            ]}
          />

          {(search || filterScore || filterStatus) && (
            <button
              className="btn-primary"
              style={{ background: "#F3F4F6", color: "#6B7280", fontWeight: 500 }}
              onClick={() => { setSearch(""); setFilterScore(""); setFilterStatus(""); }}
            >
              Xoá lọc
            </button>
          )}
        </div>

        {/* Table — dùng class riêng, KHÔNG có overflow:hidden */}
        <div className="table-wrapper">
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>
              Danh sách bài làm
              <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 500, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: 20 }}>
                {filtered.length} bài
              </span>
            </p>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: 60 }}>Mã</th>
                <th style={{ textAlign: "left" }}>Tên bài làm</th>
                <th style={{ textAlign: "left", width: 110 }}>Ngày làm</th>
                <th style={{ textAlign: "center", width: 130 }}>Số lượng</th>
                <th style={{ textAlign: "left", width: 140 }}>Điểm TB</th>
                <th style={{ textAlign: "center", width: 130 }}>Trạng thái</th>
                <th style={{ textAlign: "center", width: 80 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const cfg = STATUS_CONFIG[row.tt];
                const scoreNum = parseFloat(row.diem);
                const scorePct = isNaN(scoreNum) ? 0 : (scoreNum / 10) * 100;
                return (
                  <tr key={row.ma}>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", fontVariantNumeric: "tabular-nums" }}>
                        #{row.ma}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: "#111827" }}>{row.ten}</span>
                    </td>
                    <td style={{ color: "#9CA3AF", fontSize: 12.5 }}>{row.ngay}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 13, color: "#374151", fontVariantNumeric: "tabular-nums" }}>{row.sl}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, color: scoreNum >= 8 ? "#16A34A" : scoreNum >= 5 ? "#D97706" : "#DC2626", fontSize: 13 }}>
                          {row.diem}
                        </span>
                        <div className="score-bar-wrap">
                          <div className="score-bar" style={{
                            width: `${scorePct}%`,
                            background: scoreNum >= 8 ? "#22C55E" : scoreNum >= 5 ? "#F59E0B" : "#EF4444"
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        <span className="status-dot" style={{ background: cfg.dot }} />
                        {row.tt}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button className="action-btn" title="Sửa" onClick={() => handleEditOpen(row)}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button className="action-btn danger" title="Xóa" onClick={() => setDeleteRow(row)}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#F87171" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 16px", color: "#9CA3AF", fontSize: 13 }}>
                    Không tìm thấy bài làm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>Hiển thị {filtered.length} / {data.length} bài làm</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["‹", "1", "2", "3", "…", "›"].map((p, i) => (
                <button key={i} className={`pagination-btn${p === "1" ? " active" : ""}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editRow && (
        <div className="modal-backdrop" onClick={() => setEditRow(null)}>
          <div className="modal-box" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Chỉnh sửa bài làm</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "2px 0 0" }}>Mã #{editRow.ma}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="modal-label">Tên bài làm</label>
                <input className="modal-input" type="text" value={editForm.ten}
                  onChange={(e) => setEditForm({ ...editForm, ten: e.target.value })} />
              </div>
              <div>
                <label className="modal-label">Ngày làm</label>
                <input className="modal-input" type="text" value={editForm.ngay}
                  onChange={(e) => setEditForm({ ...editForm, ngay: e.target.value })} />
              </div>
              <div>
                <label className="modal-label">Trạng thái</label>
                <select className="modal-select" value={editForm.tt}
                  onChange={(e) => setEditForm({ ...editForm, tt: e.target.value })}>
                  <option value="Đã làm bài">Đã làm bài</option>
                  <option value="Chưa làm bài">Chưa làm bài</option>
                  <option value="Đang làm">Đang làm</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 22, justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditRow(null)}
                style={{ height: 38, padding: "0 18px", border: "1px solid #E5E7EB", borderRadius: 9, fontSize: 13, fontWeight: 500, color: "#6B7280", background: "#fff", cursor: "pointer" }}
              >
                Hủy
              </button>
              <button
                onClick={handleEditSave}
                style={{ height: 38, padding: "0 18px", background: "#F26739", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteRow && (
        <div className="modal-backdrop" onClick={() => setDeleteRow(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="24" height="24" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Xác nhận xóa</p>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 22px", lineHeight: 1.6 }}>
                Bạn có chắc muốn xóa bài làm<br />
                <strong style={{ color: "#111827" }}>"{deleteRow.ten}"</strong> không?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setDeleteRow(null)}
                  style={{ flex: 1, height: 40, border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#6B7280", background: "#fff", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  style={{ flex: 1, height: 40, background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Xóa bài làm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}