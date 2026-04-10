import React from "react";
import { LayoutDashboard, Users, AlertTriangle } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "dashboard", label: "Trang chủ", icon: LayoutDashboard },
    { id: "accounts", label: "Quản lý tài khoản", icon: Users },
    { id: "content", label: "Quản lý báo cáo", icon: AlertTriangle },
  ];

  return (
    <aside className="fixed left-0 top-0 w-[240px] h-full bg-white border-r border-slate-200 flex flex-col z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-50">
        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center font-bold text-[#F26739]">
          V
        </div>
        <span className="font-bold text-sm text-slate-800">
          Lịch sử Việt Nam
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id
                ? "bg-[#F26739] text-white shadow-md shadow-orange-200"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
