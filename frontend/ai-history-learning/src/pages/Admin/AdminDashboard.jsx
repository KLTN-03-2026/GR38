import React from "react";
import {
  FileText,
  BookOpen,
  UserCheck,
  GraduationCap,
  DollarSign,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";

// Component con để hiển thị các thẻ số liệu
const StatCard = ({ label, value, detail, icon: Icon }) => (
  <div className="flex-1 min-w-[200px] p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <Icon className="w-4 h-4 text-slate-400" />
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {detail && (
        <p className="text-[12px] text-[#F26739] font-medium">{detail}</p>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const yAxis = [
    { val: "6000", top: "0%" },
    { val: "4500", top: "22%" },
    { val: "3000", top: "44%" },
    { val: "1500", top: "66%" },
    { val: "0", top: "88%" },
  ];

  const students = [
    {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      issue: "Không nộp bài được",
    },
    {
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
      issue: "Không tải file PFD được",
    },
    {
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      issue: "Không làm bài kiểm tra được",
    },
    {
      name: "William Kim",
      email: "will@email.com",
      issue: "Không chat với AI Được",
    },
    {
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
      issue: "Không làm testQuiz được",
    },
  ];

  return (
    <div className="p-8">
      {/* Dashboard Title & Actions */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Trang chủ thống kê
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white shadow-sm">
            <CalendarIcon size={16} /> Ngày 16 Tháng 3 Năm 2026
          </div>
          <button className="bg-[#F26739] hover:bg-[#d9562d] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all">
            Tải Excel
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <StatCard label="Tổng tài khoản" value="45,231.89" icon={DollarSign} />
        <StatCard
          label="Tổng tài liệu"
          value="2350"
          detail="+180.1% so với tháng vừa rồi"
          icon={FileText}
        />
        <StatCard label="Tổng giáo viên" value="12" icon={UserCheck} />
        <StatCard
          label="Tổng học sinh"
          value="573,444.5"
          icon={GraduationCap}
        />
        <StatCard
          label="Tổng số bài quiz"
          value="2,055,886,285"
          detail="+180.1% so với tháng vừa rồi"
          icon={BookOpen}
        />
      </div>

      {/* Charts & Issues Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Chart Area */}
        <div className="md:col-span-7 p-6 border border-slate-200 shadow-sm rounded-xl bg-white">
          <p className="text-base font-semibold text-slate-900 mb-10">
            Tổng quan số lượng học sinh đăng ký tài khoản
          </p>
          <div className="relative h-[300px] w-full">
            {yAxis.map((y) => (
              <span
                key={y.val}
                className="absolute right-[93%] text-right text-[12px] text-slate-400"
                style={{ top: y.top }}
              >
                {y.val}
              </span>
            ))}
            <div className="absolute left-[10%] right-0 bottom-[10%] top-[5%] flex items-end justify-between border-l border-b border-slate-100">
              {[0.6, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 0.4, 0.8, 0.6, 0.7].map(
                (h, i) => (
                  <div
                    key={i}
                    className="w-[6%] bg-[#47ED70] rounded-t-[4px] hover:bg-[#3cd663] transition-colors"
                    style={{ height: `${h * 100}%` }}
                  />
                ),
              )}
            </div>
            <div className="absolute left-[10%] right-0 top-[92%] flex justify-between text-[12px] text-slate-400">
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

        {/* Issues Area */}
        <div className="md:col-span-5 p-6 border border-slate-200 rounded-xl bg-white shadow-sm">
          <div className="mb-8">
            <p className="text-[15px] font-semibold text-slate-900">
              Sự cố năm vừa rồi
            </p>
            <p className="text-sm text-slate-500">Có 255 sự cố</p>
          </div>
          <div className="space-y-6">
            {students.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-slate-500">{item.email}</p>
                  </div>
                </div>
                <p className="text-[12px] font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded">
                  {item.issue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
