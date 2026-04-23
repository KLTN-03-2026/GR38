import React from "react";
import { 
  Home, Book, Zap, Layout as QuizIcon, 
  AlertTriangle, BarChart, Info 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logoWeb from "../../assets/logo.jpg";

const SidebarLearner = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Cập nhật đường dẫn dựa trên cấu trúc file trong hình ảnh:
  // Dashboard.jsx, Documents.jsx, Flashcards.jsx, Quizzes.jsx, SuCo.jsx, ThongTinNguoiHoc.jsx
  const menuItems = [
    { icon: <Home size={20} />, label: "Trang chủ", path: "/learner" },
    { icon: <Book size={20} />, label: "Tài liệu", path: "/learner/documents" },
    { icon: <Zap size={20} />, label: "Flashcards", path: "/learner/flashcards" },
    { icon: <QuizIcon size={20} />, label: "Quizzes", path: "/learner/quizzes" }, 
    { icon: <BarChart size={20} />, label: "Tiến độ Học Tập", path: "/learner/tiendo" }, 
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-[#E4E4E7] flex flex-col z-20">
      <div className="p-4 flex items-center gap-3 border-b border-[#E4E4E7] h-[64px]">
        {/* Logo theo CSS hình chữ nhật bo góc 8px */}
        <div 
          className="flex flex-row justify-center items-center p-0 w-8 h-8 rounded-[8px] overflow-hidden bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${logoWeb})` }}
        >
        </div>
        
        <span className="font-bold text-[15px] text-[#09090B] truncate">
          Lịch sử Việt Nam
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 mt-2">
        {menuItems.map((item, index) => {
          // Kiểm tra isActive chính xác cho route con /learner/...
          const isActive = location.pathname === item.path || 
                          (item.path !== "/learner" && location.pathname.startsWith(item.path));
        
          return (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "bg-[#F26739] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#F26739]"
              }`}
            >
              <div className={isActive ? "text-white" : "text-gray-500"}>
                {item.icon}
              </div>
              <span className="font-medium text-[14px]">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E4E4E7]">
        <div className="text-[12px] text-gray-400 text-center">
          © 2026 Lịch sử Việt Nam
        </div>
      </div>
    </aside>
  );
};

export default SidebarLearner;