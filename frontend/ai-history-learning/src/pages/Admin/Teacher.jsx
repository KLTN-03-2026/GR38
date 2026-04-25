import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import {
  ClipboardList,
  BookOpen,
  LayoutGrid,
  AlertTriangle,
  FileText,
  PenLine,
  Wrench,
  CreditCard,
  Users,
  GraduationCap,
  Download,
  Trophy,
  Medal,
  Plus,
  Zap,
} from "lucide-react";

const API = "http://localhost:8000/api/v1";

const activities = [
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

const rankColors = ["#F59E0B", "#9CA3AF", "#CD7C2F"];

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
    let start = 0;
    const step = Math.ceil(raw / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= raw) {
        setVal(raw.toLocaleString("vi-VN"));
        clearInterval(timer);
      } else setVal(start.toLocaleString("vi-VN"));
    }, 30);
    return () => clearInterval(timer);
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

  const [docCount, setDocCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // Lấy tên giáo viên từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    const fetchStats = async () => {
      try {
        const [docRes, flashRes] = await Promise.all([
          api.get("/documents"),
          api.get("/flashcards"),
        ]);

        setDocCount(docRes.data.count ?? docRes.data.data?.length ?? 0);
        setFlashcardCount(
          flashRes.data.count ?? flashRes.data.data?.length ?? 0,
        );
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const stats = [
    {
      label: "Tổng bài TestQuiz",
      value: loading ? "..." : String(quizCount),
      Icon: ClipboardList,
      color: "#F26739",
      bg: "#FFF3EE",
      trend: "+12%",
    },
    {
      label: "Tổng tài liệu",
      value: loading ? "..." : String(docCount),
      Icon: BookOpen,
      color: "#1473E6",
      bg: "#EEF4FF",
      trend: "+5%",
    },
    {
      label: "FlashCard",
      value: loading ? "..." : String(flashcardCount),
      Icon: LayoutGrid,
      color: "#0EA472",
      bg: "#EEFAF5",
      trend: "+8%",
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
        background: "#F5F6FA",
        padding: "32px 28px",
      }}
    >
      <style>{`
        .stat-card { transition: transform .25s, box-shadow .25s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.10) !important; }
        .act-row { transition: background .2s; }
        .act-row:hover { background: #F5F6FA; }
        .export-btn { transition: background .2s, transform .15s; }
        .export-btn:hover { background: #d9562d; transform: scale(1.03); }
        .rank-card { transition: transform .2s; }
        .rank-card:hover { transform: translateX(4px); }
      `}</style>

      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              color: "#9CA3AF",
              fontWeight: 500,
              marginBottom: 4,
              letterSpacing: ".04em",
            }}
          >
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#111827",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {greeting},{" "}
            <span style={{ color: "#F26739" }}>
              {user.fullName ?? "Giáo viên"}
            </span>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginTop: 4,
              fontWeight: 400,
            }}
          >
            Đây là tổng quan hoạt động hôm nay của bạn.
          </p>
        </div>
        <button
          className="export-btn"
          style={{
            background: "#F26739",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(242,103,57,.35)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Download size={15} strokeWidth={2.5} /> Xuất báo cáo
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginBottom: 24,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "22px 20px",
              boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: s.color,
                borderRadius: "18px 18px 0 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <s.Icon size={20} color={s.color} strokeWidth={2} />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#10B981",
                  background: "#ECFDF5",
                  padding: "3px 9px",
                  borderRadius: 20,
                }}
              >
                {s.trend}
              </span>
            </div>
            <p
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 4px",
              }}
            >
              <AnimatedNumber target={s.value} />
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── STUDENT OVERVIEW ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginBottom: 24,
        }}
      >
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
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: `linear-gradient(135deg, ${item.color}18 0%, #fff 60%)`,
              border: `1.5px solid ${item.color}22`,
              borderRadius: 18,
              padding: "24px 26px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 2px 12px rgba(0,0,0,.05)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: item.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 6px 18px ${item.color}55`,
              }}
            >
              <item.Icon size={26} color="#fff" strokeWidth={1.8} />
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  margin: "0 0 4px",
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#111827",
                  margin: "0 0 2px",
                }}
              >
                <AnimatedNumber target={item.value} />
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: item.color,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                ● {item.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM: ACTIVITY + RANKING ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}
      >
        {/* Activity Feed */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Zap size={16} color="#F26739" strokeWidth={2.5} /> Hoạt động gần
              đây
            </h2>
            <span
              style={{
                fontSize: 12,
                color: "#1473E6",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Xem tất cả →
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {activities.map((act, i) => (
              <div
                key={i}
                className="act-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 10px",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: act.color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <act.Icon size={18} color={act.color} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1F2937",
                      margin: "0 0 2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {act.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
                    {act.subtitle}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#D1D5DB",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Trophy size={16} color="#F59E0B" strokeWidth={2.5} /> Xếp hạng
              bài kiểm tra
            </h2>
            <span
              style={{
                fontSize: 12,
                color: "#1473E6",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Chi tiết →
            </span>
          </div>

          {/* Không có API rankings → giữ data tĩnh */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                name: "Công Phúc",
                phone: "0934970856",
                time: "14:00 05/11/2025",
                score: 10,
              },
              {
                name: "Nguyễn Toàn Chung",
                phone: "0934970856",
                time: "14:00 05/11/2025",
                score: 9,
              },
              {
                name: "Nguyễn Tấn Anh",
                phone: "0934970856",
                time: "14:00 05/11/2025",
                score: 8.5,
              },
            ].map((r, i) => (
              <div
                key={i}
                className="rank-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background:
                    i === 0
                      ? "linear-gradient(135deg, #FEF3C7, #FFFBEB)"
                      : "#F9FAFB",
                  border:
                    i === 0 ? "1.5px solid #F59E0B44" : "1.5px solid #F3F4F6",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: rankColors[i] + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Medal size={17} color={rankColors[i]} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111827",
                      margin: "0 0 2px",
                    }}
                  >
                    {r.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                    {r.phone} · {r.time}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: rankColors[i],
                    }}
                  >
                    {r.score}
                  </span>
                  <p style={{ fontSize: 10, color: "#D1D5DB", margin: 0 }}>
                    /10
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mini CTA */}
          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #F26739, #f9a87e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 0 2px",
                }}
              >
                Tạo bài kiểm tra mới
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.8)",
                  margin: 0,
                }}
              >
                Thêm câu hỏi cho học sinh
              </p>
            </div>
            <button
              onClick={() => navigate("/teacher/quizzes")}
              style={{
                background: "rgba(255,255,255,.25)",
                border: "1.5px solid rgba(255,255,255,.5)",
                color: "#fff",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Tạo ngay{" "}
              <Plus
                size={13}
                strokeWidth={3}
                style={{ display: "inline", marginLeft: 2 }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}