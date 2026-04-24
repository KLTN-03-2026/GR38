import React, { useState, useEffect } from "react";
// Đường dẫn đã sửa để trỏ đúng vào src/lib/api.js
import api from "../../lib/api"; 
import { 
  Bell, 
  BookOpen, 
  FileText, 
  Trophy 
} from "lucide-react";

const LearnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/learner");
        setStats(res?.data?.data || res?.data);
      } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <h1 className="text-3xl font-black text-center text-gray-800 mb-8">Trang chủ</h1>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        
        {/* CỘT TRÁI */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          
          {/* Thông Báo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              Thông Báo <Bell size={18} className="text-gray-400" />
            </h2>
            <div className="space-y-3">
              {stats?.notifications?.length > 0 ? (
                stats.notifications.map((note, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                    <p className="text-sm font-medium">{note}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">Chưa có thông báo mới từ database</p>
              )}
            </div>
          </div>

          {/* Tài liệu gợi ý */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Tài liệu gợi ý</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.suggestedDocs?.length > 0 ? (
                stats.suggestedDocs.map((doc, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-bold text-gray-700">{doc.title || doc}</span>
                      <FileText size={16} className="text-gray-300" />
                    </div>
                    <button className="w-fit px-6 py-1.5 bg-[#4ADE80] text-white text-xs font-bold rounded-lg hover:opacity-90">
                      Xem
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-50 rounded-xl">
                    <p className="text-gray-400 italic text-sm">Chưa có dữ liệu gợi ý tài liệu</p>
                </div>
              )}
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Hoạt động gần đây</h2>
            <div className="space-y-6">
              {stats?.recentActivities?.length > 0 ? (
                stats.recentActivities.map((act, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-lg ${act.type === 'read' ? 'bg-green-50' : 'bg-blue-50'}`}>
                         {act.type === 'read' ? <FileText className="text-green-500" size={20}/> : <BookOpen className="text-blue-500" size={20}/>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{act.title}</p>
                        <p className="text-xs text-gray-400 font-medium">{act.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 italic">{act.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">Chưa có dữ liệu hoạt động từ database</p>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          {/* Lộ trình học */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Lộ trình học cho bạn</h2>
              <FileText size={18} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats?.learningPath?.length > 0 ? (
                stats.learningPath.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-700">Bài {idx + 1}: {item.name}</p>
                    <button className="px-4 py-1.5 bg-[#4ADE80] text-white text-xs font-bold rounded-lg hover:opacity-90">
                      Bắt đầu
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">Chưa có lộ trình học từ database</p>
              )}
            </div>
          </div>

          {/* Bài kiểm tra đã làm */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Bài kiểm tra đã làm</h2>
            <div className="space-y-3">
              {stats?.completedQuizzes?.length > 0 ? (
                stats.completedQuizzes.map((quiz, idx) => (
                  <div key={idx} className="bg-[#EEF2FF] p-4 rounded-xl border border-blue-50 relative overflow-hidden">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#1E40AF]">Công Phúc</span>
                      <span className="text-[10px] text-blue-400 font-bold uppercase">{quiz.phone || '0934970856'}</span>
                      <span className="text-[10px] text-blue-300 italic">{quiz.date}</span>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                      <span className="text-xl font-black text-blue-600 block">{quiz.score}/10</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm text-center py-4">Chưa có kết quả kiểm tra từ database</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;