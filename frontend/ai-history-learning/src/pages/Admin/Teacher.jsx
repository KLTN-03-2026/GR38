import { useNavigate } from "react-router-dom";
const stats = [
  { label: "Tổng bài TestQuiz", value: "450,000,000", icon: "📋" },
  { label: "Tổng tài liệu",     value: "500",          icon: "📱" },
  { label: "FlashCard",          value: "510",          icon: "🗒️" },
  { label: "Sự cố đã báo cáo",  value: "0",            icon: "⚠️" },
];
const activities = [
  { icon: "📄", iconBg: "bg-green-100",  title: "Update tài liệu",                 subtitle: "Chiến tranh giải phóng miền Nam", time: "5 phút trước" },
  { icon: "📝", iconBg: "bg-blue-100",   title: "Cập nhật danh sách bài kiểm tra", subtitle: "Kháng chiến chống Mỹ",           time: "5 phút trước" },
  { icon: "🔧", iconBg: "bg-orange-100", title: "Báo cáo sự cố",                   subtitle: "Không Chat AI được",             time: "5 phút trước" },
];
const rankings = [
  { name: "Công Phúc",         phone: "0934970856", time: "14:00 05/11/2025", score: "10/10",  highlight: true  },
  { name: "Nguyễn Toàn Chung", phone: "0934970856", time: "14:00 05/11/2025", score: "9/10",   highlight: false },
  { name: "Nguyễn Tấn Anh",   phone: "0934970856", time: "14:00 05/11/2025", score: "8,5/10", highlight: false },
];
export default function Dashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trang chủ</h1>
        <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Xuất báo cáo
        </button>
      </div>
      {/* Stats 4 cột */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <span>{stat.label}</span>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
      {/* Stats 2 cột */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between text-gray-400 text-sm mb-2">
            <span>Tổng học sinh</span>
            <span className="text-lg">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">1.048.588.576</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between text-gray-400 text-sm mb-2">
            <span>Tổng học sinh làm bài kiểm tra</span>
            <span className="text-lg">👨‍🎓</span>
          </div>
          <p className="text-3xl font-bold text-green-500">11.550.447</p>
        </div>
      </div>
      {/* Hoạt động + Xếp hạng */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Hoạt động gần đây</h2>
          <div className="flex flex-col gap-3">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${act.iconBg} flex items-center justify-center text-base flex-shrink-0`}>
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{act.title}</p>
                  <p className="text-xs text-gray-500">{act.subtitle}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Xếp hạng bài kiểm tra</h2>
          <div className="flex flex-col gap-2">
            {rankings.map((r, i) => (
              <div key={i} className={`rounded-lg p-3 ${r.highlight ? "bg-blue-500 text-white" : "bg-blue-50 text-gray-700"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-semibold text-sm ${r.highlight ? "text-white" : "text-gray-800"}`}>{r.name}</p>
                    <p className={`text-xs mt-0.5 ${r.highlight ? "text-blue-100" : "text-gray-500"}`}>{r.phone}</p>
                    <p className={`text-xs ${r.highlight ? "text-blue-100" : "text-gray-400"}`}>{r.time}</p>
                  </div>
                  <span className={`text-sm font-bold ${r.highlight ? "text-white" : "text-blue-500"}`}>{r.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}