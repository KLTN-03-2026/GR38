import { useState, useEffect } from "react";
import { ChevronLeft, Clock, X, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { quizService } from "../../../services/quizService";
import { scoreColor } from "./constants";

// ─── QuizResultDetail (HistoryModal) ─────────────────────────────────────────
// Hiển thị lịch sử làm bài của một quiz, cho phép xem chi tiết từng lần làm.
export default function QuizResultDetail({ quiz, onClose, onStartQuiz }) {
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [detail,     setDetail]     = useState(null);
  const [detailLoad, setDetailLoad] = useState(false);
  const quizId = quiz._id ?? quiz.id;

  useEffect(() => {
    quizService.getMyHistory()
      .then((res) => {
        const raw = res.data?.data ?? res.data ?? [];
        const sorted = [...raw]
          .filter((h) => String(h.quizId?._id ?? h.quizId) === String(quizId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistory(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleViewDetail = async (attempt) => {
    setDetailLoad(true);
    try {
      const res    = await quizService.getResultDetail(attempt._id);
      const raw    = res.data?.data ?? res.data;
      const fullQs = raw?.quizId?.questions || [];
      const qs = fullQs.map((q) => {
        let correctIdx = q.options.findIndex((opt) => opt === q.correctAnswer);
        if (correctIdx === -1) correctIdx = Number(q.correctAnswer ?? q.answer);
        let userIdx = null;
        if (raw?.answers) {
          const ans = raw.answers.find((a) => String(a.questionId) === String(q._id));
          if (ans && ans.selectedAnswer !== null) {
            userIdx = q.options.findIndex((opt) => opt === ans.selectedAnswer);
            if (userIdx === -1) userIdx = Number(ans.selectedAnswer);
          }
        }
        return {
          ...q,
          answer:      correctIdx,
          userAnswer:  userIdx,
          explanation: q.explanation ?? q.explain ?? "",
        };
      });
      setDetail({
        score:     raw?.correctAnswersCount ?? raw?.score ?? 0,
        total:     raw?.totalQuestions ?? fullQs.length ?? 10,
        questions: qs,
        createdAt: raw?.createdAt ?? attempt.createdAt,
      });
    } catch {
      alert("Không thể tải chi tiết bài làm.");
    } finally {
      setDetailLoad(false);
    }
  };

  const pct = detail && detail.total > 0 ? Math.round((detail.score / detail.total) * 100) : 0;
  const col = scoreColor(pct);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full flex flex-col"
        style={{ maxWidth: "860px", height: "90vh", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        {/* ── Sticky Header ── */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            {detail && (
              <button
                onClick={() => setDetail(null)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition mr-1"
              >
                <ChevronLeft size={14} /> Quay lại
              </button>
            )}
            <Clock size={15} className="text-orange-500" />
            <p className="text-sm font-black text-gray-800">
              Lịch sử — <span className="text-orange-500">{quiz.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        {detail ? (
          detailLoad ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Đang tải...
            </div>
          ) : (
            <>
              {/* ── Sticky Score Card ── */}
              <div className="shrink-0 bg-gray-50 border-b border-gray-100 px-6 py-4">
                <div
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-5"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  {/* Circle */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="26" fill="none" stroke={col} strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black" style={{ color: col }}>{pct}%</span>
                    </div>
                  </div>

                  {/* Stats */}
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

                  <button
                    onClick={() => { onClose(); onStartQuiz(quiz); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shrink-0"
                    style={{ background: "#F26739" }}
                  >
                    <RotateCcw size={13} /> Làm lại
                  </button>
                </div>
              </div>

              {/* ── Scrollable Questions ── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50 space-y-4">
                {detail.questions.map((q, idx) => {
                  const isCorrect = q.userAnswer === q.answer;
                  const isSkipped = q.userAnswer === null || q.userAnswer === undefined;
                  return (
                    <div
                      key={q._id ?? idx}
                      className={`bg-white rounded-2xl border p-5 ${
                        isSkipped ? "border-gray-200" : isCorrect ? "border-green-200" : "border-red-200"
                      }`}
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                    >
                      {/* Question header */}
                      <div className="flex items-start gap-3 mb-4">
                        <span
                          className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            isSkipped
                              ? "bg-gray-100 text-gray-400"
                              : isCorrect
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-500"
                          }`}
                        >
                          Câu {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 flex-1 leading-relaxed">
                          {q.question}
                        </p>
                        {isSkipped ? (
                          <span className="text-[11px] text-gray-400 shrink-0">Bỏ qua</span>
                        ) : isCorrect ? (
                          <CheckCircle size={17} className="text-green-500 shrink-0" />
                        ) : (
                          <XCircle size={17} className="text-red-400 shrink-0" />
                        )}
                      </div>

                      {/* Options 2×2 grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {q.options?.map((opt, oIdx) => {
                          const isAns  = oIdx === q.answer;
                          const isUser = oIdx === q.userAnswer;
                          let cls = "border-gray-100 text-gray-600 bg-gray-50";
                          if (isAns) cls = "border-green-300 bg-green-50 text-green-700 font-semibold";
                          else if (isUser && !isCorrect) cls = "border-red-300 bg-red-50 text-red-600";
                          return (
                            <div
                              key={oIdx}
                              className={`text-xs px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 ${cls}`}
                            >
                              <span className="shrink-0 w-5 h-5 rounded-full bg-white/70 flex items-center justify-center text-[10px] font-bold opacity-70 border border-current">
                                {["A", "B", "C", "D"][oIdx]}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isAns  && <CheckCircle size={12} className="text-green-500 shrink-0" />}
                              {isUser && !isCorrect && <XCircle size={12} className="text-red-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-bold text-amber-700">Giải thích: </span>
                            {q.explanation}
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
            <button
              onClick={() => { onClose(); onStartQuiz(quiz); }}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: "#F26739" }}
            >
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
                <div
                  key={attempt._id ?? idx}
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-orange-200 hover:shadow-sm transition cursor-pointer"
                  onClick={() => handleViewDetail(attempt)}
                >
                  <div className="relative w-12 h-12 shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke={c} strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - p / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-black" style={{ color: c }}>{p}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">
                      {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString("vi-VN") : ""}
                    </p>
                    {attempt.quizId?.difficulty && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        attempt.quizId.difficulty === "EASY"   ? "bg-green-100 text-green-600"
                        : attempt.quizId.difficulty === "MEDIUM" ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-500"
                      }`}>
                        {{ EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" }[attempt.quizId.difficulty] ?? attempt.quizId.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black" style={{ color: c }}>{score}/{total}</p>
                    <p className="text-[10px] text-gray-400">câu đúng</p>
                  </div>
                  <ChevronLeft size={14} className="text-gray-300 shrink-0 rotate-180" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}