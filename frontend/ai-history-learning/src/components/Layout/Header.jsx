import React from "react";

const Header = () => {
  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-end px-8 bg-white fixed top-0 right-0 left-[240px] z-10">
      <div className="flex items-center gap-4">
        <button className="bg-[#F26739] hover:bg-[#d9562d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
          Đăng xuất
        </button>
        <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
          <img
            src="https://ui-avatars.com/api/?name=Admin&background=random"
            alt="Avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
