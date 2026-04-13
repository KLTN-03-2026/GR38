import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Luôn có avatar: ưu tiên field avatar, fallback generate từ tên
  const avatarUrl = user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=f97316&color=fff&rounded=true&size=128`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  const profilePath =
    user.role === "admin"   ? "/admin/profile"
    : user.role === "teacher" ? "/teacher/profile"
    : "/student/profile";

  return (
    <header className="h-14 fixed top-0 left-[240px] right-0 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-3 z-20">

      {/* Tên + role */}
      <div className="text-right mr-1">
        <p className="text-sm font-medium text-gray-800 leading-tight">
          {user.name || "Người dùng"}
        </p>
        <p className="text-xs text-gray-400 leading-tight">
          {user.role === "admin"   ? "Quản trị viên"
          : user.role === "teacher" ? "Giáo viên"
          : "Học sinh"}
        </p>
      </div>
      <button
        onClick={() => navigate(profilePath)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#F26739] transition-all flex-shrink-0"
      >
        <img
          src={avatarUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </button>
      <button
        onClick={handleLogout}
        className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
      >
        Đăng xuất
      </button>
    </header>
  );
};
export default Header;