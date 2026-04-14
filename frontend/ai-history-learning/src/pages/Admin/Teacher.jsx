import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Tổng bài TestQuiz", value: "450,000,000", icon: "📋", color: "bg-orange-50 text-orange-600" },
  { label: "Tổng tài liệu",     value: "500",          icon: "📁", color: "bg-blue-50 text-blue-600" },
  { label: "FlashCard",          value: "510",          icon: "🗒️", color: "bg-purple-50 text-purple-600" },
  { label: "Sự cố đã báo cáo",  value: "0",            icon: "⚠️", color: "bg-red-50 text-red-500" },
];

const activities = [
  { icon: "📄", iconBg: "bg-green-100", title: "Update tài liệu", subtitle: "Chiến tranh giải phóng miền Nam", time: "5 phút trước" },
  { icon: "📝", iconBg: "bg-blue-100",  title: "Cập nhật bài kiểm tra", subtitle: "Kháng chiến chống Mỹ", time: "10 phút trước" },
  { icon: "🔧", iconBg: "bg-orange-100",title: "Báo cáo sự cố", subtitle: "Không Chat AI được", time: "15 phút trước" },
];

const rankings = [
  { rank: 1, name: "Công Phúc",         phone: "0934970856", time: "14:00 05/11/2025", score: "10/10"  },
  { rank: 2, name: "Nguyễn Toàn Chung", phone: "0934970856", time: "14:00 05/11/2025", score: "9/10"   },
  { rank: 3, name: "Nguyễn Tấn Anh",   phone: "0934970856", time: "14:00 05/11/2025", score: "8.5/10" },
];

const rankColors = [
  "bg-yellow-400 text-yellow-900",
  "bg-slate-300 text-slate-700",
  "bg-orange-300 text-orange-900",
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trang chủ</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tổng quan hoạt động giảng dạy</p>
        </div>
        <button className="flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất báo cáo
        </button>
      </div>

      {/* Stats 4 cột */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Stats 2 cột */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-100">Tổng học sinh</span>
            <span className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">👥</span>
          </div>
          <p className="text-3xl font-bold tracking-tight">1,048,588</p>
          <p className="text-xs text-blue-200 mt-1">học sinh đã đăng ký</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-green-100">Tổng học sinh làm bài</span>
            <span className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">👨‍🎓</span>
          </div>
          <p className="text-3xl font-bold tracking-tight">11,550,447</p>
          <p className="text-xs text-green-200 mt-1">lượt nộp bài kiểm tra</p>
        </div>
      </div>

      {/* Hoạt động + Xếp hạng */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hoạt động */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Hoạt động gần đây</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Hôm nay</span>
          </div>
          <div className="space-y-4">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${act.iconBg} flex items-center justify-center text-base flex-shrink-0`}>
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{act.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{act.subtitle}</p>
                </div>
                <span className="text-xs text-gray-300 whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Xếp hạng */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Xếp hạng bài kiểm tra</h2>
            <span className="text-xs text-[#F26739] bg-orange-50 px-2.5 py-1 rounded-full font-medium">Top 3</span>
          </div>
          <div className="space-y-3">
            {rankings.map((r, i) => (
              <div key={i} className={`rounded-xl p-3.5 flex items-center gap-3 ${i === 0 ? "bg-orange-50 border border-orange-100" : "bg-gray-50"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankColors[i]}`}>
                  {r.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.time}</p>
                </div>
                <span className={`text-sm font-bold ${i === 0 ? "text-[#F26739]" : "text-gray-600"}`}>{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}