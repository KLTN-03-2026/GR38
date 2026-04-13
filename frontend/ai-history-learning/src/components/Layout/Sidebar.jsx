import React from "react";
import { LayoutDashboard, Users, AlertTriangle } from "lucide-react";
import LogoImg from "../../assets/logo.jpg";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "dashboard", label: "Trang chủ", icon: LayoutDashboard },
    { id: "accounts", label: "Quản lý tài khoản", icon: Users },
    { id: "content", label: "Xử lý nội dung", icon: AlertTriangle },
  ];

  return (
    <aside className="fixed left-0 top-0 w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col z-30 font-['Inter']">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 overflow-hidden rounded-lg border border-gray-50 shadow-sm">
            <img
              src={LogoImg}
              alt="Lịch sử Việt Nam Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-[14px] text-gray-800 tracking-tight">
            Lịch sử Việt Nam
          </span>
        </div>
      </div>

      {/* 2. Phần Menu */}
      <nav className="p-3 flex flex-col gap-y-1 mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex w-full items-center gap-x-3 px-4 py-2.5 rounded-xl text-[13px] transition-all duration-200 ${
              activeTab === item.id
                ? "bg-[#F26739] text-white shadow-sm font-medium"
                : "text-gray-500 hover:bg-gray-50 font-normal"
            }`}
          >
            <item.icon
              size={18}
              strokeWidth={activeTab === item.id ? 2.5 : 2}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
