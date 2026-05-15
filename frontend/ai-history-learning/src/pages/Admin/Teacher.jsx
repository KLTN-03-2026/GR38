import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import {
  ClipboardList, BookOpen, LayoutGrid, FileText,
  PenLine, CreditCard, Trophy, Medal, Plus, Zap,
} from "lucide-react";

const RANK_COLORS = ["#F59E0B", "#9CA3AF", "#CD7C2F"];

function getActivityMeta(actionType, targetType) {
  const typeMap = {
    DOCUMENT:  { Icon: FileText,   color: "#0EA472", label: "Tài liệu" },
    QUIZ:      { Icon: PenLine,    color: "#1473E6", label: "Bài kiểm tra" },
    FLASHCARD: { Icon: CreditCard, color: "#8B5CF6", label: "Flashcard" },
  };
  const actionMap = {
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
  };
  const { Icon, color, label } = typeMap[targetType] ?? { Icon: Zap, color: "#F26739", label: targetType };
  const action = actionMap[actionType] ?? actionType;
  return { Icon, color, title: `${action} ${label}` };
}

function formatTime(dateStr) {
  if (!dateStr) return "—";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "Vừa xong";
  if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function getUserName() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.fullName ?? u.name ?? "Giáo viên";
  } catch { return "Giáo viên"; }
}

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const raw = typeof target === "number" ? target : parseFloat(String(target).replace(/,/g, "")) || 0;
    if (!raw) { setVal(target); return; }
    let cur = 0;
    const step = Math.ceil(raw / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= raw) { setVal(raw.toLocaleString("vi-VN")); clearInterval(t); }
      else setVal(cur.toLocaleString("vi-VN"));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val}</span>;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const [userName, setUserName]             = useState(getUserName);
  const [docCount, setDocCount]             = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizCount, setQuizCount]           = useState(0);
  const [loading, setLoading]               = useState(true);
  const [topRanks, setTopRanks]             = useState([]);
  const [activities, setActivities]         = useState([]);

  useEffect(() => {
    const onUpdate = () => setUserName(getUserName());
    window.addEventListener("user-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("user-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [docRes, flashRes, quizRes, statsRes, actRes] = await Promise.all([
          api.get("/documents"),
          api.get("/flashcards"),
          api.get("/quizzes/my-quizzes"),
          api.get("/quizzes/statistics"),
          api.get("/activities"),
        ]);

        setDocCount(docRes.data.count ?? docRes.data.data?.length ?? 0);
        setFlashcardCount(flashRes.data.count ?? flashRes.data.data?.length ?? 0);
        setQuizCount(quizRes.data.count ?? quizRes.data.data?.length ?? 0);

        const raw = statsRes.data?.data ?? [];
        const top4 = [...raw]
          .filter((q) => q.score != null)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((q) => ({
            name: q.learnerName ?? q.learnerEmail ?? "Ẩn danh",
            score: q.totalQuestions > 0
              ? parseFloat(((q.score / q.totalQuestions) * 10).toFixed(1))
              : q.score,
            date: q.createdAt
              ? new Date(q.createdAt).toLocaleString("vi-VN", {
                  hour: "2-digit", minute: "2-digit",
                  day: "2-digit", month: "2-digit", year: "numeric",
                })
              : "—",
          }));
        setTopRanks(top4);

        const rawAct = actRes.data?.data ?? actRes.data ?? [];
        setActivities(rawAct.slice(0, 4));
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: "Tổng bài TestQuiz đã tạo", value: loading ? "..." : String(quizCount),     Icon: ClipboardList, color: "#F26739", bg: "#FFF3EE" },
    { label: "Tổng tài liệu đã tạo",     value: loading ? "..." : String(docCount),       Icon: BookOpen,      color: "#1473E6", bg: "#EEF4FF" },
    { label: "Tổng FlashCard đã tạo",    value: loading ? "..." : String(flashcardCount), Icon: LayoutGrid,    color: "#0EA472", bg: "#EEFAF5" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-sans px-8 pt-6">
      <style>{`
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.10) !important; }
        .act-row:hover   { background: #F5F6FA; }
        .cta-btn:hover   { background: #d9562d; transform: scale(1.03); }
        .rank-card:hover { transform: translateX(4px); }
      `}</style>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-gray-400 font-medium tracking-wide mb-1">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {greeting}, <span className="text-[#F26739]">{userName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Đây là tổng quan hoạt động hôm nay của bạn.</p>
        </div>
        <button onClick={() => navigate("/teacher/quizzes")}
          className="cta-btn flex items-center gap-2 bg-[#F26739] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all">
          <Plus size={15} strokeWidth={2.5} /> Tạo bài kiểm tra mới
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="stat-card bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.color }} />
            <div className="flex justify-between items-start mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.Icon size={20} color={s.color} strokeWidth={2} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1"><AnimatedNumber target={s.value} /></p>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ACTIVITY + RANKING */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.1fr 1fr" }}>

        {/* Hoạt động gần đây */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Zap size={16} color="#F26739" strokeWidth={2.5} /> Hoạt động gần đây
            </h2>
          </div>

          <div className="flex flex-col gap-1">
            {loading ? (
              [1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Zap size={28} className="text-gray-200" />
                <p className="text-xs text-gray-400">Chưa có hoạt động nào</p>
              </div>
            ) : (
              activities.map((act, i) => {
                const { Icon, color, title } = getActivityMeta(act.actionType, act.targetType);
                return (
                  <div key={act._id ?? i} className="act-row flex items-center gap-3 p-3 rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: color + "18" }}>
                      <Icon size={18} color={color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
                      <p className="text-xs text-gray-400 truncate">{act.targetName}</p>
                    </div>
                    <span className="text-xs text-gray-300 font-medium flex-shrink-0 whitespace-nowrap">
                      {formatTime(act.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Xếp hạng */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={16} color="#F59E0B" strokeWidth={2.5} /> Xếp hạng bài kiểm tra
            </h2>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer"
              onClick={() => navigate("/teacher/stats")}>
              Chi tiết →
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              [1,2,3].map((i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)
            ) : topRanks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Trophy size={28} className="text-gray-200" />
                <p className="text-xs text-gray-400">Chưa có dữ liệu xếp hạng</p>
              </div>
            ) : (
              topRanks.map((r, i) => (
                <div key={i} className="rank-card flex items-center gap-3 p-3 rounded-2xl border transition-all"
                  style={{
                    background: i === 0 ? "linear-gradient(135deg,#FEF3C7,#FFFBEB)" : "#F9FAFB",
                    borderColor: i === 0 ? "#F59E0B44" : "#F3F4F6",
                  }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: RANK_COLORS[i] + "22" }}>
                    <Medal size={17} color={RANK_COLORS[i]} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                  {/* ✅ Score inline: 7/10 */}
                  <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    <span className="text-lg font-extrabold" style={{ color: RANK_COLORS[i] }}>{r.score}</span>
                    <span className="text-xs font-medium text-gray-300">/10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}