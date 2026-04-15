import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoHS from "../../assets/logohs.png";

const Header = ({ role = "learner", onLogout }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Fake Data thông báo (trùng với Dashboard của bạn)
  const notifications = [
    { id: 1, text: "Bạn có bài học mới", time: "5 phút trước", isRead: false },
    { id: 2, text: "Quiz mới đã được thêm", time: "10 phút trước", isRead: false },
    { id: 3, text: "Cập nhật tài liệu lịch sử", time: "1 giờ trước", isRead: true },
    { id: 4, text: "Bạn có bài kiểm tra", time: "2 giờ trước", isRead: true },
  ];

  // Xử lý đóng dropdown khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-[240px] h-[64px] bg-white border-b border-[#E4E4E7] flex items-center justify-between px-8 z-50">
      {/* Ô tìm kiếm */}
      <div className="relative w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          className="w-full pl-10 pr-4 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-md text-[14px] outline-none focus:border-[#F26739] transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Khu vực Chuông Thông Báo */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full transition-colors relative ${
              showNotifications ? "bg-gray-100 text-[#F26739]" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* DROPDOWN MENU THÔNG BÁO */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[320px] bg-white border border-[#E4E4E7] rounded-xl shadow-xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-[#F4F4F5] flex justify-between items-center">
                <h3 className="font-bold text-[15px] text-[#09090B]">Thông báo</h3>
                <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">Đánh dấu đã đọc</span>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.map((noti) => (
                  <div 
                    key={noti.id} 
                    className="p-4 border-b border-[#F4F4F5] hover:bg-[#F9FAFB] cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${noti.isRead ? "bg-transparent" : "bg-blue-500"}`}></div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[13px] font-semibold text-[#09090B] leading-tight">
                        {noti.text}
                      </p>
                      <div className="flex items-center gap-1 text-[#9CA3AF]">
                        <Clock size={12} />
                        <span className="text-[11px]">{noti.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div 
                className="p-3 text-center border-t border-[#F4F4F5] bg-[#FAFAFA] hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setShowNotifications(false)}
              >
                <span className="text-[12px] font-bold text-gray-600">Xem tất cả thông báo</span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={onLogout}
          className="bg-[#F26739] text-white px-4 py-1.5 rounded-lg text-[13px] font-medium hover:bg-orange-600 transition-colors"
        >
          Đăng xuất
        </button>

        <div 
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-50 cursor-pointer hover:ring-2 ring-[#F26739] transition-all"
        >
          <img src={logoHS} alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Header;