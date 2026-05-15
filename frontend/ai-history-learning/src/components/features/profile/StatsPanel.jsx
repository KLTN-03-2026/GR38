import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FileText, PenLine, CreditCard, Zap } from "lucide-react";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "Vừa xong";
  if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function getActivityMeta(actionType, targetType) {
  const typeMap = {
    DOCUMENT:  { Icon: FileText,   color: "bg-orange-50",  text: "text-[#F26739]"  },
    QUIZ:      { Icon: PenLine,    color: "bg-blue-50",    text: "text-blue-500"   },
    FLASHCARD: { Icon: CreditCard, color: "bg-purple-50",  text: "text-purple-500" },
  };
  const actionMap = { CREATE: "Tạo mới", UPDATE: "Cập nhật", DELETE: "Xóa" };
  const { Icon, color, text } = typeMap[targetType] ?? { Icon: Zap, color: "bg-gray-50", text: "text-gray-400" };
  const action = actionMap[actionType] ?? actionType;
  const label  = { DOCUMENT: "Tài liệu", QUIZ: "Bài kiểm tra", FLASHCARD: "Flashcard" }[targetType] ?? targetType;
  return { Icon, color, text, title: `${action} ${label}` };
}

export default function StatsPanel() {
  const [stats, setStats]           = useState({ docs: 0, quizzes: 0, flashcards: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [docRes, quizRes, flashRes, actRes] = await Promise.all([
          api.get("/documents"),
          api.get("/quizzes/my-quizzes"),
          api.get("/flashcards"),
          api.get("/activities"),
        ]);
        setStats({
          docs:       docRes.data.count   ?? docRes.data.data?.length   ?? 0,
          quizzes:    quizRes.data.count  ?? quizRes.data.data?.length  ?? 0,
          flashcards: flashRes.data.count ?? flashRes.data.data?.length ?? 0,
        });
        const rawAct = actRes.data?.data ?? actRes.data ?? [];
        setActivities(rawAct.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const STAT_ITEMS = [
    { label: "Tài liệu",  value: stats.docs       },
    { label: "Bài Quiz",  value: stats.quizzes    },
    { label: "Flashcard", value: stats.flashcards },
  ];

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      {/* Thống kê */}
      <div className="p-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Thống kê
        </p>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {STAT_ITEMS.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: "rgba(242, 103, 57, 0.05)",
                  border: "1px solid rgba(242, 103, 57, 0.1)",
                }}
              >
                <p className="text-[11px] text-gray-400 mb-1.5 leading-none">{label}</p>
                <p className="text-2xl font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Hoạt động gần đây */}
      <div className="p-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Hoạt động gần đây
        </p>
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Chưa có hoạt động nào</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((act, i) => {
              const { Icon, color, text, title } = getActivityMeta(act.actionType, act.targetType);
              return (
                <div
                  key={act._id ?? i}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <Icon size={14} className={text} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate leading-snug">{title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{act.targetName}</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">{formatTime(act.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}