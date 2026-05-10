import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Calendar, BookOpen, Activity, GraduationCap, Clock } from 'lucide-react';
import api from "../../lib/api.js";

const TienDo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

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
        // Gọi song song Dashboard và History
        const [dashRes, historyRes] = await Promise.all([
          api.get("/progress/dashboard"),
          api.get("/quizzes/my-history")
        ]);
        
        if (dashRes.data.success) {
          const apiData = dashRes.data.data;
          const historyData = historyRes.data?.data || [];

          // Đảm bảo lấy đúng các trường từ overview trong response API của bạn
          const formattedData = {
            stats: [
              { 
                id: 1, 
                label: "Tổng ngày học", 
                value: `${apiData.overview?.totalStudyDays || 0} Ngày`, 
                icon: <Calendar size={18}/> 
              },
              { 
                id: 2, 
                label: "Bài hoàn thành", 
                value: (apiData.overview?.completedQuizzes || 0).toLocaleString(), 
                sub: "Tổng Quizzes", 
                icon: <BookOpen size={18}/> 
              },
              { 
                id: 3, 
                label: "Chuỗi ngày", 
                value: `${apiData.overview?.studyStreak || 0} Ngày`, 
                sub: "Học liên tục", 
                icon: <Activity size={18}/> 
              },
              { 
                id: 4, 
                label: "Điểm trung bình", 
                value: apiData.overview?.averageScore || 0, 
                icon: <GraduationCap size={18}/> 
              },
            ],
            chartData: (apiData.chartData || []).map(item => ({
              name: item.month,
              value: item.exercises
            })),
            completedLessons: (apiData.recent?.quizzes || []).map((quiz, index) => {
              const detailedQuiz = historyData.find(h => h.id === quiz.id || h.quizId === quiz.id);
              
              return {
                id: quiz.id || index,
                name: "Học viên",
                email: `Điểm số: ${quiz.score}`,
                lesson: quiz.title,
                image: quiz.image || quiz.thumbnail || detailedQuiz?.quiz?.image || null, 
                date: new Date(quiz.createdAt).toLocaleDateString('vi-VN')
              };
            })
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-3"></div>
      <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
    </div>
  );

  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="p-4 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Tiến độ</h1>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-[#f26739]">
              <Clock size={14} />
              <span>{currentDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'})}</span>
            </div>
            <div className="w-[1px] h-3 bg-gray-200"></div>
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <Calendar size={14} />
              <span>{currentDateTime.toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {data.stats.map((stat) => (
            <div key={stat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-gray-800">{stat.value}</h3>
              {stat.sub && <p className="text-[9px] text-green-500 font-bold">{stat.sub}</p>}
              <div className="absolute -top-1 -right-1 p-4 text-gray-50 opacity-50 bg-gray-50 rounded-bl-3xl">{stat.icon}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Chart */}
          <div className="col-span-12 lg:col-span-7 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Hoạt động học tập</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} allowDecimals={false} domain={[0, 'dataMax + 2']}/>
                  <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px'}} formatter={(value) => [value, "Bài làm"]}/>
                  <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={28}>
                    {data.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill="#4ADE80" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent History */}
          <div className="col-span-12 lg:col-span-5 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Bài làm mới nhất</h3>
            </div>
            
            <div className="space-y-4">
              {data.completedLessons.length > 0 ? data.completedLessons.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center overflow-hidden border border-orange-100">
                      {item.image ? (
                        <img src={item.image} alt={item.lesson} className="w-full h-full object-cover" />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${item.lesson}&background=fef3c7&color=f59e0b`} alt="avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-800 line-clamp-1 group-hover:text-[#f26739] transition-colors">{item.lesson}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.email} • {item.date}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Hoàn Thành</div>
                </div>
              )) : (
                <div className="py-10 text-center">
                   <p className="text-gray-400 text-xs font-bold uppercase italic">Chưa có lịch sử</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TienDo;