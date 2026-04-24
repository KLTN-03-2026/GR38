import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Calendar, Users, BookOpen, Star, DollarSign } from 'lucide-react';
import api from "../../lib/api"; // Đã sửa đường dẫn import đúng cấu trúc src/

const TienDo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. FAKE DATA: Sau này chỉ cần thay nội dung trong useEffect bằng việc gọi API
  const fakeData = {
    stats: [
      { id: 1, label: "Tổng ngày học", value: "365 Ngày", icon: <DollarSign size={20}/>, color: "text-gray-400" },
      { id: 2, label: "Tổng bài hoàn thành", value: "2350", sub: "+180.1% so với tháng vừa rồi", icon: <BookOpen size={20}/>, color: "text-gray-400" },
      { id: 3, label: "Chuỗi ngày học", value: "12", icon: <Users size={20}/>, color: "text-gray-400" },
      { id: 4, label: "Điểm trung bình", value: "8,5", icon: <Users size={20}/>, color: "text-gray-400" },
    ],
    chartData: [
      { name: 'T1', value: 1400 }, { name: 'T2', value: 4800 }, { name: 'T3', value: 2400 },
      { name: 'T4', value: 5100 }, { name: 'T5', value: 1800 }, { name: 'T6', value: 1500 },
      { name: 'T7', value: 5200 }, { name: 'T8', value: 4000 }, { name: 'T9', value: 1000 },
      { name: 'T10', value: 3200 }, { name: 'T11', value: 1800 }, { name: 'T12', value: 5200 },
    ],
    completedLessons: [
      { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@email.com", lesson: "Kháng chiến chống mỹ" },
      { id: 2, name: "Nguyễn Văn A", email: "nguyenvana@email.com", lesson: "Chiến tranh giải phóng miền Nam" },
      { id: 3, name: "Nguyễn Văn A", email: "nguyenvana@email.com", lesson: "Kháng chiến chống Pháp" },
      { id: 4, name: "Nguyễn Văn A", email: "nguyenvana@email.com", lesson: "Nạn đói năm 1945" },
      { id: 5, name: "Nguyễn Văn A", email: "nguyenvana@email.com", lesson: "Bác Hồ đọc bản tuyên ngôn độc lập" },
    ]
  };

  useEffect(() => {
    // Giả lập gọi API
    const timer = setTimeout(() => {
      setData(fakeData);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải tiến độ...</div>;

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tiến độ</h1>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">
          <Calendar size={16} />
          <span>Ngày 16 Tháng 3 Năm 2026</span>
        </div>
      </div>

      {/* 4 Thẻ thống kê top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {data.stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 relative">
            <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            {stat.sub && <p className="text-[10px] text-green-500 mt-1 font-medium">{stat.sub}</p>}
            <div className="absolute top-6 right-6 text-gray-300">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Biểu đồ bên trái */}
        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Tổng quan 1 năm học</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={35}>
                  {data.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#4ADE80" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Danh sách bài hoàn thành bên phải */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Các bài đã hoàn thành</h3>
            <p className="text-xs text-gray-400">Có {data.completedLessons.length} bài hoàn thành</p>
          </div>
          
          <div className="space-y-6">
            {data.completedLessons.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${item.name}&background=random`} alt="avatar" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.email}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-700 text-right max-w-[150px]">
                  {item.lesson}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TienDo;