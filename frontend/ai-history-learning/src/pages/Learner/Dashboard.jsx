import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import {
  Bell, BookOpen, FileText, Trophy,
  LayoutGrid, ClipboardList, Clock, ChevronRight,
  Zap, Medal,
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
    if (!raw) { setVal(target ?? 0); return; }
    let cur = 0;
    const step = Math.ceil(raw / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= raw) { setVal(raw); clearInterval(t); }
      else setVal(cur);
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val}</span>;
}

const SCORE_COLORS = ["#F59E0B", "#9CA3AF", "#CD7C2F"];

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const { name } = getUserInfo();

  const [docs, setDocs]         = useState([]);
  const [history, setHistory]   = useState([]);
  const [flashCount, setFlashCount] = useState(0);
  const [loading, setLoading]   = useState(true);

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
            // SẮP XẾP: Mới nhất lên đầu và lấy tối đa 4
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
          setHistory(Array.isArray(all) ? all.slice(0, 5) : []);
        }
        if (flashRes.status === "fulfilled") {
          const all = flashRes.value.data?.data ?? flashRes.value.data ?? [];
          setFlashCount(Array.isArray(all) ? all.length : (flashRes.value.data?.count ?? 0));
        }
      } catch (err) {
        console.error("Lỗi tải dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: "Tài liệu có sẵn",     value: docs.length,    Icon: BookOpen,      color: "#1473E6", bg: "#EEF4FF" },
    { label: "Bài kiểm tra đã làm", value: history.length, Icon: ClipboardList, color: "#F26739", bg: "#FFF3EE" },
    { label: "Bộ Flashcard",         value: flashCount,      Icon: LayoutGrid,    color: "#8B5CF6", bg: "#F3F0FF" },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"/>
      <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] font-sans">
      <style>{`
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.10) !important; }
        .doc-card:hover  { box-shadow: 0 8px 24px rgba(0,0,0,.09); transform: translateY(-2px); }
        .quiz-row:hover  { background: #F5F6FA; }
      `}</style>

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 font-medium tracking-wide mb-1">
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          {greeting}, <span className="text-[#F26739]">{name}</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Hãy tiếp tục hành trình học tập của bạn hôm nay!</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.color }}/>
            <div className="flex justify-between items-start mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.Icon size={20} color={s.color} strokeWidth={2}/>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1">
              <AnimatedNumber target={s.value}/>
            </p>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1.1fr 1fr" }}>

        {/* CỘT TRÁI */}
        <div className="space-y-6">

          {/* Tài liệu gợi ý */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Zap size={16} color="#F26739" strokeWidth={2.5}/> Tài liệu gợi ý
              </h2>
              <span onClick={() => navigate("/learner/documents")}
                className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                Xem tất cả →
              </span>
            </div>
            {docs.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <FileText size={28} className="mx-auto text-gray-200 mb-2"/>
                <p className="text-gray-400 text-sm">Chưa có tài liệu nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {docs.map((doc, idx) => (
                  <div key={doc._id ?? idx}
                    className="doc-card p-4 border border-gray-100 rounded-xl flex flex-col justify-between transition-all cursor-pointer"
                    onClick={() => navigate(`/learner/bai-giang/${doc._id}`)}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={15} className="text-blue-400"/>
                      </div>
                      <ChevronRight size={14} className="text-gray-300"/>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3">{doc.title}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/learner/bai-giang/${doc._id}`);
                      }}
                      className="w-fit px-4 py-1 bg-[#4ADE80] text-white text-xs font-bold rounded-lg hover:opacity-90 transition"
                    >
                      Xem
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thông báo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Bell size={16} className="text-gray-400"/> Thông Báo
            </h2>
            <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <Bell size={24} className="mx-auto text-gray-200 mb-2"/>
              <p className="text-gray-400 italic text-sm">Chưa có thông báo mới</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">

          {/* Bài kiểm tra đã làm */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Trophy size={16} color="#F59E0B" strokeWidth={2.5}/> Bài kiểm tra đã làm
              </h2>
              <span onClick={() => navigate("/learner/quizzes")}
                className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                Chi tiết →
              </span>
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <ClipboardList size={28} className="mx-auto text-gray-200 mb-2"/>
                <p className="text-gray-400 text-sm">Chưa có bài kiểm tra nào</p>
                <button onClick={() => navigate("/learner/quizzes")}
                  className="mt-3 px-4 py-1.5 bg-[#F26739] text-white text-xs font-bold rounded-lg hover:opacity-90 transition">
                  Làm bài ngay
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((item, idx) => {
                  const score = item.score ?? item.result?.score ?? item.totalScore ?? "—";
                  const maxScore = item.maxScore ?? item.result?.maxScore ?? item.totalQuestions ?? 10;
                  const title = item.quizTitle ?? item.quiz?.title ?? `Bài kiểm tra ${idx + 1}`;
                  const date = item.submittedAt ?? item.createdAt;
                  return (
                    <div key={item._id ?? idx}
                      className="quiz-row flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                      onClick={() => item._id && navigate(`/learner/quizzes/result/${item._id}`)}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: (SCORE_COLORS[idx] ?? "#6B7280") + "22" }}>
                        <Medal size={16} color={SCORE_COLORS[idx] ?? "#6B7280"} strokeWidth={2}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10}/> {date ? new Date(date).toLocaleDateString("vi-VN") : "—"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-extrabold" style={{ color: SCORE_COLORS[idx] ?? "#6B7280" }}>
                          {score}
                        </span>
                        <span className="text-xs text-gray-300">/{maxScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA học flashcard */}
          <div className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Ôn tập Flashcard</p>
              <p className="text-xs text-white/80">Có {flashCount} bộ thẻ đang chờ bạn</p>
            </div>
            <button onClick={() => navigate("/learner/flashcards")}
              className="flex items-center gap-1 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/50 bg-white/20 hover:bg-white/30 transition">
              Học ngay <ChevronRight size={13}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}