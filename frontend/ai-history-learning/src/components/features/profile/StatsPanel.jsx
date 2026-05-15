const STATS = [["Tài liệu","6"],["Người học","24"],["Chương","18"],["Bài học","47"]];
const ACTIVITIES = [
  { color: "bg-orange-50", text: "text-[#F26739]", label: "Thêm tài liệu mới",     time: "2 giờ trước",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> },
  { color: "bg-green-50",  text: "text-green-600", label: "Cập nhật chương 2",      time: "Hôm qua",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> },
  { color: "bg-blue-50",   text: "text-blue-600",  label: "Người học mới tham gia", time: "2 ngày trước",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

export default function StatsPanel() {
  return (
    <div className="w-60 space-y-3">
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Thống kê</p>
        <div className="grid grid-cols-2 gap-2">
          {STATS.map(([label, val]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-xl font-medium text-gray-900">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Hoạt động gần đây</p>
        {ACTIVITIES.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
            <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-3.5 h-3.5 ${item.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
            </div>
            <div>
              <p className="text-xs text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}