import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Calendar, Users, BookOpen, Star, DollarSign, Activity, GraduationCap, Clock } from 'lucide-react';
import api from "../../lib/api.js";

const TienDo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State quản lý thời gian thực
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Effect cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/progress/dashboard");
        
        if (response.data.success) {
          const apiData = response.data.data;

          const formattedData = {
            stats: [
              { 
                id: 1, 
                label: "Tổng ngày học", 
                value: `${apiData.overview.totalStudyDays} Ngày`, 
                icon: <Calendar size={20}/> 
              },
              { 
                id: 2, 
                label: "Bài hoàn thành", 
                value: apiData.overview.completedQuizzes.toLocaleString(), 
                sub: "Tổng số Quizzes đã làm", 
                icon: <BookOpen size={20}/> 
              },
              { 
                id: 3, 
                label: "Chuỗi ngày học", 
                value: apiData.overview.studyStreak, 
                icon: <Activity size={20}/> 
              },
              { 
                id: 4, 
                label: "Điểm trung bình", 
                value: apiData.overview.averageScore, 
                icon: <GraduationCap size={20}/> 
              },
            ],
            chartData: apiData.chartData.map(item => ({
              name: item.month,
              value: item.exercises
            })),
            completedLessons: apiData.recent.quizzes.map((quiz, index) => ({
              id: quiz.id || index,
              name: "Học viên",
              email: `Điểm số: ${quiz.score}`,
              lesson: quiz.title,
              date: new Date(quiz.createdAt).toLocaleDateString('vi-VN')
            }))
          };

          setData(formattedData);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu tiến độ:", err);
        setError("Không thể tải dữ liệu tiến độ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
      <p className="text-gray-500 font-medium">Đang tải tiến độ học tập...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center text-red-500 font-bold">
      {error}
    </div>
  );

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tiến độ</h1>
        
        {/* Khu vực hiển thị Ngày + Giờ thực */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#f26739]">
            <Clock size={16} />
            <span>
              {currentDateTime.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </span>
          </div>
          <div className="w-[1px] h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <Calendar size={16} />
            <span>
              {currentDateTime.toLocaleDateString('vi-VN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
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
          <h3 className="text-lg font-bold text-gray-800 mb-6">Tổng quan hoạt động học tập</h3>
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
            <h3 className="text-lg font-bold text-gray-800">Bài làm gần đây</h3>
            <p className="text-xs text-gray-400">Hiển thị lịch sử Quizzes mới nhất</p>
          </div>
          
          <div className="space-y-6">
            {data.completedLessons.length > 0 ? data.completedLessons.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=User&background=random`} alt="avatar" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.lesson}</p>
                    <p className="text-[10px] text-gray-400">{item.email} • {item.date}</p>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">
                  Hoàn thành
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center text-sm">Chưa có lịch sử làm bài.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TienDo;