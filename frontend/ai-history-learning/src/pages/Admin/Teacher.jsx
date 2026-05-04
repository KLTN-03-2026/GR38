import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import {
  ClipboardList,
  BookOpen,
  LayoutGrid,
  FileText,
  PenLine,
  CreditCard,
  Users,
  GraduationCap,
  Download,
  Trophy,
  Medal,
  Plus,
  Zap,
} from "lucide-react";

const ACTIVITIES = [
  {
    Icon: FileText,
    color: "#0EA472",
    title: "Update tài liệu",
    subtitle: "Chiến tranh giải phóng miền Nam",
    time: "5 phút trước",
  },
  {
    Icon: PenLine,
    color: "#1473E6",
    title: "Cập nhật danh sách bài kiểm tra",
    subtitle: "Kháng chiến chống Mỹ",
    time: "12 phút trước",
  },
  {
    Icon: CreditCard,
    color: "#8B5CF6",
    title: "Thêm bộ Flashcard mới",
    subtitle: "Thời kỳ Bắc thuộc",
    time: "1 giờ trước",
  },
];

const RANKS = [
  { name: "Công Phúc", score: 10 },
  { name: "Nguyễn Toàn Chung", score: 9 },
  { name: "Nguyễn Tấn Anh", score: 8.5 },
];
const RANK_COLORS = ["#F59E0B", "#9CA3AF", "#CD7C2F"];

function getUserName() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.fullName ?? u.name ?? "Giáo viên";
  } catch {
    return "Giáo viên";
  }
}

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const raw =
      typeof target === "number"
        ? target
        : parseFloat(String(target).replace(/,/g, "")) || 0;
    if (!raw) {
      setVal(target);
      return;
    }
    let cur = 0;
    const step = Math.ceil(raw / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= raw) {
        setVal(raw.toLocaleString("vi-VN"));
        clearInterval(t);
      } else setVal(cur.toLocaleString("vi-VN"));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val}</span>;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  const [userName, setUserName] = useState(getUserName);
  const [docCount, setDocCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
        const [docRes, flashRes, quizRes] = await Promise.all([
          api.get("/documents"),
          api.get("/flashcards"),
          api.get("/quizzes/my-quizzes"),
        ]);
        setDocCount(docRes.data.count ?? docRes.data.data?.length ?? 0);
        setFlashcardCount(
          flashRes.data.count ?? flashRes.data.data?.length ?? 0,
        );
        setQuizCount(quizRes.data.count ?? quizRes.data.data?.length ?? 0);
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    {
      label: "Tổng bài TestQuiz đã tạo",
      value: loading ? "..." : String(quizCount),
      Icon: ClipboardList,
      color: "#F26739",
      bg: "#FFF3EE",
      trend: "+12%",
    },
    {
      label: "Tổng tài liệu đã tạo",
      value: loading ? "..." : String(docCount),
      Icon: BookOpen,
      color: "#1473E6",
      bg: "#EEF4FF",
      trend: "+5%",
    },
    {
      label: "Tổng FlashCard đã tạo",
      value: loading ? "..." : String(flashcardCount),
      Icon: LayoutGrid,
      color: "#0EA472",
      bg: "#EEFAF5",
      trend: "+8%",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-sans">
      <style>{`
        .stat-card:hover  { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.10) !important; }
        .act-row:hover    { background: #F5F6FA; }
        .export-btn:hover { background: #d9562d; transform: scale(1.03); }
        .rank-card:hover  { transform: translateX(4px); }
      `}</style>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-gray-400 font-medium tracking-wide mb-1">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {greeting}, <span className="text-[#F26739]">{userName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đây là tổng quan hoạt động hôm nay của bạn.
          </p>
        </div>
        <button className="export-btn flex items-center gap-2 bg-[#F26739] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all">
          <Download size={15} strokeWidth={2.5} /> Xuất báo cáo
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: s.color }}
            />
            <div className="flex justify-between items-start mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: s.bg }}
              >
                <s.Icon size={20} color={s.color} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {s.trend}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1">
              <AnimatedNumber target={s.value} />
            </p>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* STUDENT OVERVIEW */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          {
            label: "Tổng Người học",
            value: "500",
            Icon: Users,
            color: "#1473E6",
            note: "Đang hoạt động",
          },
          {
            label: "Người học làm bài kiểm tra",
            value: "200",
            Icon: GraduationCap,
            color: "#10B981",
            note: "Trong tháng này",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-5 rounded-2xl p-6 shadow-sm border"
            style={{
              background: `linear-gradient(135deg, ${item.color}18, #fff 60%)`,
              borderColor: item.color + "22",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: item.color,
                boxShadow: `0 6px 18px ${item.color}55`,
              }}
            >
              <item.Icon size={26} color="#fff" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-3xl font-extrabold text-gray-900 mb-0.5">
                <AnimatedNumber target={item.value} />
              </p>
              <p
                className="text-xs font-semibold"
                style={{ color: item.color }}
              >
                ● {item.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVITY + RANKING */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
        {/* Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Zap size={16} color="#F26739" strokeWidth={2.5} /> Hoạt động gần
              đây
            </h2>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer">
              Xem tất cả →
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {ACTIVITIES.map((act, i) => (
              <div
                key={i}
                className="act-row flex items-center gap-3 p-3 rounded-xl transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: act.color + "18" }}
                >
                  <act.Icon size={18} color={act.color} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {act.title}
                  </p>
                  <p className="text-xs text-gray-400">{act.subtitle}</p>
                </div>
                <span className="text-xs text-gray-300 font-medium flex-shrink-0">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={16} color="#F59E0B" strokeWidth={2.5} /> Xếp hạng
              bài kiểm tra
            </h2>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer">
              Chi tiết →
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {RANKS.map((r, i) => (
              <div
                key={i}
                className="rank-card flex items-center gap-3 p-3 rounded-2xl border transition-all"
                style={{
                  background:
                    i === 0
                      ? "linear-gradient(135deg,#FEF3C7,#FFFBEB)"
                      : "#F9FAFB",
                  borderColor: i === 0 ? "#F59E0B44" : "#F3F4F6",
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: RANK_COLORS[i] + "22" }}
                >
                  <Medal size={17} color={RANK_COLORS[i]} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">14:00 05/11/2025</p>
                </div>
                <div className="text-right">
                  <span
                    className="text-lg font-extrabold"
                    style={{ color: RANK_COLORS[i] }}
                  >
                    {r.score}
                  </span>
                  <p className="text-xs text-gray-300">/10</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="mt-5 p-4 rounded-2xl flex items-center justify-between"
            style={{ background: "linear-gradient(135deg,#F26739,#f9a87e)" }}
          >
            <div>
              <p className="text-sm font-bold text-white mb-0.5">
                Tạo bài kiểm tra mới
              </p>
              <p className="text-xs text-white/80">
                Thêm câu hỏi cho người học
              </p>
            </div>
            <button
              onClick={() => navigate("/teacher/quizzes")}
              className="flex items-center gap-1 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/50 bg-white/25"
            >
              Tạo ngay <Plus size={13} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
