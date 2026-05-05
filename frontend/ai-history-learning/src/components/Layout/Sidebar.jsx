import React from "react";
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
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

/* ─── NAV CONFIG ─── */
const NAV_CONFIG = {
  ADMIN: [
    { label: "Trang chủ", path: "/admin", icon: LayoutDashboard },
    { label: "Quản lý tài khoản", path: "/admin/accounts", icon: Users },
    { label: "Quản lý nội dung", path: "/admin/content", icon: FileText },
    { label: "Tài liệu", path: "/admin/documents", icon: BookOpen },
    { label: "Flashcards", path: "/admin/flashcards", icon: Layers },
    { label: "Quizzes", path: "/admin/quizzes", icon: HelpCircle },
  ],
  TEACHER: [
    { label: "Trang chủ", path: "/teacher", icon: Home },
    { label: "Tài liệu", path: "/teacher/documents", icon: BookOpen },
    { label: "Flashcards", path: "/teacher/flashcards", icon: Layers },
    { label: "Tạo Quiz", path: "/teacher/quizzes", icon: HelpCircle },
    { label: "Thống kê bài làm", path: "/teacher/stats", icon: BarChart2 },
  ],
  LEARNER: [
    { label: "Trang chủ", path: "/learner", icon: Home },
    { label: "Tài liệu", path: "/learner/documents", icon: BookOpen },
    { label: "Flashcards", path: "/learner/flashcards", icon: Layers },
    { label: "Quizzes", path: "/learner/quizzes", icon: HelpCircle },
    { label: "Sự cố", path: "/learner/suco", icon: AlertCircle },
    { label: "Tiến độ học tập", path: "/learner/tiendo", icon: TrendingUp },
  ],
};

const ROLE_LABEL = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  LEARNER: "Người học",
};
const ROOT_PATHS = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  LEARNER: "/learner",
};

/* ─── STYLES ─── */
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

  /* LOGO */
  .vsn-logo {
    height: 64px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 11px;
    border-bottom: 1px solid #f5f5f5;
    flex-shrink: 0;
  }
  .vsn-logo-img {
    width: 34px; height: 34px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(242,103,57,.25);
  }
  .vsn-logo-img img { width: 100%; height: 100%; object-fit: cover; }
  .vsn-logo-title { font-size: 13.5px; font-weight: 600; color: #1a1a1a; line-height: 1.3; }
  .vsn-logo-role  { font-size: 11.5px; color: #F26739; font-weight: 500; margin-top: 1px; }

  /* NAV */
  .vsn-nav {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* NAV ITEM — zero hover, only active state */
  .vsn-item {
    position: relative;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 10px;
    padding: 0;
    overflow: hidden;
  }
  .vsn-item:active { opacity: .85; }

  /* Orange fill — ONLY when .active */
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

  .vsn-item-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 13px;
    text-align: left;
  }

  /* ICON */
  .vsn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px; height: 30px;
    border-radius: 8px;
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

  /* LABEL */
  .vsn-label {
    font-size: 13.5px;
    font-weight: 500;
    color: #6b7280;
    white-space: nowrap;
  }
  .vsn-item.active .vsn-label { color: #fff; font-weight: 600; }

  /* CHEVRON */
  .vsn-chevron {
    margin-left: auto;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity .2s, transform .2s;
    color: rgba(255,255,255,.7);
    flex-shrink: 0;
  }
  .vsn-item.active .vsn-chevron { opacity: 1; transform: translateX(0); }

  /* SCROLLBAR */
  .vsn-nav::-webkit-scrollbar { width: 3px; }
  .vsn-nav::-webkit-scrollbar-track { background: transparent; }
  .vsn-nav::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
`;

/* ─── COMPONENT ─── */
const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "LEARNER").toUpperCase();
  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.LEARNER;

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
                  <ChevronRight
                    size={13}
                    strokeWidth={2.5}
                    className="vsn-chevron"
                  />
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
