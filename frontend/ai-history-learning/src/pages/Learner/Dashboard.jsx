import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../../services/dashboardService';

const LearnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setStats(data);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-medium text-blue-600 animate-pulse">
          Đang tải dữ liệu từ hệ thống...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Người Học</h1>
        <div className="flex items-center gap-2">
           <span className="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
           <span className="text-sm font-medium text-green-600">Dữ liệu trực tuyến</span>
        </div>
      </div>
      
      {/* Tiến độ học tập */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600 font-medium">Tiến độ hoàn thành</span>
          <span className="text-blue-600 font-bold">{stats?.learningProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-1000" 
            style={{ width: `${stats?.learningProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông báo */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-700">🔔 Thông báo</h2>
          <div className="space-y-3">
            {stats?.notifications?.map((note, index) => (
              <div key={index} className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border-l-4 border-blue-500">
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Tài liệu gợi ý */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-700">📚 Tài liệu gợi ý</h2>
          <div className="space-y-2">
            {stats?.suggestedDocs?.map((doc, index) => (
              <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors border-b border-gray-50 last:border-0">
                <span className="text-blue-500 mr-3 font-bold">0{index + 1}</span>
                <span className="text-gray-700">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;