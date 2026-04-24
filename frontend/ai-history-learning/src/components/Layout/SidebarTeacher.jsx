import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Trang chủ",
    path: "/teacher",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    label: "Tài liệu",
    path: "/teacher/documents",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    label: "Flashcards",
    path: "/teacher/flashcards",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
        />
      </svg>
    ),
  },
  {
    label: "Tạo Quiz",
    path: "/teacher/quizzes",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
        />
      </svg>
    ),
  },
  {
    label: "Thống kê bài làm",
    path: "/teacher/stats",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
];

const SidebarTeacher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(null);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    setPrevPath(location.pathname);
  }, [location.pathname]);

  const handleNav = (path) => {
    if (path === location.pathname) return;
    navigate(path);
  };

  return (
    <>
      <style>{`
        .sidebar-item {
          position: relative;
          overflow: hidden;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .sidebar-item::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #F26739;
          border-radius: 0 3px 3px 0;
          transform: scaleY(0);
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
          transform-origin: center;
        }
        .sidebar-item.active::before {
          transform: scaleY(1);
        }
        .sidebar-item .item-bg {
          position: absolute;
          inset: 0;
          background: #F26739;
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .sidebar-item.active .item-bg {
          opacity: 1;
        }
        .sidebar-item:not(.active):hover .item-bg {
          opacity: 0.06;
        }
        .sidebar-item .item-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: #6b7280;
          transition: color 0.18s ease, transform 0.15s ease;
        }
        .sidebar-item.active .item-content {
          color: #fff;
        }
        .sidebar-item:not(.active):hover .item-content {
          color: #374151;
          transform: translateX(2px);
        }
        .sidebar-icon {
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sidebar-item.active .sidebar-icon {
          opacity: 1;
        }
        .sidebar-item:hover .sidebar-icon {
          opacity: 1;
          transform: scale(1.1);
        }
        .sidebar-item.active .sidebar-icon {
          transform: scale(1.05);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #9ca3af;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
          cursor: pointer;
          background: transparent;
          border: none;
          text-align: left;
        }
        .logout-btn:hover {
          background: #fff1f1;
          color: #ef4444;
        }
        .logout-btn:hover svg {
          transform: translateX(-2px);
        }
        .logout-btn svg {
          transition: transform 0.2s ease;
        }
        .section-label {
          padding: 12px 16px 4px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #d1d5db;
          user-select: none;
        }
      `}</style>

      <aside
        className="w-[220px] fixed top-0 left-0 h-screen bg-white flex flex-col z-30"      >
        {/* Logo */}
            <div className="h-14 px-4 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              src="/Logo.jpg"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-800 leading-tight">
              Lịch Sử Việt Nam
            </p>
            <p className="text-[13px] text-gray-400 leading-tight mt-0.5">
              Giáo viên
            </p>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.slice(0, 4).map((item) => {
            const active =
              item.path === "/teacher"
                ? location.pathname === "/teacher"
                : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`sidebar-item w-full text-left ${active ? "active" : ""}`}
              >
                <span className="item-bg" />
                <span className="item-content">
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.label}
                </span>
              </button>
            );
          })}
          {navItems.slice(4).map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`sidebar-item w-full text-left ${active ? "active" : ""}`}
              >
                <span className="item-bg" />
                <span className="item-content">
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        {/* Footer */}
        <div>
        </div>
      </aside>
    </>
  );
};

export default SidebarTeacher;
