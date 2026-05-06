import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "../../../lib/api";

const STATUS_CONFIG = {
  "Đã làm bài": { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
};

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
      <button type="button" onClick={() => setOpen((p) => !p)}
        className={`custom-select-btn${open ? " open" : ""}`}>
        {selected?.dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: selected.dot, flexShrink: 0, display: "inline-block" }} />}
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

function SkeletonRow() {
  return (
    <tr>
      {[200, 150, 110, 100, 140, 130].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{ height: 14, width: w, borderRadius: 6, background: "#F3F4F6", animation: "pulse 1.4s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

export default function AssignmentStatistics() {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterScore, setFilterScore] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/quizzes/statistics");
      const raw = res.data?.data ?? [];
      const rows = raw.map((q) => ({
        ma:          q._id,
        ten:         q.quizTitle    ?? "Không có tên",
        nguoiLam:    q.learnerName  ?? q.learnerEmail ?? "—",
        ngay:        q.createdAt ? new Date(q.createdAt).toLocaleDateString("vi-VN") : "—",
        sl:          q.totalQuestions ?? "—",
        diem:        q.score != null ? String(q.score) : "—",
      }));
      setData(rows);
    } catch (err) {
      console.error(">>> [statistics] ERROR:", err?.response?.data ?? err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter((row) => {
    const matchSearch = row.ten.toLowerCase().includes(search.toLowerCase()) ||
                        row.nguoiLam.toLowerCase().includes(search.toLowerCase());
    const score = parseFloat(row.diem);
    let matchScore = true;
    if (filterScore === "0-5")  matchScore = score >= 0 && score < 5;
    if (filterScore === "5-8")  matchScore = score >= 5 && score < 8;
    if (filterScore === "8-10") matchScore = score >= 8 && score <= 10;
    return matchSearch && matchScore;
  });

  return (
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stats-page { font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif; }
        .filter-bar { background: #fff; border: 1px solid #F3F4F6; border-radius: 14px; padding: 16px 20px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; position: relative; z-index: 10; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
        .search-input { width: 100%; height: 38px; padding: 0 12px 0 36px; border: 1px solid #E5E7EB; border-radius: 9px; font-size: 13px; color: #374151; outline: none; transition: border-color 0.15s; background: #FAFAFA; }
        .search-input:focus { border-color: #F26739; background: #fff; }
        .custom-select-btn { height: 38px; padding: 0 12px; border: 1px solid #E5E7EB; border-radius: 9px; font-size: 13px; color: #374151; background: #FAFAFA; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; min-width: 148px; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; white-space: nowrap; }
        .custom-select-btn:hover { border-color: #D1D5DB; background: #fff; }
        .custom-select-btn.open { border-color: #F26739; background: #fff; box-shadow: 0 0 0 3px rgba(242,103,57,0.1); }
        .custom-select-menu { position: absolute; top: calc(100% + 6px); left: 0; min-width: 100%; background: #fff; border: 1px solid #E5E7EB; border-radius: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.10); z-index: 9999; padding: 4px; }
        .custom-select-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px; border: none; background: transparent; border-radius: 7px; font-size: 13px; color: #374151; cursor: pointer; text-align: left; transition: background 0.12s, color 0.12s; white-space: nowrap; }
        .custom-select-option:hover { background: #F9FAFB; color: #111827; }
        .custom-select-option.selected { color: #F26739; font-weight: 600; background: #FFF4EF; }
        .btn-refresh { height: 38px; padding: 0 18px; background: #F9FAFB; color: #374151; border: 1px solid #E5E7EB; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s; white-space: nowrap; }
        .btn-refresh:hover { background: #F3F4F6; }
        .btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }
        .table-wrapper { background: #fff; border: 1px solid #F3F4F6; border-radius: 14px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table thead th { padding: 11px 16px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #9CA3AF; background: #FAFAFA; border-bottom: 1px solid #F3F4F6; white-space: nowrap; }
        .data-table thead tr th:first-child { border-radius: 14px 0 0 0; }
        .data-table thead tr th:last-child  { border-radius: 0 14px 0 0; }
        .data-table tbody tr { border-bottom: 1px solid #F9FAFB; transition: background 0.12s; }
        .data-table tbody tr:last-child { border-bottom: none; }
        .data-table tbody tr:hover { background: #FAFAFA; }
        .data-table tbody td { padding: 12px 16px; font-size: 13px; color: #374151; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .score-bar-wrap { height: 4px; background: #F3F4F6; border-radius: 2px; overflow: hidden; margin-top: 5px; width: 60px; }
        .score-bar { height: 100%; border-radius: 2px; transition: width 0.3s; }
        .spinner { width: 16px; height: 16px; border: 2px solid #9CA3AF; border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; gap: 10px; }
        .empty-state svg { color: #E5E7EB; }
        .empty-state p { font-size: 13px; color: #9CA3AF; margin: 0; }
        .empty-state span { font-size: 12px; color: #D1D5DB; }
        .pagination-btn { height: 30px; min-width: 30px; padding: 0 8px; border: 1px solid #E5E7EB; border-radius: 7px; font-size: 12px; background: #fff; color: #6B7280; cursor: pointer; transition: all 0.13s; }
        .pagination-btn:hover { background: #F9FAFB; color: #111827; }
        .pagination-btn.active { background: #F26739; color: #fff; border-color: #F26739; font-weight: 600; }
      `}</style>

      <div className="stats-page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Thống kê bài làm</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: "4px 0 0" }}>Quản lý và theo dõi tiến độ người học</p>
          </div>
          <button className="btn-refresh" onClick={fetchData} disabled={loading}>
            {loading
              ? <><div className="spinner" /> Đang tải...</>
              : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Làm mới</>
            }
          </button>
        </div>

        {/* Filter */}
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          <div className="search-wrap">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" className="search-input" placeholder="Tìm tên bài làm hoặc người học..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
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
          {(search || filterScore) && (
            <button className="btn-refresh" onClick={() => { setSearch(""); setFilterScore(""); }}>
              Xoá lọc
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F3F4F6" }}>
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
                <th style={{ textAlign: "left" }}>Tên bài làm</th>
                <th style={{ textAlign: "left", width: 160 }}>Người làm</th>
                <th style={{ textAlign: "left", width: 110 }}>Ngày làm</th>
                <th style={{ textAlign: "center", width: 100 }}>Số câu</th>
                <th style={{ textAlign: "left", width: 140 }}>Điểm</th>
                <th style={{ textAlign: "center", width: 130 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading && [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}

              {!loading && filtered.map((row) => {
                const scoreNum = parseFloat(row.diem);
                const scorePct = isNaN(scoreNum) ? 0 : (scoreNum / 10) * 100;
                const scoreColor = scoreNum >= 8 ? "#16A34A" : scoreNum >= 5 ? "#D97706" : "#DC2626";
                const barColor   = scoreNum >= 8 ? "#22C55E" : scoreNum >= 5 ? "#F59E0B" : "#EF4444";
                return (
                  <tr key={row.ma}>
                    <td><span style={{ fontWeight: 500, color: "#111827" }}>{row.ten}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 13, color: "#374151" }}>{row.nguoiLam}</span>
                      </div>
                    </td>
                    <td style={{ color: "#9CA3AF", fontSize: 12.5 }}>{row.ngay}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 13, color: "#374151" }}>{row.sl}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: scoreColor }}>{row.diem}</span>
                        <div className="score-bar-wrap">
                          <div className="score-bar" style={{ width: `${scorePct}%`, background: barColor }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="status-badge" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                        <span className="status-dot" style={{ background: "#22C55E" }} />
                        Đã làm bài
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
                      </svg>
                      <p>{data.length === 0 ? "Chưa có dữ liệu thống kê Người học" : "Không tìm thấy bài làm nào"}</p>
                      {data.length === 0 && <span>Dữ liệu sẽ xuất hiện khi Người học hoàn thành bài làm</span>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
    </>
  );
}