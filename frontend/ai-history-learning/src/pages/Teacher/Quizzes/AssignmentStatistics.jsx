import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "../../../lib/api";

const PAGE_SIZE = 8;

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
        className={`cs-btn${open ? " open" : ""}`}>
        {selected?.dot && (
          <span className="cs-dot" style={{ background: selected.dot }} />
        )}
        <span className="cs-label">{selected ? selected.label : placeholder}</span>
        <svg className={`cs-chevron${open ? " open" : ""}`} width="12" height="12"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="cs-menu">
          {options.map((opt) => (
            <button key={opt.value} type="button"
              className={`cs-option${value === opt.value ? " active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}>
              <span className="cs-dot-wrap">
                {opt.dot
                  ? <span className="cs-dot" style={{ background: opt.dot }} />
                  : null}
              </span>
              <span>{opt.label}</span>
              {value === opt.value && (
                <svg className="cs-check" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <tr className="skel-row">
      {[220, 140, 90, 60, 110, 100].map((w, i) => (
        <td key={i} style={{ padding: "15px 18px" }}>
          <div style={{ height: 13, width: w, borderRadius: 6, background: "#F1F2F4", animation: "pulse 1.5s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}

function ScorePill({ score }) {
  if (score === "—") return <span style={{ color: "#C1C5CC", fontSize: 13 }}>—</span>;
  const n = parseFloat(score);
  const color   = n >= 8 ? "#16a34a" : n >= 5 ? "#b45309" : "#dc2626";
  const bg      = n >= 8 ? "#f0fdf4" : n >= 5 ? "#fffbeb" : "#fef2f2";
  const bar     = n >= 8 ? "#4ade80" : n >= 5 ? "#fbbf24" : "#f87171";
  const pct     = Math.min(100, (n / 10) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        display: "inline-block", minWidth: 54, textAlign: "center",
        padding: "3px 10px", borderRadius: 20,
        background: bg, color, fontWeight: 700, fontSize: 13,
        letterSpacing: "-0.01em",
      }}>
        {score}<span style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>/10</span>
      </span>
      <div style={{ width: 52, height: 5, borderRadius: 3, background: "#EAECF0", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: bar, borderRadius: 3,
          transition: "width 0.4s cubic-bezier(.22,1,.36,1)" }} />
      </div>
    </div>
  );
}

export default function AssignmentStatistics() {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterScore, setFilterScore] = useState("");
  const [page, setPage]               = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/quizzes/statistics");
      const raw = res.data?.data ?? [];
      const rows = raw.map((q) => {
        const scoreOn10 = q.score != null && q.totalQuestions > 0
          ? parseFloat(((q.score / q.totalQuestions) * 10).toFixed(1))
          : q.score ?? null;
        return {
          ma:       q._id,
          ten:      q.quizTitle    ?? "Không có tên",
          nguoiLam: q.learnerName  ?? q.learnerEmail ?? "—",
          ngay:     q.createdAt ? new Date(q.createdAt).toLocaleDateString("vi-VN") : "—",
          sl:       q.totalQuestions ?? "—",
          diem:     scoreOn10 != null ? String(scoreOn10) : "—",
        };
      });
      setData(rows);
    } catch (err) {
      console.error(">>> [statistics] ERROR:", err?.response?.data ?? err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, filterScore]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNums   = getPageNumbers(safePage, totalPages);

  const goTo = (p) => {
    if (typeof p === "number" && p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .stats-root { font-family:'Be Vietnam Pro',sans-serif; color:#1a1d23; }

        /* ── Header ── */
        .stats-header {
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:28px; gap:16px; flex-wrap:wrap;
        }
        .stats-title { font-size:22px; font-weight:700; color:#0f1117; margin:0; letter-spacing:-.02em; }
        .stats-sub   { font-size:13px; color:#9AA3B2; margin:5px 0 0; font-weight:400; }

        /* ── Refresh btn ── */
        .btn-refresh {
          height:38px; padding:0 16px;
          background:#fff; color:#374151;
          border:1.5px solid #E4E7EC; border-radius:10px;
          font-size:13px; font-weight:500; font-family:inherit;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          transition:background .15s, border-color .15s, box-shadow .15s;
          white-space:nowrap; flex-shrink:0;
        }
        .btn-refresh:hover:not(:disabled) { background:#FAFBFC; border-color:#D0D5DD; box-shadow:0 1px 4px rgba(0,0,0,.06); }
        .btn-refresh:disabled { opacity:.55; cursor:not-allowed; }
        .spinner { width:14px;height:14px;border:2px solid #D0D5DD;border-top-color:#F26739;border-radius:50%;animation:spin .65s linear infinite; }

        /* ── Filter bar ── */
        .filter-bar {
          display:flex; gap:10px; align-items:center; flex-wrap:wrap;
          background:#fff; border:1.5px solid #E4E7EC; border-radius:14px;
          padding:14px 16px; margin-bottom:16px; position:relative; z-index:10;
        }
        .search-wrap { position:relative; flex:1; min-width:220px; }
        .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#9AA3B2; pointer-events:none; }
        .search-input {
          width:100%; height:38px; padding:0 12px 0 38px;
          border:1.5px solid #E4E7EC; border-radius:10px;
          font-size:13px; color:#1a1d23; font-family:inherit;
          background:#FAFBFC; outline:none; box-sizing:border-box;
          transition:border-color .15s, background .15s, box-shadow .15s;
        }
        .search-input::placeholder { color:#B8BEC9; }
        .search-input:focus { border-color:#F26739; background:#fff; box-shadow:0 0 0 3px rgba(242,103,57,.10); }
        .btn-clear {
          height:38px; padding:0 14px;
          background:transparent; color:#9AA3B2;
          border:1.5px solid #E4E7EC; border-radius:10px;
          font-size:12.5px; font-weight:500; font-family:inherit;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          transition:all .15s; white-space:nowrap;
        }
        .btn-clear:hover { background:#FFF5F3; border-color:#F26739; color:#F26739; }

        /* ── Custom Select ── */
        .cs-btn {
          height:38px; padding:0 13px;
          border:1.5px solid #E4E7EC; border-radius:10px;
          font-size:13px; color:#374151; font-family:inherit;
          background:#FAFBFC; cursor:pointer;
          display:inline-flex; align-items:center; gap:8px;
          min-width:155px; transition:border-color .18s, background .18s, box-shadow .18s;
          white-space:nowrap;
        }
        .cs-btn:hover { background:#fff; border-color:#D0D5DD; }
        .cs-btn.open  { background:#fff; border-color:#F26739; box-shadow:0 0 0 3px rgba(242,103,57,.10); }
        .cs-label { flex:1; text-align:left; }
        .cs-chevron { flex-shrink:0; color:#9AA3B2; transition:transform .18s; }
        .cs-chevron.open { transform:rotate(180deg); }
        .cs-menu {
          position:absolute; top:calc(100% + 6px); left:0; min-width:100%;
          background:#fff; border:1.5px solid #E4E7EC; border-radius:12px;
          box-shadow:0 10px 32px rgba(0,0,0,.10); z-index:9999; padding:5px;
        }
        .cs-option {
          display:flex; align-items:center; gap:8px; width:100%;
          padding:8px 10px; border:none; background:transparent;
          border-radius:8px; font-size:13px; color:#374151; font-family:inherit;
          cursor:pointer; text-align:left; transition:background .1s;
          white-space:nowrap;
        }
        .cs-option:hover  { background:#F7F8FA; color:#0f1117; }
        .cs-option.active { background:#FFF5F1; color:#F26739; font-weight:600; }
        .cs-dot       { width:7px;height:7px;border-radius:50%;flex-shrink:0;display:inline-block; }
        .cs-dot-wrap  { width:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .cs-check     { margin-left:auto; flex-shrink:0; stroke:#F26739; }

        /* ── Card ── */
        .card {
          background:#fff; border:1.5px solid #E4E7EC;
          border-radius:16px; overflow:hidden;
        }
        .card-head {
          display:flex; align-items:center; justify-content:space-between;
          padding:15px 20px; border-bottom:1px solid #F1F2F4;
          gap:12px; flex-wrap:wrap;
        }
        .card-head-title { font-size:14px; font-weight:700; color:#0f1117; margin:0; }
        .count-badge {
          display:inline-block; padding:2px 10px;
          background:#F1F2F4; color:#6B7280; border-radius:20px;
          font-size:12px; font-weight:500; margin-left:8px;
        }

        /* ── Table ── */
        .data-table { width:100%; border-collapse:collapse; }
        .data-table thead th {
          padding:10px 18px; font-size:11px; font-weight:700;
          letter-spacing:.07em; text-transform:uppercase;
          color:#9AA3B2; background:#FAFBFC;
          border-bottom:1px solid #F1F2F4; white-space:nowrap;
          text-align:left;
        }
        .data-table thead th.center { text-align:center; }
        .data-table tbody tr {
          border-bottom:1px solid #F7F8FA;
          transition:background .12s;
          animation:fadeUp .22s ease both;
        }
        .data-table tbody tr:last-child { border-bottom:none; }
        .data-table tbody tr:hover { background:#FAFBFC; }
        .data-table tbody td { padding:13px 18px; font-size:13.5px; color:#374151; vertical-align:middle; }
        .data-table tbody td.center { text-align:center; }

        /* ── Name cell ── */
        .row-name { font-weight:600; color:#0f1117; font-size:13.5px; }

        /* ── Person cell ── */
        .person-cell { display:flex; align-items:center; gap:9px; }
        .avatar {
          width:30px; height:30px; border-radius:50%;
          background:#F1F2F4; display:flex; align-items:center;
          justify-content:center; flex-shrink:0;
        }
        .person-name { font-size:13px; color:#374151; }

        /* ── Date ── */
        .date-cell { font-size:12.5px; color:#9AA3B2; white-space:nowrap; }

        /* ── Count ── */
        .count-cell {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:28px; height:24px; padding:0 8px;
          background:#F7F8FA; border-radius:8px;
          font-size:12.5px; font-weight:600; color:#6B7280;
        }

        /* ── Status ── */
        .badge-done {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 11px; border-radius:20px;
          background:#F0FDF4; color:#16A34A;
          font-size:12px; font-weight:600; white-space:nowrap;
        }
        .badge-dot { width:6px; height:6px; border-radius:50%; background:#22C55E; flex-shrink:0; }

        /* ── Empty ── */
        .empty-wrap {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:56px 24px; gap:10px;
        }
        .empty-icon { color:#D1D5DB; }
        .empty-title { font-size:14px; font-weight:600; color:#6B7280; margin:0; }
        .empty-sub   { font-size:12.5px; color:#B8BEC9; margin:0; }

        /* ── Pagination ── */
        .pagination {
          display:flex; align-items:center; justify-content:space-between;
          padding:13px 20px; border-top:1px solid #F1F2F4;
          flex-wrap:wrap; gap:10px;
        }
        .pg-info { font-size:12.5px; color:#9AA3B2; }
        .pg-group { display:flex; align-items:center; gap:4px; }
        .pg-btn {
          height:33px; min-width:33px; padding:0 9px;
          border:1.5px solid #E4E7EC; border-radius:9px;
          font-size:12.5px; font-weight:500; font-family:inherit;
          background:#fff; color:#6B7280; cursor:pointer;
          transition:all .13s;
          display:inline-flex; align-items:center; justify-content:center;
        }
        .pg-btn:hover:not(:disabled) { background:#F7F8FA; border-color:#D0D5DD; color:#111827; }
        .pg-btn.cur { background:#F26739; color:#fff; border-color:#F26739; font-weight:700;
          box-shadow:0 2px 8px rgba(242,103,57,.28); }
        .pg-btn:disabled { opacity:.35; cursor:not-allowed; }
        .pg-dots { height:33px; min-width:22px; display:inline-flex; align-items:center;
          justify-content:center; font-size:13px; color:#C1C5CC; }
      `}</style>

      <div className="stats-root">
        {/* Header */}
        <div className="stats-header">
          <div>
            <h1 className="stats-title">Thống kê bài làm</h1>
            <p className="stats-sub">Quản lý và theo dõi tiến độ người học</p>
          </div>
          <button className="btn-refresh" onClick={fetchData} disabled={loading}>
            {loading
              ? <><div className="spinner" /> Đang tải...</>
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

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" className="search-input"
              placeholder="Tìm tên bài làm hoặc người học..."
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
            <button className="btn-clear"
              onClick={() => { setSearch(""); setFilterScore(""); }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xoá lọc
            </button>
          )}
        </div>

        {/* Table card */}
        <div className="card">
          <div className="card-head">
            <p className="card-head-title">
              Danh sách bài làm
              <span className="count-badge">
                {loading ? "…" : `${filtered.length} bài`}
              </span>
            </p>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Tên bài làm</th>
                <th style={{ width: 170 }}>Người làm</th>
                <th style={{ width: 112 }}>Ngày làm</th>
                <th className="center" style={{ width: 88 }}>Số câu</th>
                <th style={{ width: 160 }}>Điểm</th>
                <th className="center" style={{ width: 130 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading && [1,2,3,4,5,6,7,8].map((i) => <SkeletonRow key={i} />)}

              {!loading && pageRows.map((row, idx) => (
                <tr key={row.ma} style={{ animationDelay: `${idx * 35}ms` }}>
                  <td><span className="row-name">{row.ten}</span></td>
                  <td>
                    <div className="person-cell">
                      <div className="avatar">
                        <svg width="14" height="14" fill="none" stroke="#9AA3B2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className="person-name">{row.nguoiLam}</span>
                    </div>
                  </td>
                  <td className="date-cell">{row.ngay}</td>
                  <td className="center">
                    <span className="count-cell">{row.sl}</span>
                  </td>
                  <td><ScorePill score={row.diem} /></td>
                  <td className="center">
                    <span className="badge-done">
                      <span className="badge-dot" />
                      Đã làm bài
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-wrap">
                      <svg className="empty-icon" width="44" height="44" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
                      </svg>
                      <p className="empty-title">
                        {data.length === 0 ? "Chưa có dữ liệu thống kê" : "Không tìm thấy bài làm nào"}
                      </p>
                      {data.length === 0 && (
                        <p className="empty-sub">Dữ liệu xuất hiện khi người học hoàn thành bài làm</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <span className="pg-info">
              {loading ? "…" : filtered.length === 0
                ? "Không có bài làm nào"
                : `Hiển thị ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} / ${filtered.length} bài làm`}
            </span>

            {!loading && totalPages > 1 && (
              <div className="pg-group">
                <button className="pg-btn" disabled={safePage === 1} onClick={() => goTo(safePage - 1)}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                {pageNums.map((p, i) =>
                  p === "..." ? (
                    <span key={`d-${i}`} className="pg-dots">…</span>
                  ) : (
                    <button key={p} className={`pg-btn${p === safePage ? " cur" : ""}`} onClick={() => goTo(p)}>
                      {p}
                    </button>
                  )
                )}
                <button className="pg-btn" disabled={safePage === totalPages} onClick={() => goTo(safePage + 1)}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}