// QuizView.jsx
import { useState, useRef, useEffect } from "react";
import { quizService } from "../../../services/quizService";

const TABS = ["Thông tin", "Quizz"];

export default function QuizView({ quiz, questions, onBack, onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("Quizz");
  const [animDir, setAnimDir] = useState(null);
  const [tabAnim, setTabAnim] = useState(null);
  const [displayedTab, setDisplayedTab] = useState("Quizz");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false); // 👈 THÊM MỚI
  const animRef = useRef(null);
  const tabRef = useRef(null);
  const timerRef = useRef(null);

  const timeLimitSec = (quiz.timeLimit ?? quiz.time_limit ?? 30) * 60;
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);

  const total = questions.length;
  const q = questions[currentQ];
  const selectedAnswer = answers[currentQ];
  const progress = ((currentQ + 1) / total) * 100;
  const answeredCount = Object.keys(answers).length;

  const slideClass =
    animDir === "left" ? "anim-slide-left" : animDir === "right" ? "anim-slide-right" : "";
  const tabContentClass =
    tabAnim === "fade-out" ? "tab-fade-out" : tabAnim === "fade-in" ? "tab-fade-in" : "";

  const formatTime = (sec) =>
    `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    const quizId = quiz._id ?? quiz.id;
    const answered = Object.keys(answers).length;
    const timeSpent = timeLimitSec - timeLeft;

    const localScore = Object.entries(answers).filter(([i, selectedIndex]) => {
      const question = questions[Number(i)];
      return question && Number(selectedIndex) === Number(question.answer || question.correctAnswer);
    }).length;

    const formattedAnswersForAPI = questions.map((q, i) => ({
      questionId: q._id || q.id,
      selectedAnswer: answers[i] !== undefined ? q.options[answers[i]] : null,
    }));

    try {
      const res = await quizService.submit(quizId, formattedAnswersForAPI, timeSpent);
      const result = res.data?.data ?? res.data;
      const resultId =
        typeof result === "string" ? result : (result?.resultId ?? result?._id ?? result?.id ?? null);
      const serverScore = result?.score !== undefined ? result.score : localScore;
      onFinish({ quiz, answers, score: serverScore, total, questions, answered, resultId });
    } catch (err) {
      console.warn("Submit API lỗi, tính điểm local:", err.message);
      onFinish({ quiz, answers, score: localScore, total, questions, answered, resultId: null });
    }
  };

  useEffect(() => {
    setTimeLeft(timeLimitSec);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLimitSec]);

  const goTo = (next, dir) => {
    if (next < 0 || next >= total) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => { setCurrentQ(next); setAnimDir(null); }, 200);
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    clearTimeout(tabRef.current);
    setTabAnim("fade-out");
    tabRef.current = setTimeout(() => {
      setDisplayedTab(tab); setActiveTab(tab); setTabAnim("fade-in");
      tabRef.current = setTimeout(() => setTabAnim(null), 200);
    }, 140);
  };

  // 👇 THÊM MỚI: handler cho nút Trở về
  const handleBack = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    clearInterval(timerRef.current);
    setShowExitConfirm(false);
    onBack();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center shrink-0">
        {/* 👇 SỬA: onClick từ onBack → handleBack */}
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-500 back-btn">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Trở về
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-lg font-semibold text-gray-800 mb-5">{quiz.title}</h1>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                className={`tab-btn px-7 py-2.5 text-sm ${activeTab === tab ? "active" : "text-gray-400 hover:text-gray-600"}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className={tabContentClass}>
            {/* ── Tab: Quizz ── */}
            {displayedTab === "Quizz" && (
              <div className="flex gap-5 items-start">
                {/* Main */}
                <div className="flex-1 min-w-0">
                  {/* Question card */}
                  <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden ${slideClass}`}
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-start gap-3 mb-5">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0">
                        Câu {currentQ + 1}/{total}
                      </span>
                      <p className="text-gray-800 text-sm font-medium leading-6 pt-0.5">{q?.question}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Chọn 1 đáp án đúng</p>
                    <div className="space-y-2.5">
                      {q?.options?.map((opt, i) => (
                        <button key={i}
                          onClick={() => setAnswers((p) => ({ ...p, [currentQ]: i }))}
                          className={`option-btn w-full flex items-center gap-3 p-3.5 border rounded-xl text-left ${selectedAnswer === i ? "selected" : "border-gray-200 bg-white"}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${selectedAnswer === i ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                            {selectedAnswer === i && <span className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={`text-sm ${selectedAnswer === i ? "text-blue-700 font-medium" : "text-gray-700"}`}>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress + Navigation */}
                  <div className="mt-5 space-y-2">
                    {/* Question progress */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 tabular-nums whitespace-nowrap">{currentQ + 1} / {total}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-1.5 bg-blue-500 rounded-full progress-bar" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">{Math.round(progress)}%</span>
                    </div>
                    {/* Timer */}
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs font-bold tabular-nums whitespace-nowrap ${timeLeft <= 60 ? "text-red-500" : "text-orange-500"}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(timeLeft)}
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${(timeLeft / timeLimitSec) * 100}%`, background: timeLeft <= 60 ? "#ef4444" : timeLeft <= timeLimitSec * 0.25 ? "#f97316" : "#f59e0b" }} />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">{Math.round((timeLeft / timeLimitSec) * 100)}%</span>
                    </div>
                    {/* Prev / Next */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button onClick={() => goTo(currentQ - 1, "right")} disabled={currentQ === 0}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 nav-btn disabled:opacity-40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Trước
                      </button>
                      {currentQ < total - 1 ? (
                        <button onClick={() => goTo(currentQ + 1, "left")}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: "#3b82f6" }}>
                          Câu tiếp
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <button onClick={() => setShowConfirm(true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white submit-btn"
                          style={{ background: "#22c55e" }}>
                          Nộp bài
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <button onClick={() => { setCurrentQ(0); setAnswers({}); }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      Làm lại từ đầu
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-44 shrink-0 bg-white rounded-2xl border border-gray-200 p-4 sticky top-0"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Danh sách câu</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: total }, (_, i) => (
                      <button key={i} onClick={() => setCurrentQ(i)}
                        className={`w-8 h-8 text-xs rounded-lg border font-medium transition-all ${
                          currentQ === i
                            ? "bg-orange-500 border-orange-500 text-white"
                            : answers[i] !== undefined
                              ? "bg-orange-400 border-orange-400 text-white"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowConfirm(true)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "#f26739" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Nộp bài
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab: Thông tin ── */}
            {displayedTab === "Thông tin" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 anim-fade-in-up"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 className="text-sm font-bold text-gray-800 mb-4">{quiz.title}</h2>
                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
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
                    {answeredCount} đã trả lời
                  </span>
                  {(quiz.timeLimit ?? quiz.time_limit) > 0 && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.timeLimit ?? quiz.time_limit} phút
                    </span>
                  )}
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
          </div>
        </div>
      </div>

      {/* Popup xác nhận nộp bài */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Xác nhận nộp bài?</h3>
              <p className="text-xs text-gray-500 leading-5">
                Bạn đã trả lời <strong className="text-gray-700">{answeredCount}/{total}</strong> câu.
                {answeredCount < total && (
                  <span className="text-orange-500"> Còn {total - answeredCount} câu chưa trả lời.</span>
                )}
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                Làm tiếp
              </button>
              <button onClick={() => { setShowConfirm(false); handleSubmit(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "#f26739" }}>
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👇 THÊM MỚI: Popup xác nhận thoát bài */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Bạn muốn thoát bài kiểm tra?</h3>
              <p className="text-xs text-gray-500 leading-5">
                Tiến trình làm bài sẽ <strong className="text-red-500">không được lưu</strong> nếu bạn thoát ngay bây giờ.
                {answeredCount > 0 && (
                  <span className="block mt-1 text-gray-400">Bạn đã trả lời {answeredCount}/{total} câu.</span>
                )}
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                Tiếp tục làm bài
              </button>
              <button onClick={handleConfirmExit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "#ef4444" }}>
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}