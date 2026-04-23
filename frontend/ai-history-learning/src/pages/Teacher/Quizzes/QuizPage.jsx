import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizService } from "../../../services/quizService";
import AddQuizModal from "./AddQuizModal";

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleOptions(question) {
  const indexed = question.options.map((opt, i) => ({ text: opt, isAnswer: i === question.answer }));
  const shuffled = shuffleArray(indexed);
  return {
    ...question,
    options: shuffled.map((o) => o.text),
    answer: shuffled.findIndex((o) => o.isAnswer),
  };
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(32px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(-32px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tabFadeOut {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(5px); }
    }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes warnShake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-4px); }
      40%     { transform: translateX(4px); }
      60%     { transform: translateX(-3px); }
      80%     { transform: translateX(3px); }
    }

    .anim-fade-in-up  { animation: fadeInUp 0.28s cubic-bezier(.4,0,.2,1) both; }
    .anim-scale-in    { animation: scaleIn  0.22s cubic-bezier(.4,0,.2,1) both; }
    .anim-fade-in     { animation: fadeIn   0.18s ease both; }
    .anim-slide-left  { animation: slideInLeft  0.22s cubic-bezier(.4,0,.2,1) both; }
    .anim-slide-right { animation: slideInRight 0.22s cubic-bezier(.4,0,.2,1) both; }
    .tab-fade-out     { animation: tabFadeOut 0.14s ease both; }
    .tab-fade-in      { animation: tabFadeIn  0.18s ease both; }
    .warn-shake       { animation: warnShake 0.4s ease both; }

    .quiz-card {
      transition: transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s cubic-bezier(.4,0,.2,1), border-color 0.2s;
    }
    .quiz-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px -4px rgba(0,0,0,0.10);
      border-color: #e0ddd8;
    }
    .quiz-card:hover .card-thumb { transform: scale(1.03); }
    .card-thumb { transition: transform 0.35s cubic-bezier(.4,0,.2,1); }

    .option-btn { transition: background 0.15s, border-color 0.15s, transform 0.12s; }
    .option-btn:hover:not(.selected) { background: #f8f7f5; border-color: #d0cdc8; }
    .option-btn.selected { border-color: #3b82f6; background: #eff6ff; }
    .option-btn:active { transform: scale(0.99); }

    .page-btn { transition: background 0.15s, border-color 0.15s, transform 0.1s, color 0.15s; }
    .page-btn:hover { background: #f3f4f6; }
    .page-btn:active { transform: scale(0.95); }
    .page-btn.current { background: #3b82f6; color: white; border-color: #3b82f6; }
    .page-btn.answered:not(.current) { background: #eff6ff; color: #3b82f6; border-color: #bfdbfe; }

    .tab-btn { position: relative; transition: color 0.15s; }
    .tab-btn::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0; right: 0;
      height: 2px;
      background: #F26739;
      border-radius: 2px 2px 0 0;
      transform: scaleX(0);
      transition: transform 0.2s cubic-bezier(.4,0,.2,1);
    }
    .tab-btn.active::after { transform: scaleX(1); }
    .tab-btn.active { color: #F26739; font-weight: 500; }

    .primary-btn { transition: background 0.15s, transform 0.1s, box-shadow 0.15s; }
    .primary-btn:hover { background: #e05a2b !important; box-shadow: 0 4px 12px -2px rgba(242,103,57,0.35); }
    .primary-btn:active { transform: scale(0.98); }

    .ghost-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; }
    .ghost-btn:hover { background: #f3f4f6; border-color: #d1d5db; }

    .delete-overlay { opacity: 0; transition: opacity 0.18s; }
    .quiz-card:hover .delete-overlay { opacity: 1; }

    .nav-btn { transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s; }
    .nav-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .next-btn-ready {
      background: #3b82f6 !important;
      box-shadow: 0 2px 8px -1px rgba(59,130,246,0.35);
      transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    }
    .next-btn-ready:hover { background: #2563eb !important; }
    .next-btn-ready:active { transform: scale(0.98); }
    .next-btn-warn { background: #ef4444 !important; transition: background 0.15s; }

    .submit-btn {
      background: #F26739 !important;
      transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
      box-shadow: 0 2px 8px -1px rgba(242,103,57,0.3);
    }
    .submit-btn:hover { background: #e05a2b !important; box-shadow: 0 4px 14px -2px rgba(242,103,57,0.4); }
    .submit-btn:active { transform: scale(0.98); }

    .modal-overlay { animation: fadeIn 0.18s ease both; }
    .modal-box { animation: scaleIn 0.22s cubic-bezier(.4,0,.2,1) both; }
    .progress-bar { transition: width 0.45s cubic-bezier(.4,0,.2,1); }

    .input-field { transition: border-color 0.15s, box-shadow 0.15s; }
    .input-field:focus { border-color: #F26739 !important; box-shadow: 0 0 0 3px rgba(242,103,57,0.12); outline: none; }
    .input-field.error { border-color: #f87171 !important; background: #fff7f7; }
    .input-field.error:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.15); }

    .back-btn { transition: color 0.15s, transform 0.15s; }
    .back-btn:hover { color: #111827; transform: translateX(-2px); }
  `}</style>
);

// ─── CONFIRM DELETE MODAL ─────────────────────────────────────────────────────
const ConfirmDeleteModal = ({ title, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
    style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-[320px] p-7 text-center modal-box"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1.5">Xoá bộ câu hỏi?</p>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        Bạn có chắc muốn xoá <span className="font-medium text-gray-600">"{title}"</span>?<br />Hành động này không thể hoàn tác.
      </p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 ghost-btn">
          Huỷ
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm text-red-500 font-medium"
          style={{ background: "#fff1f1", border: "1px solid #fecaca", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#ffe4e4"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff1f1"}
        >
          Xoá
        </button>
      </div>
    </div>
  </div>
);

// ─── QUIZ VIEW ────────────────────────────────────────────────────────────────
const TABS = ["Thông tin", "Chat", "Quizz", "FlashCard"];

function QuizView({ quiz, questions, onBack, onFinish }) {
  const [currentQ, setCurrentQ]         = useState(0);
  const [answers, setAnswers]           = useState({});
  const [activeTab, setActiveTab]       = useState("Quizz");
  const [animDir, setAnimDir]           = useState(null);
  const [tabAnim, setTabAnim]           = useState(null);
  const [displayedTab, setDisplayedTab] = useState("Quizz");
  const [showWarn, setShowWarn]         = useState(false);
  const animRef                         = useRef(null);
  const tabRef                          = useRef(null);

  const total          = questions.length;
  const q              = questions[currentQ];
  const selectedAnswer = answers[currentQ];

  const goTo = (next, dir) => {
    if (next < 0 || next >= total) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => { setCurrentQ(next); setAnimDir(null); setShowWarn(false); }, 200);
  };

  const handleNext = () => {
    if (selectedAnswer === undefined) { setShowWarn(true); return; }
    if (currentQ < total - 1) goTo(currentQ + 1, "left");
  };

  const handlePrev = () => goTo(currentQ - 1, "right");
  const handleJump = (i) => { if (i !== currentQ) goTo(i, i > currentQ ? "left" : "right"); };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    clearTimeout(tabRef.current);
    setTabAnim("fade-out");
    tabRef.current = setTimeout(() => {
      setDisplayedTab(tab); setActiveTab(tab); setTabAnim("fade-in");
      tabRef.current = setTimeout(() => setTabAnim(null), 200);
    }, 140);
  };

  const handleSubmit = () => {
    const score = Object.entries(answers).filter(([i, a]) => questions[Number(i)]?.answer === a).length;
    onFinish({ quiz, answers, score, total, questions, answered: Object.keys(answers).length });
  };

  const progress   = ((currentQ + 1) / total) * 100;
  const pageNums   = Array.from({ length: total }, (_, i) => i).filter(
    (i) => i === 0 || i === total - 1 || Math.abs(i - currentQ) <= 1
  );
  const slideClass      = animDir === "left" ? "anim-slide-left" : animDir === "right" ? "anim-slide-right" : "";
  const tabContentClass = tabAnim === "fade-out" ? "tab-fade-out" : tabAnim === "fade-in" ? "tab-fade-in" : "";

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 back-btn">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Trở về
        </button>
        <button className="text-sm px-4 py-1.5 rounded-lg text-white primary-btn" style={{ background: "#F26739" }}>
          Chỉnh sửa câu hỏi
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-lg font-semibold text-gray-800 mb-5">{quiz.title}</h1>

          <div className="flex border-b border-gray-200 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`tab-btn px-7 py-2.5 text-sm ${activeTab === tab ? "active" : "text-gray-400 hover:text-gray-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={tabContentClass}>
            {displayedTab === "Quizz" && (
              <>
                <div
                  className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden ${slideClass}`}
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-start gap-3 mb-5">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0">
                      Câu {currentQ + 1}/{total}
                    </span>
                    <p className="text-gray-800 text-sm font-medium leading-6 pt-0.5">{q.question}</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Chọn 1 đáp án đúng</p>
                  <div className="space-y-2.5">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => { setAnswers((p) => ({ ...p, [currentQ]: i })); setShowWarn(false); }}
                        className={`option-btn w-full flex items-center gap-3 p-3.5 border rounded-xl text-left ${selectedAnswer === i ? "selected" : "border-gray-200 bg-white"}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${selectedAnswer === i ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                          {selectedAnswer === i && <span className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm ${selectedAnswer === i ? "text-blue-700 font-medium" : "text-gray-700"}`}>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap tabular-nums">{currentQ + 1} / {total}</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-blue-500 rounded-full progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums">{Math.round(progress)}%</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrev} disabled={currentQ === 0}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 nav-btn shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Trước
                    </button>

                    <div className="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
                      {pageNums.map((i, arrIdx) => (
                        <span key={i} className="flex items-center gap-1.5">
                          {arrIdx > 0 && pageNums[arrIdx] - pageNums[arrIdx - 1] > 1 && (
                            <span className="text-gray-300 text-xs select-none">…</span>
                          )}
                          <button
                            onClick={() => handleJump(i)}
                            className={`page-btn w-8 h-8 text-xs rounded-lg border font-medium
                              ${currentQ === i ? "current" : answers[i] !== undefined ? "answered border-blue-200" : "border-gray-200 text-gray-500"}`}
                          >
                            {i + 1}
                          </button>
                        </span>
                      ))}
                    </div>

                    {currentQ < total - 1 ? (
                      <button
                        onClick={handleNext}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0
                          ${showWarn ? "next-btn-warn warn-shake" : selectedAnswer !== undefined ? "next-btn-ready" : ""}`}
                        style={{ background: showWarn ? "#ef4444" : selectedAnswer !== undefined ? "#3b82f6" : "#d1d5db" }}
                      >
                        {showWarn ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            Chọn đáp án!
                          </>
                        ) : (
                          <>
                            Câu tiếp
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </>
                        )}
                      </button>
                    ) : (
                      <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 submit-btn">
                        Nộp bài
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <button onClick={() => { setCurrentQ(0); setAnswers({}); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      Làm lại từ đầu
                    </button>
                    <button onClick={handleSubmit} className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
                      Nộp bài ngay →
                    </button>
                  </div>
                </div>
              </>
            )}

            {displayedTab === "Thông tin" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 anim-fade-in-up" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 className="text-sm font-bold text-gray-800 mb-4">{quiz.title}</h2>
                <div className="flex items-center gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {total} câu hỏi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {Object.keys(answers).length} đã trả lời
                  </span>
                  {quiz.difficulty && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {quiz.difficulty === "EASY" ? "Dễ" : quiz.difficulty === "MEDIUM" ? "Trung bình" : "Khó"}
                    </span>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-xs text-gray-400 mt-4 leading-6">{quiz.description}</p>
                )}
              </div>
            )}

            {displayedTab === "Chat" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm py-16 anim-fade-in">
                Tính năng Chat đang được phát triển...
              </div>
            )}
            {displayedTab === "FlashCard" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm py-16 anim-fade-in">
                Tính năng FlashCard đang được phát triển...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Nhận quizList từ DocumentsDetailPage, không tự gọi API
  const [quizzes, setQuizzes]           = useState(location.state?.quizList ?? []);
  const [loading]                       = useState(false);
  const [error]                         = useState("");
  const [quizView, setQuizView]         = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [searchTerm, setSearchTerm]     = useState("");

  // ── Start quiz: load chi tiết câu hỏi từ API ───────────────────────────────
  const handleStartQuiz = async (quiz) => {
    try {
      const res       = await quizService.getById(quiz.id ?? quiz._id);
      const detail    = res.data ?? res;
      const rawQs     = detail.questions ?? [];
      if (rawQs.length === 0) { alert("Quiz này chưa có câu hỏi!"); return; }

      const normalized = rawQs.map((q) => ({
        question: q.question ?? q.q,
        options:  q.options,
        answer:   q.correctAnswer ?? q.answer,
      }));

      const shuffled = shuffleArray(normalized).map((q) => shuffleOptions(q));
      setQuizView({ quiz: detail, questions: shuffled });
    } catch (err) {
      alert("Không tải được câu hỏi. Vui lòng thử lại.");
      console.error(err);
    }
  };

  // ── Finish quiz ────────────────────────────────────────────────────────────
  const handleFinish = ({ quiz, answers, score, total, questions, answered }) => {
    setQuizView(null);
    navigate("/teacher/quiz-result", {
      state: { quiz, answers, score, total, questions, answered },
    });
  };

  // ── Save quiz mới ──────────────────────────────────────────────────────────
  const handleSaveQuiz = (newQuiz) => {
    const normalized = {
      id:          newQuiz._id ?? newQuiz.id,
      _id:         newQuiz._id ?? newQuiz.id,
      title:       newQuiz.title,
      description: newQuiz.description,
      difficulty:  newQuiz.difficulty,
      time_limit:  newQuiz.time_limit,
      questions:   newQuiz.questions ?? [],
    };
    setQuizzes((prev) => [normalized, ...prev]);
    setShowAddModal(false);
  };

  // ── Delete quiz ────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      setQuizzes((p) => p.filter((q) => (q.id ?? q._id) !== (deleteTarget.id ?? deleteTarget._id)));
      setDeleteTarget(null);
    } catch (err) {
      alert("Xoá quiz thất bại, vui lòng thử lại.");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    (q.title ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Quiz View ──────────────────────────────────────────────────────────────
  if (quizView) {
    return (
      <>
        <GlobalStyles />
        <QuizView
          quiz={quizView.quiz}
          questions={quizView.questions}
          onBack={() => setQuizView(null)}
          onFinish={handleFinish}
        />
      </>
    );
  }

  // ── Main List ──────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyles />
      <div className="h-full overflow-y-auto bg-gray-50 p-6">

        {/* Search bar + Add button */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-7 flex items-center px-5 justify-between shadow-sm anim-fade-in-up">
          <div className="flex items-center bg-[#F9F9F9] border border-gray-200 rounded-[6px] px-3 h-[38px] w-full max-w-[500px] gap-2">
            <svg width="16" height="16" className="text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bộ câu hỏi..."
              className="bg-transparent border-none outline-none text-[14px] w-full text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#F26739] text-white text-[14px] font-semibold rounded-[6px] px-6 h-[36px] hover:bg-orange-600 transition-colors shadow-sm"
          >
            + Thêm Quiz
          </button>
        </div>

        {/* Empty state khi không có quizList từ state */}
        {!loading && quizzes.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Chưa có bài kiểm tra nào</p>
            <button
              onClick={() => navigate(-1)}
              className="text-sm px-4 py-2 rounded-lg border border-orange-200 text-orange-500 hover:bg-orange-50 transition"
            >
              ← Quay lại tài liệu
            </button>
          </div>
        )}

        {/* Grid */}
        {filteredQuizzes.length > 0 && (
          <div className="grid grid-cols-3 gap-5">
            {filteredQuizzes.map((quiz, idx) => (
              <div
                key={quiz._id ?? quiz.id}
                className="quiz-card bg-white rounded-xl border border-gray-200 overflow-hidden group"
                style={{ animation: `fadeInUp 0.28s ${idx * 0.05}s both` }}
              >
                <div className="relative overflow-hidden">
                  {quiz.coverImage ? (
                    <img src={quiz.coverImage} alt={quiz.title} className="card-thumb w-full h-36 object-cover bg-gray-100" />
                  ) : (
                    <div className="card-thumb w-full h-36 flex items-center justify-center bg-gradient-to-br from-[#F26739] to-[#f9a87e]">
                      <span className="text-white text-[40px] font-black">
                        {quiz.title?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {quiz.difficulty && (
                    <span className={`absolute top-2.5 left-2.5 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm ${
                      quiz.difficulty === "EASY" ? "bg-green-500" :
                      quiz.difficulty === "MEDIUM" ? "bg-yellow-500" : "bg-red-500"
                    }`}>
                      {quiz.difficulty === "EASY" ? "Dễ" : quiz.difficulty === "MEDIUM" ? "Trung bình" : "Khó"}
                    </span>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(quiz); }}
                    className="delete-overlay absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-3.5">
                  <p className="font-semibold text-gray-800 text-sm mb-2.5 leading-snug line-clamp-2">{quiz.title}</p>
                  <span className="inline-block text-xs bg-blue-500 text-white px-2.5 py-1 rounded-full">
                    {Array.isArray(quiz.questions) ? quiz.questions.length : (quiz.questionCount ?? 0)} câu hỏi
                  </span>
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full mt-3 py-2.5 rounded-lg text-sm text-white font-medium primary-btn"
                    style={{ background: "#F26739" }}
                  >
                    Bắt đầu làm bài
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Không tìm thấy khi search */}
        {!loading && quizzes.length > 0 && filteredQuizzes.length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-400 text-sm">
            Không tìm thấy bộ câu hỏi nào
          </div>
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            title={deleteTarget.title}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {showAddModal && (
          <AddQuizModal
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveQuiz}
          />
        )}
      </div>
    </>
  );
}