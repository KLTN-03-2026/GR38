import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Layers,
  HelpCircle,
  BarChart2,
  Users,
  FileText,
  LayoutDashboard,
  LogOut,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

/* ─── NAV CONFIG ─── */
const NAV_CONFIG = {
  ADMIN: [
    { label: "Trang chủ",        path: "/admin",          icon: LayoutDashboard },
    { label: "Quản lý tài khoản", path: "/admin/accounts", icon: Users },
    { label: "Quản lý nội dung", path: "/admin/content",  icon: FileText },
  ],
  TEACHER: [
    { label: "Trang chủ",       path: "/teacher",            icon: Home },
    { label: "Tài liệu",        path: "/teacher/documents",  icon: BookOpen },
    { label: "Flashcards",      path: "/teacher/flashcards", icon: Layers },
    { label: "Tạo Quiz",        path: "/teacher/quizzes",    icon: HelpCircle },
    { label: "Thống kê bài làm",path: "/teacher/stats",     icon: BarChart2 },
  ],
  LEARNER: [
    { label: "Trang chủ",       path: "/learner",            icon: Home },
    { label: "Tài liệu",        path: "/learner/documents",  icon: BookOpen },
    { label: "Flashcards",      path: "/learner/flashcards", icon: Layers },
    { label: "Quizzes",         path: "/learner/quizzes",    icon: HelpCircle },
    { label: "Sự cố",           path: "/learner/suco",       icon: AlertCircle },
    { label: "Tiến độ học tập", path: "/learner/tiendo",     icon: TrendingUp },
  ],
};

const ROLE_LABEL = {
  ADMIN:   "Quản trị viên",
  TEACHER: "Giáo viên",
  LEARNER: "Người học",
};
const ROOT_PATHS = {
  ADMIN:   "/admin",
  TEACHER: "/teacher",
  LEARNER: "/learner",
};

/* ─── SHARED STYLES ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&display=swap');

  .vsn-sidebar {
    font-family: 'Be Vietnam Pro', sans-serif;
    width: 220px;
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    z-index: 30;
    border-right: 1px solid #f0f0f0;
    box-shadow: 2px 0 16px rgba(0,0,0,.04);
  }

  /* LOGO AREA */
  .vsn-logo {
    height: 64px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 11px;
    border-bottom: 1px solid #f5f5f5;
  }
  .vsn-logo-img {
    width: 34px; height: 34px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(242,103,57,.25);
  }
  .vsn-logo-img img { width:100%; height:100%; object-fit:cover; }
  .vsn-logo-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.3;
  }
  .vsn-logo-role {
    font-size: 11.5px;
    color: #F26739;
    font-weight: 500;
    margin-top: 1px;
  }

  /* NAV */
  .vsn-nav { flex: 1; padding: 10px 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }

  /* NAV ITEM */
  .vsn-item {
    position: relative;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 10px;
    padding: 0;
    overflow: hidden;
    transition: transform .15s ease;
  }
  .vsn-item:hover { transform: translateX(2px); }
  .vsn-item:active { transform: scale(.98); }

  /* Animated fill background */
  .vsn-item-fill {
    position: absolute;
    inset: 0;
    border-radius: 10px;
    background: #F26739;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform .25s cubic-bezier(.4,0,.2,1);
    z-index: 0;
  }
  .vsn-item.active .vsn-item-fill { transform: scaleX(1); }

  /* Hover subtle fill */
  .vsn-item:not(.active):hover .vsn-item-fill {
    background: rgba(242,103,57,.07);
    transform: scaleX(1);
  }

  /* Left accent bar */
  .vsn-item::after {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: #F26739;
    transform: scaleY(0);
    transition: transform .2s cubic-bezier(.4,0,.2,1);
    z-index: 2;
  }
  .vsn-item.active::after { transform: scaleY(0); } /* hidden when fill active */
  .vsn-item:not(.active):hover::after { transform: scaleY(1); }

  .vsn-item-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 13px;
    text-align: left;
  }

  /* Icon wrapper */
  .vsn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px; height: 30px;
    border-radius: 8px;
    background: transparent;
    color: #9ca3af;
    flex-shrink: 0;
    transition: background .2s, color .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .vsn-item.active .vsn-icon {
    background: rgba(255,255,255,.22);
    color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.12);
    transform: scale(1.08);
  }
  .vsn-item:not(.active):hover .vsn-icon {
    background: rgba(242,103,57,.1);
    color: #F26739;
    transform: scale(1.06);
  }

  /* Label */
  .vsn-label {
    font-size: 13.5px;
    font-weight: 500;
    color: #6b7280;
    transition: color .18s;
    white-space: nowrap;
  }
  .vsn-item.active .vsn-label { color: #fff; font-weight: 600; }
  .vsn-item:not(.active):hover .vsn-label { color: #374151; }

  /* Chevron for active */
  .vsn-chevron {
    margin-left: auto;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity .2s, transform .2s;
    color: rgba(255,255,255,.7);
    flex-shrink: 0;
  }
  .vsn-item.active .vsn-chevron { opacity: 1; transform: translateX(0); }

  /* FOOTER LOGOUT */
  .vsn-footer {
    padding: 10px;
    border-top: 1px solid #f5f5f5;
  }
  .vsn-logout {
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 13px;
    border-radius: 10px;
    color: #ef4444;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: background .18s, transform .15s;
  }
  .vsn-logout:hover { background: #fef2f2; transform: translateX(2px); }
  .vsn-logout:active { transform: scale(.98); }
  .vsn-logout-icon {
    display:flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:8px;
    background: rgba(239,68,68,.08);
    transition: background .18s, transform .2s;
  }
  .vsn-logout:hover .vsn-logout-icon {
    background: rgba(239,68,68,.15);
    transform: scale(1.06);
  }

  /* Scrollbar */
  .vsn-nav::-webkit-scrollbar { width: 3px; }
  .vsn-nav::-webkit-scrollbar-track { background: transparent; }
  .vsn-nav::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
`;

/* ─── SIDEBAR COMPONENT ─── */
const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "LEARNER").toUpperCase();
  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.LEARNER;

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

  return (
    <>
      <style>{STYLES}</style>
      <aside className="vsn-sidebar">
        {/* Logo */}
        <div className="vsn-logo">
          <div className="vsn-logo-img">
            <img src="/Logo.jpg" alt="Logo" />
          </div>
          <div>
            <div className="vsn-logo-title">Lịch Sử Việt Nam</div>
            <div className="vsn-logo-role">{ROLE_LABEL[role]}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="vsn-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                className={`vsn-item${active ? " active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="vsn-item-fill" />
                <span className="vsn-item-inner">
                  <span className="vsn-icon">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="vsn-label">{item.label}</span>
                  <ChevronRight size={13} strokeWidth={2.5} className="vsn-chevron" />
                </span>
              </button>
            );
          })}
        </nav>      
      </aside>
    </>
  );
};

export default Sidebar;