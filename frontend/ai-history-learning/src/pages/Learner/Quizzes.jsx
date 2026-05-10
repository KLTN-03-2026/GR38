import React, { useState, useEffect } from "react";
import {
  Search, Loader2, ChevronLeft, ChevronRight,
  BookOpen, AlertCircle, Clock, X,
  CheckCircle, XCircle, RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "../../lib/api";
import { quizService } from "@/services/quizService";

// ── Score color ───────────────────────────────────────────────────────────────
const scoreColor = (pct) =>
  pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

// ── Circle (giống teacher) ────────────────────────────────────────────────────
function ScoreCircle({ score, total, size = 48, stroke = 5 }) {
  const pct  = total > 0 ? Math.round((score / total) * 100) : 0;
  const col  = scoreColor(pct);
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize: size * 0.21, fontWeight: 900, color: col }}>{pct}%</span>
      </div>
    </div>
  );
}

// ── History Modal (copy từ teacher HistoryModal) ──────────────────────────────
function HistoryModal({ quiz, onClose, onStartQuiz }) {
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [detail,     setDetail]     = useState(null);
  const [detailLoad, setDetailLoad] = useState(false);
  const quizId = quiz._id;

  useEffect(() => {
    quizService.getMyHistory()
      .then(res => {
        const raw = res.data?.data ?? res.data ?? [];
        const getQId = (h) => typeof h.quizId === "object" ? h.quizId?._id : h.quizId;
        const sorted = [...raw]
          .filter(h => getQId(h) === quizId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistory(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleViewDetail = async (attempt) => {
    setDetailLoad(true);
    try {
      const res = await quizService.getResultDetail(attempt._id);
      const raw = res.data?.data ?? res.data;
      const fullQs = raw?.quizId?.questions || [];
      const qs = fullQs.map(q => {
        let correctIdx = q.options.findIndex(opt => opt === q.correctAnswer);
        if (correctIdx === -1) correctIdx = Number(q.correctAnswer ?? q.answer);
        let userIdx = null;
        if (raw?.answers) {
          const ans = raw.answers.find(a => String(a.questionId) === String(q._id));
          if (ans?.selectedAnswer != null) {
            userIdx = q.options.findIndex(opt => opt === ans.selectedAnswer);
            if (userIdx === -1) userIdx = Number(ans.selectedAnswer);
          }
        }
        return { ...q, answer: correctIdx, userAnswer: userIdx, explanation: q.explanation ?? "" };
      });
      setDetail({
        score: raw?.correctAnswersCount ?? raw?.score ?? 0,
        total: raw?.totalQuestions ?? fullQs.length ?? 0,
        questions: qs,
        createdAt: raw?.createdAt ?? attempt.createdAt,
      });
    } catch { alert("Không thể tải chi tiết bài làm."); }
    finally { setDetailLoad(false); }
  };

  const pct = detail && detail.total > 0 ? Math.round((detail.score / detail.total) * 100) : 0;
  const col = scoreColor(pct);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full flex flex-col"
        style={{ maxWidth: 860, height: "90vh", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            {detail && (
              <button onClick={() => setDetail(null)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition mr-1">
                <ChevronLeft size={14} /> Quay lại
              </button>
            )}
            <Clock size={15} className="text-orange-500" />
            <p className="text-sm font-black text-gray-800">
              Lịch sử — <span className="text-orange-500">{quiz.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {detail ? (
          detailLoad ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Đang tải...
            </div>
          ) : (
            <>
              {/* Score card sticky */}
              <div className="shrink-0 bg-gray-50 border-b border-gray-100 px-6 py-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-5"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <ScoreCircle score={detail.score} total={detail.total} size={64} stroke={6} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(detail.createdAt).toLocaleString("vi-VN")}
                    </p>
                    <div className="flex gap-5 text-xs flex-wrap">
                      <span className="flex items-center gap-1.5 text-green-600 font-bold">
                        <CheckCircle size={13} /> Đúng: {detail.score}
                      </span>
                      <span className="flex items-center gap-1.5 text-red-500 font-bold">
                        <XCircle size={13} /> Sai: {detail.total - detail.score}
                      </span>
                      <span className="text-gray-400">Tổng: {detail.total} câu</span>
                    </div>
                  </div>
                  <button onClick={() => { onClose(); onStartQuiz(quiz); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shrink-0"
                    style={{ background: "#F26739" }}>
                    <RotateCcw size={13} /> Làm lại
                  </button>
                </div>
              </div>

              {/* Questions */}
              <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50 space-y-4">
                {detail.questions.map((q, idx) => {
                  const isCorrect = q.userAnswer === q.answer;
                  const isSkipped = q.userAnswer === null || q.userAnswer === undefined;
                  return (
                    <div key={q._id ?? idx}
                      className={`bg-white rounded-2xl border p-5 ${isSkipped ? "border-gray-200" : isCorrect ? "border-green-200" : "border-red-200"}`}
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <div className="flex items-start gap-3 mb-4">
                        <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${isSkipped ? "bg-gray-100 text-gray-400" : isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                          Câu {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 flex-1 leading-relaxed">{q.question}</p>
                        {isSkipped ? <span className="text-[11px] text-gray-400 shrink-0">Bỏ qua</span>
                          : isCorrect ? <CheckCircle size={17} className="text-green-500 shrink-0" />
                          : <XCircle size={17} className="text-red-400 shrink-0" />}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {q.options?.map((opt, oIdx) => {
                          const isAns  = oIdx === q.answer;
                          const isUser = oIdx === q.userAnswer;
                          let cls = "border-gray-100 text-gray-600 bg-gray-50";
                          if (isAns) cls = "border-green-300 bg-green-50 text-green-700 font-semibold";
                          else if (isUser && !isCorrect) cls = "border-red-300 bg-red-50 text-red-600";
                          return (
                            <div key={oIdx} className={`text-xs px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 ${cls}`}>
                              <span className="shrink-0 w-5 h-5 rounded-full bg-white/70 flex items-center justify-center text-[10px] font-bold opacity-70 border border-current">
                                {["A","B","C","D"][oIdx]}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isAns && <CheckCircle size={12} className="text-green-500 shrink-0" />}
                              {isUser && !isCorrect && <XCircle size={12} className="text-red-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-bold text-amber-700">Giải thích: </span>{q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Đang tải...
          </div>
        ) : history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 m-6 border-2 border-dashed border-gray-200 rounded-2xl">
            <Clock size={32} className="text-gray-300" />
            <p className="text-sm text-gray-500">Chưa có lịch sử làm bài</p>
            <button onClick={() => { onClose(); onStartQuiz(quiz); }}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: "#F26739" }}>
              Làm bài ngay
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            {history.map((attempt, idx) => {
              const score = attempt.correctAnswersCount ?? attempt.score ?? 0;
              const total = attempt.totalQuestions ?? 0;
              const p     = total > 0 ? Math.round((score / total) * 100) : 0;
              const c     = scoreColor(p);
              return (
                <div key={attempt._id ?? idx}
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-orange-200 hover:shadow-sm transition cursor-pointer"
                  onClick={() => handleViewDetail(attempt)}>
                  <ScoreCircle score={score} total={total} size={48} stroke={5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">
                      {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString("vi-VN") : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black" style={{ color: c }}>{score}/{total}</p>
                    <p className="text-[10px] text-gray-400">câu đúng</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Quizzes component ────────────────────────────────────────────────────
const Quizzes = () => {
  const [searchTerm, setSearchTerm]   = useState("");
  const [quizData, setQuizData]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyQuiz, setHistoryQuiz] = useState(null); // quiz đang xem lịch sử
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { role } = useAuth();
  const baseURL = api.defaults.baseURL.replace("/api/v1", "");

  const fetchAllQuizzes = async () => {
    try {
      setLoading(true); setError(null);
      const docRes = await api.get("/documents");
      const docs = docRes?.data?.data || docRes?.data || [];
      if (Array.isArray(docs) && docs.length > 0) {
        const quizResponses = await Promise.all(
          docs.map(doc => api.get(`/quizzes/document/${doc._id}`).catch(() => null))
        );
        let allQuizzes = [];
        quizResponses.forEach(res => {
          const data = res?.data?.data || res?.data || [];
          if (Array.isArray(data)) allQuizzes = [...allQuizzes, ...data];
        });
        const unique = Array.from(new Set(allQuizzes.map(q => q._id)))
          .map(id => allQuizzes.find(q => q._id === id)).filter(Boolean);
        setQuizData(unique);
      } else { setQuizData([]); }
    } catch (err) {
      setError("Không thể tải danh sách bài thi.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAllQuizzes(); }, [role]);

  const filtered    = quizData.filter(q => q.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages  = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-1 bg-[#FDFDFD] min-h-screen p-6 font-sans">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#18181B] tracking-tight uppercase">HỆ THỐNG TRẮC NGHIỆM</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Học viên: Chọn bài thi để bắt đầu ôn tập</p>
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm w-full md:w-[280px]">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Tìm kiếm bài thi..." value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-xs w-full text-gray-700" />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 w-8 h-8 mb-3" />
            <p className="text-gray-400 text-xs">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="text-red-500 w-8 h-8 mb-3" />
            <p className="text-red-600 font-bold text-xs">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {currentItems.length > 0 ? currentItems.map(quiz => (
                <div key={quiz._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    {quiz.thumbnail ? (
                      <img src={quiz.thumbnail.startsWith("http") ? quiz.thumbnail : `${baseURL}/${quiz.thumbnail}`}
                        alt={quiz.title} className="w-full h-40 object-cover bg-[#fdf3ec]" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center" style={{ background: "#fdf3ec" }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#F26739" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <p className="font-bold text-gray-800 text-[15px] mb-1 leading-snug line-clamp-2 uppercase tracking-wide">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Số câu hỏi <span className="font-bold text-[#F26739]">{quiz.questionCount ?? 0} câu</span>
                    </p>

                    <button onClick={() => navigate(`/learner/quizzes/${quiz._id}`)}
                      className="w-full py-2.5 rounded-xl text-sm text-white font-semibold transition"
                      style={{ background: "#F26739" }}>
                      Làm bài ngay
                    </button>

                    {/* Lịch sử → mở modal, không navigate */}
                    <button onClick={() => setHistoryQuiz(quiz)}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-orange-200 text-xs text-orange-500 hover:bg-orange-50 transition">
                      <Clock size={13} /> Lịch sử làm bài
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
                  <BookOpen size={32} className="text-gray-300" />
                  <p className="text-sm text-gray-400">Không tìm thấy bài thi nào.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 gap-4 w-full mb-6">
              <div className="text-gray-500 font-medium text-xs">{totalPages} trang</div>
              <div className="flex items-center gap-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-transparent disabled:opacity-30 hover:bg-gray-100 transition-colors text-xs">
                  <ChevronLeft size={14} /> <span>Trước</span>
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i+1} onClick={() => setCurrentPage(i+1)}
                      className={`w-8 h-8 rounded-md text-xs font-medium transition ${
                        currentPage === i+1
                          ? "bg-[#F26739] text-white shadow-sm border border-[#F26739]"
                          : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}>
                      {i+1}
                    </button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-transparent disabled:opacity-30 hover:bg-gray-100 transition-colors text-xs">
                  <span>Sau</span> <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* History Modal */}
      {historyQuiz && (
        <HistoryModal
          quiz={historyQuiz}
          onClose={() => setHistoryQuiz(null)}
          onStartQuiz={(quiz) => navigate(`/learner/quizzes/${quiz._id}`)}
        />
      )}
    </div>
  );
};

export default Quizzes;