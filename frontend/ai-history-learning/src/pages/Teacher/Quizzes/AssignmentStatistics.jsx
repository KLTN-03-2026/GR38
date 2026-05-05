import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "../../../lib/api";

const STATUS_CONFIG = {
  "Chưa làm bài": { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  "Đã làm bài":   { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  "Đang làm":     { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
};

// ─── Custom Select ──────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`custom-select-btn${open ? " open" : ""}`}
      >
        {selected?.dot && (
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: selected.dot, flexShrink: 0, display: "inline-block" }} />
        )}
        <span style={{ flex: 1, textAlign: "left" }}>{selected ? selected.label : placeholder}</span>
        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ flexShrink: 0, color: "#9CA3AF", transition: "transform 0.18s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="custom-select-menu">
          {options.map((opt) => (
            <button key={opt.value} type="button"
              className={`custom-select-option${value === opt.value ? " selected" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}>
              {opt.dot
                ? <span style={{ width: 7, height: 7, borderRadius: "50%", background: opt.dot, flexShrink: 0, display: "inline-block" }} />
                : <span style={{ width: 7, display: "inline-block", flexShrink: 0 }} />}
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

// ─── Skeleton loader ────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[60, 200, 100, 100, 120, 110, 70].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{ height: 14, width: w, borderRadius: 6, background: "#F3F4F6", animation: "pulse 1.4s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AssignmentStatistics() {
  const [data, setData]                 = useState([]);
  const [loading, setLoading]           = useState(true);

  const [search, setSearch]             = useState("");
  const [filterScore, setFilterScore]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editRow, setEditRow]           = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [deleteRow, setDeleteRow]       = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch dashboard ────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const dashRes = await api.get("/progress/dashboard");
      const payload = dashRes.data?.data ?? dashRes.data;
      const recent  = payload?.recent ?? {};
      const quizzes = recent.quizzes ?? [];

      const rows = quizzes.map((q) => ({
        ma:   q._id,
        ten:  q.title ?? "Không có tên",
        ngay: q.completedAt
          ? new Date(q.completedAt).toLocaleDateString("vi-VN")
          : "—",
        sl:   q.totalQuestions ?? "—",
        diem: q.score != null ? String(q.score) : "—",
        tt:   "Đã làm bài",
        documentTitle: q.documentId?.title ?? "—",
      }));

      setData(rows);
    } catch (err) {
      console.error(">>> [dashboard] ERROR:", err?.response?.data ?? err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── Edit ───────────────────────────────────────────────────────────────
  const handleEditOpen = (row) => { setEditRow(row); setEditForm({ ...row }); };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await api.put(`/progress/dashboard/${editForm.ma}`, {
        title:  editForm.ten,
        date:   editForm.ngay,
        status: editForm.tt,
      });
      setData((prev) => prev.map((r) => (r.ma === editForm.ma ? { ...editForm } : r)));
      setEditRow(null);
    } catch (err) {
      alert(err?.response?.data?.message ?? "Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/progress/dashboard/${deleteRow.ma}`);
      setData((prev) => prev.filter((r) => r.ma !== deleteRow.ma));
      setDeleteRow(null);
    } catch (err) {
      alert(err?.response?.data?.message ?? "Xóa thất bại, vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .stats-page { font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif; }
        .filter-bar {
          background: #fff; border: 1px solid #F3F4F6; border-radius: 14px;
          padding: 16px 20px; display: flex; gap: 10px; flex-wrap: wrap;
          align-items: center; position: relative; z-index: 10;
        }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
        .search-input {
          width: 100%; height: 38px; padding: 0 12px 0 36px;
          border: 1px solid #E5E7EB; border-radius: 9px; font-size: 13px;
          color: #374151; outline: none; transition: border-color 0.15s; background: #FAFAFA;
        }
        .search-input:focus { border-color: #F26739; background: #fff; }
        .custom-select-btn {
          height: 38px; padding: 0 12px; border: 1px solid #E5E7EB; border-radius: 9px;
          font-size: 13px; color: #374151; background: #FAFAFA; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px; min-width: 148px;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; white-space: nowrap;
        }
        .custom-select-btn:hover { border-color: #D1D5DB; background: #fff; }
        .custom-select-btn.open { border-color: #F26739; background: #fff; box-shadow: 0 0 0 3px rgba(242,103,57,0.1); }
        .custom-select-menu {
          position: absolute; top: calc(100% + 6px); left: 0; min-width: 100%;
          background: #fff; border: 1px solid #E5E7EB; border-radius: 11px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10); z-index: 9999; padding: 4px;
        }
        .custom-select-option {
          display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px;
          border: none; background: transparent; border-radius: 7px; font-size: 13px;
          color: #374151; cursor: pointer; text-align: left;
          transition: background 0.12s, color 0.12s; white-space: nowrap;
        }
        .custom-select-option:hover { background: #F9FAFB; color: #111827; }
        .custom-select-option.selected { color: #F26739; font-weight: 600; background: #FFF4EF; }
        .btn-primary {
          height: 38px; padding: 0 18px; background: #F26739; color: #fff; border: none;
          border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.15s, transform 0.1s; white-space: nowrap;
        }
        .btn-primary:hover { background: #e05525; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .table-wrapper { background: #fff; border: 1px solid #F3F4F6; border-radius: 14px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table thead th {
          padding: 11px 16px; font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase; color: #9CA3AF;
          background: #FAFAFA; border-bottom: 1px solid #F3F4F6; white-space: nowrap;
        }
        .data-table thead tr th:first-child { border-radius: 14px 0 0 0; }
        .data-table thead tr th:last-child  { border-radius: 0 14px 0 0; }
        .data-table tbody tr { border-bottom: 1px solid #F9FAFB; transition: background 0.12s; }
        .data-table tbody tr:last-child { border-bottom: none; }
        .data-table tbody tr:hover { background: #FAFAFA; }
        .data-table tbody td { padding: 12px 16px; font-size: 13px; color: #374151; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .action-btn {
          width: 30px; height: 30px; border-radius: 7px; border: 1px solid #E5E7EB;
          background: transparent; display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.14s; padding: 0;
        }
        .action-btn:hover { background: #EFF6FF; border-color: #BFDBFE; }
        .action-btn.danger:hover { background: #FEF2F2; border-color: #FECACA; }
        .action-btn svg { color: #9CA3AF; width: 14px; height: 14px; }
        .action-btn:hover svg { color: #3B82F6; }
        .action-btn.danger:hover svg { color: #EF4444; }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pagination-btn {
          height: 30px; min-width: 30px; padding: 0 8px; border: 1px solid #E5E7EB;
          border-radius: 7px; font-size: 12px; background: #fff; color: #6B7280;
          cursor: pointer; transition: all 0.13s;
        }
        .pagination-btn:hover { background: #F9FAFB; color: #111827; }
        .pagination-btn.active { background: #F26739; color: #fff; border-color: #F26739; font-weight: 600; }
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(3px);
        }
        .modal-box {
          background: #fff; border-radius: 16px; padding: 28px; width: 100%;
          box-sizing: border-box; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .modal-input {
          width: 100%; height: 40px; padding: 0 12px; border: 1px solid #E5E7EB;
          border-radius: 9px; font-size: 13px; color: #111827; outline: none;
          box-sizing: border-box; background: #FAFAFA; transition: border-color 0.15s;
        }
        .modal-input:focus { border-color: #F26739; background: #fff; }
        .modal-select {
          width: 100%; height: 40px; padding: 0 12px; border: 1px solid #E5E7EB;
          border-radius: 9px; font-size: 13px; color: #111827; outline: none;
          box-sizing: border-box; background: #FAFAFA;
        }
        .modal-label { display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px; letter-spacing: 0.02em; }
        .score-bar-wrap { height: 4px; background: #F3F4F6; border-radius: 2px; overflow: hidden; margin-top: 5px; width: 60px; }
        .score-bar { height: 100%; border-radius: 2px; background: #F26739; transition: width 0.3s; }
        .spinner {
          width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent;
          border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 48px 16px; gap: 10px;
        }
        .empty-state svg { color: #E5E7EB; }
        .empty-state p { font-size: 13px; color: #9CA3AF; margin: 0; }
        .empty-state span { font-size: 12px; color: #D1D5DB; }
      `}</style>

      <div className="stats-page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
              Thống kê bài làm
            </h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: "4px 0 0" }}>
              Quản lý và theo dõi tiến độ người học
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB", fontWeight: 500 }}
            onClick={fetchDashboard}
            disabled={loading}
          >
            {loading
              ? <><div className="spinner" style={{ borderColor: "#9CA3AF", borderTopColor: "transparent" }} /> Đang tải...</>
              : <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Làm mới
                </>
            }
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          <div className="search-wrap">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input
              type="text" className="search-input"
              placeholder="Tìm kiếm tên bài làm..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <CustomSelect
            value={filterScore} onChange={setFilterScore} placeholder="Lọc theo điểm"
            options={[
              { value: "",     label: "Tất cả điểm" },
              { value: "0-5",  label: "Điểm 0 – 5",  dot: "#EF4444" },
              { value: "5-8",  label: "Điểm 5 – 8",  dot: "#F59E0B" },
              { value: "8-10", label: "Điểm 8 – 10", dot: "#22C55E" },
            ]}
          />

          <CustomSelect
            value={filterStatus} onChange={setFilterStatus} placeholder="Trạng thái"
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

        {/* Table */}
        <div className="table-wrapper">
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>
              Danh sách bài làm
              <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 500, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: 20 }}>
                {loading ? "..." : `${filtered.length} bài`}
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
              {loading && [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}

              {!loading && filtered.map((row) => {
                const cfg = STATUS_CONFIG[row.tt] ?? STATUS_CONFIG["Chưa làm bài"];
                const scoreNum = parseFloat(row.diem);
                const scorePct = isNaN(scoreNum) ? 0 : (scoreNum / 10) * 100;
                return (
                  <tr key={row.ma}>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", fontVariantNumeric: "tabular-nums" }}>
                        #{row.ma}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 500, color: "#111827" }}>{row.ten}</span></td>
                    <td style={{ color: "#9CA3AF", fontSize: 12.5 }}>{row.ngay}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 13, color: "#374151", fontVariantNumeric: "tabular-nums" }}>{row.sl}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: scoreNum >= 8 ? "#16A34A" : scoreNum >= 5 ? "#D97706" : "#DC2626" }}>
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

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
                      </svg>
                      <p>
                        {data.length === 0
                          ? "Chưa có dữ liệu thống kê Người học"
                          : "Không tìm thấy bài làm nào"}
                      </p>
                      {data.length === 0 && (
                        <span>Dữ liệu sẽ xuất hiện khi Người học hoàn thành bài làm</span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              Hiển thị {loading ? "..." : filtered.length} / {loading ? "..." : data.length} bài làm
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {["‹", "1", "2", "3", "…", "›"].map((p, i) => (
                <button key={i} className={`pagination-btn${p === "1" ? " active" : ""}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {editRow && (
        <div className="modal-backdrop" onClick={() => !saving && setEditRow(null)}>
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
                disabled={saving}
                style={{ height: 38, padding: "0 18px", border: "1px solid #E5E7EB", borderRadius: 9, fontSize: 13, fontWeight: 500, color: "#6B7280", background: "#fff", cursor: "pointer" }}
              >
                Hủy
              </button>
              <button onClick={handleEditSave} disabled={saving} className="btn-primary">
                {saving ? <><div className="spinner" /> Đang lưu...</> : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ────────────────────────────────────────────────────── */}
      {deleteRow && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteRow(null)}>
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
                  disabled={deleting}
                  style={{ flex: 1, height: 40, border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#6B7280", background: "#fff", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  style={{ flex: 1, height: 40, background: deleting ? "#FCA5A5" : "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {deleting ? <><div className="spinner" /> Đang xóa...</> : "Xóa bài làm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}