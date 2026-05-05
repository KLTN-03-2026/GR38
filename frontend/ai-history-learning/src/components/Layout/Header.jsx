import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const LogoutModal = ({ onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-[300px] p-7 text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-800 mb-1">Đăng xuất?</p>
      <p className="text-sm text-gray-400 mb-6">Bạn có chắc chắn muốn đăng xuất không?</p>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Huỷ
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm hover:bg-red-100 transition-colors">
          Đăng xuất
        </button>
      </div>
    </div>
  </div>
);

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  const safeUser = user || {};
  const displayName = safeUser.fullName ?? safeUser.name ?? "Người dùng";

  const avatarUrl =
    safeUser.profileImage || safeUser.avatarUrl || safeUser.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F26739&color=fff&rounded=true&size=128`;

  const roleLabel =
    safeUser.role === "admin" ? "Quản trị viên"
    : (safeUser.role || "").toUpperCase() === "TEACHER" ? "Giáo viên"
    : "Người học";

  const profilePath =
    safeUser.role === "admin" ? "/admin/profile"
    : (safeUser.role || "").toUpperCase() === "TEACHER" ? "/teacher/profile"
    : "/learner/profile";

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .header-avatar-btn {
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .header-avatar-btn:hover {
          border-color: #F26739;
          box-shadow: 0 0 0 3px rgba(242,103,57,0.12);
        }
        .dropdown-enter {
          animation: dropdownIn 0.15s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 8px 14px;
          font-size: 13px;
          color: #4b5563;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.13s ease, color 0.13s ease;
          border-radius: 8px;
        }
        .dropdown-item:hover { background: #f9fafb; color: #111827; }
        .dropdown-item.danger { color: #ef4444; }
        .dropdown-item.danger:hover { background: #fff1f0; color: #dc2626; }
      `}</style>

      <header className="h-16 fixed top-0 left-0 right-0 bg-white border-b border-gray-100 flex items-center px-5 z-20">

        {/* ── LOGO bên trái ── */}
        <div className="w-[220px] flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-[34px] h-[34px] rounded-[10px] overflow-hidden flex-shrink-0"
            style={{ boxShadow: "0 2px 8px rgba(242,103,57,.25)" }}
          >
            <img src="/Logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-gray-900 leading-tight">
              Lịch Sử Việt Nam
            </div>
            <div className="text-[11.5px] font-medium" style={{ color: "#F26739" }}>
              {roleLabel}
            </div>
          </div>
        </div>

        {/* ── USER DROPDOWN bên phải ── */}
        <div className="flex-1 flex justify-end">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="header-avatar-btn flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 bg-white"
            >
              <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
              <span className="text-[13px] font-medium text-gray-700 leading-none">{displayName}</span>
              <svg
                className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div
                className="dropdown-enter absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <img src={avatarUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{displayName}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{roleLabel}</p>
                  </div>
                </div>
                <div className="p-1.5">
                  <button className="dropdown-item" onClick={() => { navigate(profilePath); setOpen(false); }}>
                    <svg className="w-4 h-4 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Quản lý tài khoản
                  </button>
                  <button className="dropdown-item danger" onClick={() => { setShowLogoutModal(true); setOpen(false); }}>
                    <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      )}
    </>
  );
};

export default Header;