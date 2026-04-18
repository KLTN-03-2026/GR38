import React from 'react';
import { Bell, FileText, Layout, Wrench, BookOpen } from 'lucide-react';

const LearnerDashboard = () => {
  // Dữ liệu mẫu
  const notifications = [
    "Bạn có bài học mới",
    "Quiz mới đã được thêm",
    "Cập nhật tài liệu lịch sử",
    "Bạn có bài kiểm tra"
  ];

  const recentActivities = [
    { id: 1, type: 'document', title: 'Đọc tài liệu', sub: 'Chiến tranh giải phóng miền Nam', time: '5 phút trước', color: '#16A34A', bg: '#DCFCE7' },
    { id: 2, type: 'quiz', title: 'Quiz đã làm', sub: 'Kháng chiến chống Mỹ', time: '5 phút trước', color: '#2563EB', bg: '#DBEAFE' },
    { id: 3, type: 'report', title: 'Báo cáo sự cố', sub: 'Không Chat AI được', time: '5 phút trước', color: '#EA580C', bg: '#FFEDD5' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-[20px_32px] flex flex-col gap-6 font-['Inter']">
      
      {/* Header Trang Chủ */}
      <div className="w-full flex justify-between items-center py-2">
        <h1 className="text-[30px] font-semibold text-[#09090B] tracking-[0.4px] leading-[30px] mx-auto">
          Trang chủ
        </h1>
      </div>

      {/* Hàng 1: Thông báo & Lộ trình */}
      <div className="flex flex-row gap-4 w-full">
        {/* Card: Thông Báo */}
        <div className="flex-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.1)] flex flex-col">
          <div className="p-[24px_24px_8px] flex justify-between items-center">
            <h2 className="text-[16px] font-bold text-[#09090B]">Thông Báo</h2>
            <Bell size={16} className="text-gray-400" />
          </div>
          <div className="p-[0px_24px_24px] flex flex-col">
            {notifications.map((text, i) => (
              <div key={i} className="text-[13px] font-semibold leading-[30px] text-[#09090B] tracking-[0.4px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span> {text}
              </div>
            ))}
          </div>
        </div>

        {/* Card: Lộ trình học - ĐÃ TỐI ƯU CHIỀU DÀI */}
        <div className="flex-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.1)] flex flex-col min-h-[260px]">
          <div className="p-[20px_24px_12px] flex justify-between items-center">
            <h2 className="text-[16px] font-bold text-[#09090B]">Lộ trình học cho bạn</h2>
            <Layout size={16} className="text-gray-400" />
          </div>
          
          <div className="p-[0px_24px_20px] flex flex-col justify-between flex-grow">
            {/* Danh sách bài học */}
            <div className="flex flex-col gap-3">
              {[
                "Bài 1: Lịch sử Việt Nam cơ bản",
                "Bài 2: Chiến tranh Điện Biên Phủ",
                "Bài 3: Kháng chiến chống Pháp"
              ].map((bai, i) => (
                <div key={i} className="flex justify-between items-center bg-[#F9FAFB] p-2.5 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                  <span className="text-[13px] font-semibold text-[#374151] truncate pr-2">{bai}</span>
                  <button className="bg-[#47ED70] hover:bg-[#3edb65] text-white text-[12px] font-bold px-4 py-1.5 rounded-[6px] transition-colors shrink-0">
                    Bắt đầu
                  </button>
                </div>
              ))}
            </div>

            {/* Tiến độ */}
            <div className="mt-4 pt-2 border-t border-gray-50">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] font-bold text-[#1473E6]">Tiến độ học tập</span>
                <span className="text-[12px] font-bold text-[#1473E6]">60%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-[8px] relative overflow-hidden">
                <div 
                  className="bg-[#1473E6] h-full rounded-full transition-all duration-500" 
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hàng 2: Tài liệu gợi ý */}
      <div className="bg-white border border-[#E4E4E7] rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.1)] w-full">
        <div className="p-[24px_24px_12px]">
          <h2 className="text-[16px] font-bold text-[#09090B]">Tài liệu gợi ý</h2>
        </div>
        <div className="p-[0px_24px_24px] grid grid-cols-4 gap-4">
          {['Lịch sử Việt Nam', 'Chiến tranh thế giới', 'Kháng chiến chống Mỹ', 'Giải phóng miền nam'].map((item, i) => (
            <div key={i} className="border border-[#E4E4E7] rounded-[12px] p-4 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-[14px] font-medium text-[#09090B] leading-tight">{item}</span>
                <FileText size={18} className="text-gray-400 shrink-0" />
              </div>
              <button className="bg-[#47ED70] hover:bg-[#3edb65] text-white text-[13px] font-bold py-1.5 rounded-[6px] w-[70px] transition-colors">
                Xem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hàng 3: Hoạt động & Bài kiểm tra */}
      <div className="flex flex-row gap-4 w-full items-start mb-10">
        {/* Hoạt động gần đây */}
        <div className="flex-[2] bg-white border border-[#E4E4E7] rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
          <div className="p-[16px_24px] border-b border-[#F4F4F5]">
            <h2 className="text-[16px] font-bold text-[#09090B]">Hoạt động gần đây</h2>
          </div>
          <div className="p-2 flex flex-col gap-1">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex justify-between items-center p-3 rounded-[10px] hover:bg-[#F9FAFB] transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: act.bg }}>
                    {act.type === 'document' && <FileText size={20} color={act.color} />}
                    {act.type === 'quiz' && <BookOpen size={20} color={act.color} />}
                    {act.type === 'report' && <Wrench size={20} color={act.color} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#111827]">{act.title}</p>
                    <p className="text-[12px] text-[#6B7280]">{act.sub}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#9CA3AF] font-medium">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bài kiểm tra đã làm */}
        <div className="flex-1 bg-white border border-[#E4E4E7] rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.1)]">
          <div className="p-[16px_24px] border-b border-[#F4F4F5]">
            <h2 className="text-[14px] font-bold text-[#09090B]">Bài kiểm tra đã làm</h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { name: "Công Phúc", phone: "0934970856", time: "14:00 05/11/2025", score: "10/10" },
              { name: "Công Phúc", phone: "0934970856", time: "15:30 04/11/2025", score: "9/10" },
              { name: "Công Phúc", phone: "0934970856", time: "09:15 04/11/2025", score: "8/10" }
            ].map((test, i) => (
              <div key={i} className="bg-[#EDF4FF] border-l-[4px] border-[#3B82F6] p-3 rounded-r-lg flex justify-between items-center">
                <div>
                  <p className="text-[13px] font-bold text-[#1E3A8A]">{test.name}</p>
                  <p className="text-[11px] text-[#6B7280]">{test.phone}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-1">{test.time}</p>
                </div>
                <span className="text-[#3B82F6] font-extrabold text-[15px]">{test.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LearnerDashboard;