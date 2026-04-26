import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Book, Zap, Layout as QuizIcon, AlertTriangle, BarChart } from "lucide-react";

const NAV_CONFIG = {
  ADMIN: [
    {
      label: "Trang chủ", path: "/admin",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    },
    {
      label: "Quản lý tài khoản", path: "/admin/accounts",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label: "Quản lý nội dung", path: "/admin/content",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
  ],
  TEACHER: [
    {
      label: "Trang chủ", path: "/teacher",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
    },
    {
      label: "Tài liệu", path: "/teacher/documents",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    },
    {
      label: "Flashcards", path: "/teacher/flashcards",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>,
    },
    {
      label: "Tạo Quiz", path: "/teacher/quizzes",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
    },
    {
      label: "Thống kê bài làm", path: "/teacher/stats",
      icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    },
  ],
  LEARNER: [
    { label: "Trang chủ",       path: "/learner",            icon: <Home size={20} /> },
    { label: "Tài liệu",        path: "/learner/documents",  icon: <Book size={20} /> },
    { label: "Flashcards",      path: "/learner/flashcards", icon: <Zap size={20} /> },
    { label: "Quizzes",         path: "/learner/quizzes",    icon: <QuizIcon size={20} /> },
    { label: "Sự cố",           path: "/learner/suco",       icon: <AlertTriangle size={20} /> },
    { label: "Tiến độ Học Tập", path: "/learner/tiendo",     icon: <BarChart size={20} /> },
  ],
};

const ROLE_LABEL = { ADMIN: "Quản trị viên", TEACHER: "Giáo viên", LEARNER: "Người học" };
const ROOT_PATHS = { ADMIN: "/admin", TEACHER: "/teacher", LEARNER: "/learner" };

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "LEARNER").toUpperCase();
  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.LEARNER;
  const isTeacher = role === "TEACHER";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) =>
    path === ROOT_PATHS[role]
      ? location.pathname === path
      : location.pathname.startsWith(path);

  /* ── TEACHER style (giữ nguyên animation) ── */
  if (isTeacher) return (
    <>
      <style>{`
        .sidebar-item { position:relative; overflow:hidden; transition:background .18s,color .18s; }
        .sidebar-item::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#F26739; border-radius:0 3px 3px 0; transform:scaleY(0); transition:transform .2s cubic-bezier(.4,0,.2,1); transform-origin:center; }
        .sidebar-item.active::before { transform:scaleY(1); }
        .sidebar-item .item-bg { position:absolute; inset:0; background:#F26739; opacity:0; transition:opacity .18s; }
        .sidebar-item.active .item-bg { opacity:1; }
        .sidebar-item:not(.active):hover .item-bg { opacity:.06; }
        .sidebar-item .item-content { position:relative; z-index:1; display:flex; align-items:center; gap:10px; padding:9px 16px; font-size:13.5px; font-weight:500; color:#6b7280; transition:color .18s,transform .15s; }
        .sidebar-item.active .item-content { color:#fff; }
        .sidebar-item:not(.active):hover .item-content { color:#374151; transform:translateX(2px); }
        .sidebar-icon { flex-shrink:0; opacity:.7; transition:opacity .18s,transform .2s cubic-bezier(.34,1.56,.64,1); }
        .sidebar-item.active .sidebar-icon, .sidebar-item:hover .sidebar-icon { opacity:1; transform:scale(1.1); }
      `}</style>
      <aside className="w-[220px] fixed top-0 left-0 h-screen bg-white flex flex-col z-30">
        <div className="h-14 px-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img src="/Logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-800 leading-tight">Lịch Sử Việt Nam</p>
            <p className="text-[13px] text-gray-400 leading-tight mt-0.5">Giáo viên</p>
          </div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`sidebar-item w-full text-left ${isActive(item.path) ? "active" : ""}`}>
              <span className="item-bg" />
              <span className="item-content">
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );

  /* ── LEARNER style ── */
    /* ── LEARNER style (đồng bộ với Teacher) ── */
  if (role === "LEARNER") return (
    <>
      <style>{`
        .sidebar-item { position:relative; overflow:hidden; transition:background .18s,color .18s; }
        .sidebar-item::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#F26739; border-radius:0 3px 3px 0; transform:scaleY(0); transition:transform .2s cubic-bezier(.4,0,.2,1); transform-origin:center; }
        .sidebar-item.active::before { transform:scaleY(1); }
        .sidebar-item .item-bg { position:absolute; inset:0; background:#F26739; opacity:0; transition:opacity .18s; }
        .sidebar-item.active .item-bg { opacity:1; }
        .sidebar-item:not(.active):hover .item-bg { opacity:.06; }
        .sidebar-item .item-content { position:relative; z-index:1; display:flex; align-items:center; gap:10px; padding:9px 16px; font-size:13.5px; font-weight:500; color:#6b7280; transition:color .18s,transform .15s; }
        .sidebar-item.active .item-content { color:#fff; }
        .sidebar-item:not(.active):hover .item-content { color:#374151; transform:translateX(2px); }
        .sidebar-icon { flex-shrink:0; opacity:.7; transition:opacity .18s,transform .2s cubic-bezier(.34,1.56,.64,1); }
        .sidebar-item.active .sidebar-icon, .sidebar-item:hover .sidebar-icon { opacity:1; transform:scale(1.1); }
      `}</style>
      <aside className="w-[220px] fixed top-0 left-0 h-screen bg-white flex flex-col z-30">
        <div className="h-14 px-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img src="/Logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-800 leading-tight">Lịch Sử Việt Nam</p>
            <p className="text-[13px] text-gray-400 leading-tight mt-0.5">Người học</p>
          </div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`sidebar-item w-full text-left ${isActive(item.path) ? "active" : ""}`}>
              <span className="item-bg" />
              <span className="item-content">
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
  /* ── ADMIN style ── */
  return (
    <aside className="w-[220px] fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-30">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2">
        <img src="/Logo.jpg" alt="Logo" className="w-8 h-8 object-contain rounded" />
        <div>
          <span className="text-sm font-semibold text-gray-800 block">Lịch sử Việt Nam</span>
          <span className="text-[11px] text-gray-400">{ROLE_LABEL[role]}</span>
        </div>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
              isActive(item.path) ? "bg-[#F26739] text-white" : "text-gray-600 hover:bg-gray-50"
            }`}>
            <span className={isActive(item.path) ? "text-white" : "text-gray-400"}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-gray-100 p-3">
        <button onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;