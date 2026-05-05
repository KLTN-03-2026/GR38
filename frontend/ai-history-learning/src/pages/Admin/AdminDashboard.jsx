import React, { useState, useEffect } from "react";
import LogoHS from "../../assets/logohs.png";
import api from "../../lib/api";
import {
  FileText,
  BookOpen,
  UserCheck,
  GraduationCap,
  Calendar as CalendarIcon,
  Users,
  Loader2,
} from "lucide-react";

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="flex-1 min-w-[200px] p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <Icon className="w-5 h-5 text-[#F26739]" />
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocs: 0,
    totalTeachers: 0,
    totalLearners: 0,
    totalQuizzes: 0,
  });
  const [allReports, setAllReports] = useState([]);
  const [monthlyUserChart, setMonthlyUserChart] = useState(Array(12).fill(0));

  // Logic tính toán trục Y biểu đồ
  const maxVal = Math.max(...monthlyUserChart, 5);
  const yAxisMax = Math.ceil(maxVal / 5) * 5;

  const yAxisLabels = [
    { val: yAxisMax, top: "0%" },
    { val: Math.round(yAxisMax * 0.75), top: "22%" },
    { val: Math.round(yAxisMax * 0.5), top: "44%" },
    { val: Math.round(yAxisMax * 0.25), top: "66%" },
    { val: "0", top: "88%" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Gọi đồng thời các API cần thiết
        const [usersRes, docsRes, reportsRes, quizzesRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/documents"),
          api.get("/reports"),
          api.get("/quizzes/my-quizzes"), // Đảm bảo API này trả về danh sách tất cả các bài quiz
        ]);

        // 1. Phân loại và đếm User
        const allUsers = usersRes.data.data || [];
        const totalTeachers = allUsers.filter(
          (u) => u.role === "TEACHER",
        ).length;
        const totalLearners = allUsers.filter(
          (u) => u.role === "LEARNER",
        ).length;

        // 2. Xử lý dữ liệu biểu đồ tăng trưởng User
        const thisYear = new Date().getFullYear();
        const countsByMonth = Array(12).fill(0);
        allUsers.forEach((user) => {
          const createdAt = new Date(user.createdAt);
          if (!isNaN(createdAt) && createdAt.getFullYear() === thisYear) {
            countsByMonth[createdAt.getMonth()] += 1;
          }
        });

        // 3. Lấy tổng số bài Quiz từ tất cả mọi người
        // Lấy từ trường count (nếu có) hoặc độ dài mảng data
        const totalQuizzesCount =
          quizzesRes.data?.count ?? quizzesRes.data?.data?.length ?? 0;

        setStats({
          totalUsers: allUsers.length,
          totalDocs: docsRes.data.count ?? docsRes.data.data?.length ?? 0,
          totalTeachers,
          totalLearners,
          totalQuizzes: totalQuizzesCount,
        });

        setMonthlyUserChart(countsByMonth);
        setAllReports(reportsRes.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu hệ thống:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-[#F26739] animate-spin" />
        <p className="text-slate-500 font-medium">
          Đang kết nối dữ liệu hệ thống...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Trang chủ thống kê
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Báo cáo tổng hợp từ Admin, Giáo viên và Người học.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white shadow-sm">
            <CalendarIcon size={16} />
            {new Date().toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <StatCard
          label="Tổng tài khoản"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="Tổng tài liệu"
          value={stats.totalDocs.toLocaleString()}
          icon={FileText}
        />
        <StatCard
          label="Tổng giáo viên"
          value={stats.totalTeachers.toLocaleString()}
          icon={UserCheck}
        />
        <StatCard
          label="Tổng người học"
          value={stats.totalLearners.toLocaleString()}
          icon={GraduationCap}
        />
        <StatCard
          label="Tổng bài Quiz"
          value={stats.totalQuizzes.toLocaleString()}
          icon={BookOpen}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Biểu đồ */}
        <div className="lg:col-span-6 p-6 border border-slate-200 shadow-sm rounded-xl bg-white">
          <div className="mb-8">
            <p className="text-base font-semibold text-slate-900">
              Tăng trưởng tài khoản {new Date().getFullYear()}
            </p>
            <p className="text-xs text-slate-400">
              Dữ liệu người dùng mới theo từng tháng
            </p>
          </div>
          <div className="relative h-[300px] w-full">
            {yAxisLabels.map((y) => (
              <span
                key={y.val}
                className="absolute right-[94%] text-right text-[11px] font-bold text-slate-400"
                style={{ top: y.top }}
              >
                {y.val}
              </span>
            ))}
            <div className="absolute left-[8%] right-0 bottom-[10%] top-[5%] flex items-end justify-between border-l border-b border-slate-100 px-2">
              {monthlyUserChart.map((count, i) => {
                const height = (count / yAxisMax) * 100;
                return (
                  <div
                    key={i}
                    className="group relative w-[6%] bg-[#47ED70] rounded-t-sm hover:bg-[#3cd663] transition-all duration-300"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      T{i + 1}: {count} User
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute left-[8%] right-0 top-[92%] flex justify-between text-[11px] font-bold text-slate-400 px-2">
              {[
                "T1",
                "T2",
                "T3",
                "T4",
                "T5",
                "T6",
                "T7",
                "T8",
                "T9",
                "T10",
                "T11",
                "T12",
              ].map((t) => (
                <span key={t} className="w-[6%] text-center">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Báo cáo sự cố */}
        <div className="lg:col-span-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <p className="text-base font-semibold text-slate-900">
              Báo cáo sự cố hệ thống
            </p>
            <p className="text-sm text-slate-500">
              {allReports.length} báo cáo cần xử lý
            </p>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[600px]">
            {allReports.length === 0 ? (
              <div className="flex flex-col items-center py-10 opacity-30">
                <FileText size={40} />
                <p className="text-sm mt-2">Hiện chưa có báo cáo nào</p>
              </div>
            ) : (
              allReports.map((report) => (
                <div
                  key={report._id}
                  className="flex flex-col gap-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 bg-slate-100 shrink-0">
                        <img
                          src={report.reporterId?.profileImage || LogoHS}
                          alt="avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = LogoHS;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {report.reporterId?.fullName || "Ẩn danh"}
                        </p>
                        <p className="text-[10px] text-[#F26739] font-bold uppercase tracking-wider">
                          {report.targetType}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed break-words">
                      {report.description || "Không có mô tả chi tiết."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
