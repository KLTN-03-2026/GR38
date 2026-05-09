import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import {
  Bell,
  BookOpen,
  FileText,
  Trophy,
  LayoutGrid,
  ClipboardList,
  Clock,
  ChevronRight,
  Zap,
  Medal,
} from "lucide-react";

function getUserInfo() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return { name: u.fullName ?? u.name ?? "Người học", email: u.email ?? "" };
  } catch {
    return { name: "Người học", email: "" };
  }
}

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const raw = typeof target === "number" ? target : parseInt(target) || 0;
    if (!raw) {
      setVal(target ?? 0);
      return;
    }
    let cur = 0;
    const step = Math.ceil(raw / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= raw) {
        setVal(raw);
        clearInterval(t);
      } else setVal(cur);
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val}</span>;
}

const SCORE_COLORS = ["#F59E0B", "#9CA3AF", "#CD7C2F", "#6B7280"];

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";
  const { name } = getUserInfo();

  const [docs, setDocs] = useState([]);
  const [history, setHistory] = useState([]);
  const [flashCount, setFlashCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [docRes, histRes, flashRes] = await Promise.allSettled([
          api.get("/documents"),
          api.get("/quizzes/my-history"),
          api.get("/flashcards"),
        ]);

        if (docRes.status === "fulfilled") {
          const all = docRes.value.data?.data ?? docRes.value.data ?? [];
          if (Array.isArray(all)) {
            const sortedDocs = [...all]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 4);
            setDocs(sortedDocs);
          } else {
            setDocs([]);
          }
        }
        if (histRes.status === "fulfilled") {
          const all = histRes.value.data?.data ?? histRes.value.data ?? [];

          if (Array.isArray(all)) {
            const bestAttemptsMap = new Map();

            for (const item of all) {
              const qId = item.quizId?._id || item.quizId || item.quiz?._id;
              if (!qId) continue;

              const currentBest = bestAttemptsMap.get(qId.toString());
              
              if (!currentBest) {
                 bestAttemptsMap.set(qId.toString(), item);
              } else {
                 const scoreA = currentBest.score ?? 0;
                 const scoreB = item.score ?? 0;
                 
                 if (scoreB > scoreA) {
                    bestAttemptsMap.set(qId.toString(), item);
                 } else if (scoreB === scoreA) {
                    const dateA = new Date(currentBest.createdAt);
                    const dateB = new Date(item.createdAt);
                    if (dateB > dateA) {
                       bestAttemptsMap.set(qId.toString(), item);
                    }
                 }
              }
            }

            const uniqueHistory = Array.from(bestAttemptsMap.values()).sort((a, b) => {
                const scoreA = a.score ?? 0;
                const scoreB = b.score ?? 0;
                if (scoreB !== scoreA) return scoreB - scoreA;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            setHistory(uniqueHistory);
          } else {
            setHistory([]);
          }
        }
        if (flashRes.status === "fulfilled") {
          const all = flashRes.value.data?.data ?? flashRes.value.data ?? [];
          setFlashCount(
            Array.isArray(all) ? all.length : (flashRes.value.data?.count ?? 0),
          );
        }
      } catch (err) {
        console.error("Lỗi tải dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: "Tài liệu", value: docs.length, Icon: BookOpen, color: "#1473E6", bg: "#EEF4FF" },
    { label: "Bài kiểm tra", value: history.length, Icon: ClipboardList, color: "#F26739", bg: "#FFF3EE" },
    { label: "Bộ Flashcard", value: flashCount, Icon: LayoutGrid, color: "#8B5CF6", bg: "#F3F0FF" },
  ];

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-sans pb-6">
      <style>{`
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08) !important; }
        .doc-card:hover  { box-shadow: 0 4px 16px rgba(0,0,0,.06); transform: translateY(-2px); }
        .quiz-row:hover  { background: #F5F6FA; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>

      {/* CONTAINER THU NHỎ LẠI (max-w-6xl) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        
        {/* HEADER GỌN HƠN */}
        <div className="mb-6">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {greeting}, <span className="text-[#F26739]">{name}</span>
          </h1>
        </div>

        {/* STAT CARDS NHỎ HƠN */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="stat-card bg-white rounded-xl p-4 shadow-sm relative overflow-hidden transition-all border border-gray-100">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: s.color }} />
              <div className="flex justify-between items-center mb-1">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                  <s.Icon size={18} color={s.color} strokeWidth={2} />
                </div>
                <p className="text-2xl font-black text-gray-900">
                  <AnimatedNumber target={s.value} />
                </p>
              </div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          
          {/* HÀNG 1: TÀI LIỆU VÀ BÀI KIỂM TRA */}
          <div className="grid gap-6" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
            
            {/* CỘT TRÁI - TÀI LIỆU GỢI Ý */}
            <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col h-full border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Zap size={16} color="#F26739" strokeWidth={2.5} /> Tài liệu gợi ý
                </h2>
                <span onClick={() => navigate("/learner/documents")} className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">
                  Tất cả →
                </span>
              </div>
              {docs.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl flex-1 flex flex-col justify-center">
                  <FileText size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 text-xs">Chưa có tài liệu nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {docs.map((doc, idx) => (
                    <div key={doc._id ?? idx} className="doc-card p-4 border border-gray-100 rounded-xl flex flex-col justify-between transition-all cursor-pointer bg-white" onClick={() => navigate(`/learner/documents/${doc._id}`)}>
                      <div>
                          <div className="flex justify-between items-start mb-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <FileText size={16} className="text-blue-400" />
                              </div>
                              <ChevronRight size={14} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-3">
                              {doc.title}
                          </p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/learner/documents/${doc._id}`); }} className="w-full py-1.5 bg-[#4ADE80] text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition shadow-sm uppercase tracking-wider">
                        Xem ngay
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CỘT PHẢI - BÀI KIỂM TRA ĐÃ LÀM  */}
            <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col border border-gray-100 max-h-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Trophy size={16} color="#F59E0B" strokeWidth={2.5} /> Lịch sử làm bài
                  </h2>
                  <span onClick={() => navigate("/learner/quizzes")} className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">
                    Chi tiết →
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl flex-1 flex flex-col justify-center">
                    <ClipboardList size={28} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-400 text-xs mb-3">Chưa có bài kiểm tra nào</p>
                    <button onClick={() => navigate("/learner/quizzes")} className="px-4 py-1.5 bg-[#F26739] text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition mx-auto shadow-sm uppercase">
                      Làm bài ngay
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {history.map((item, idx) => {
                      const score = item.score ?? 0;
                      const title = item.quizId?.title ?? item.quiz?.title ?? `Bài kiểm tra ${idx + 1}`;
                      const date = item.createdAt;
                      const resultId = item._id;
                      const badgeColor = SCORE_COLORS[idx] || SCORE_COLORS[3];

                      return (
                        <div key={resultId ?? idx} className="quiz-row flex items-center gap-3 p-3 rounded-lg border border-gray-50 cursor-pointer" onClick={() => resultId && navigate(`/learner/quizzes/result/${resultId}`)}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: badgeColor + "15" }}>
                            <Medal size={16} color={badgeColor} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{title}</p>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {date ? new Date(date).toLocaleDateString("vi-VN") : "—"}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black" style={{ color: badgeColor }}>
                              {score}<span className="text-[10px] ml-0.5 opacity-70">đ</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>

          {/* HÀNG 2: THÔNG BÁO VÀ FLASHCARD */}
          <div className="grid gap-6" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
            
            {/* Thông báo */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Bell size={16} className="text-gray-400" /> Thông báo
              </h2>
              <div className="py-6 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
                <p className="text-gray-400 italic text-xs">Chưa có thông báo mới</p>
              </div>
            </div>

            {/* Flashcard Gọn Hơn */}
            <div className="rounded-xl p-5 flex items-center justify-between shadow-md" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
              <div>
                <p className="text-base font-black text-white">Ôn tập Flashcard</p>
                <p className="text-[11px] text-white/80 mt-1">
                  {flashCount} bộ thẻ đang chờ bạn
                </p>
              </div>
              <button onClick={() => navigate("/learner/flashcards")} className="flex items-center gap-1.5 text-white text-[11px] font-bold px-4 py-2 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 transition">
                Học ngay <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}