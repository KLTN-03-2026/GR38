import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || "User"
    )}&background=f97316&color=fff&rounded=true&size=128`;

  const profilePath =
    user.role === "admin"
      ? "/admin/profile"
      : user.role === "teacher"
      ? "/teacher/profile"
      : "/student/profile";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser({});
    navigate("/");
  };

  // sync khi update profile
  useEffect(() => {
    const updateUser = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };

    window.addEventListener("user-update", updateUser);
    return () => window.removeEventListener("user-update", updateUser);
  }, []);

  // click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 fixed top-0 left-[240px] right-0 bg-white border-b border-gray-200 flex items-center justify-end px-6 z-20">
      <div className="relative" ref={dropdownRef}>
        {/* AVATAR */}
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#F26739] transition-all"
        >
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
            
            {/* INFO */}
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.name || "Người dùng"}
              </p>
              <p className="text-xs text-gray-400">
                {user.role === "admin"
                  ? "Quản trị viên"
                  : user.role === "teacher"
                  ? "Giáo viên"
                  : "Người đọc"}
              </p>
            </div>

            {/* PROFILE */}
            <button
              onClick={() => {
                navigate(profilePath);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                <circle cx="12" cy="10" r="3" strokeWidth={1.5} />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 18c1.5-2 8.5-2 10 0"
                />
              </svg>

              Quản lý tài khoản
            </button>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Đăng xuất
            </button>

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;