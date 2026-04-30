// QuizView.jsx
import { useState, useRef } from "react";
import { quizService } from "../../../services/quizService";

const TABS = ["Thông tin", "Chat", "Quizz", "FlashCard"];

export default function QuizView({ quiz, questions, onBack, onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("Quizz");
  const [animDir, setAnimDir] = useState(null);
  const [tabAnim, setTabAnim] = useState(null);
  const [displayedTab, setDisplayedTab] = useState("Quizz");
  const [showWarn, setShowWarn] = useState(false);
  const animRef = useRef(null);
  const tabRef = useRef(null);

  const total = questions.length;
  const q = questions[currentQ];
  const selectedAnswer = answers[currentQ];

  const goTo = (next, dir) => {
    if (next < 0 || next >= total) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => {
      setCurrentQ(next);
      setAnimDir(null);
      setShowWarn(false);
    }, 200);
  };

  const handleNext = () => {
    if (selectedAnswer === undefined) {
      setShowWarn(true);
      return;
    }
    if (currentQ < total - 1) goTo(currentQ + 1, "left");
  };

  const handlePrev = () => goTo(currentQ - 1, "right");
  const handleJump = (i) => {
    if (i !== currentQ) {
      if (answers[currentQ] === undefined && i > currentQ) {
        setShowWarn(true);
        return;
      }
      goTo(i, i > currentQ ? "left" : "right");
    }
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    clearTimeout(tabRef.current);
    setTabAnim("fade-out");
    tabRef.current = setTimeout(() => {
      setDisplayedTab(tab);
      setActiveTab(tab);
      setTabAnim("fade-in");
      tabRef.current = setTimeout(() => setTabAnim(null), 200);
    }, 140);
  };

const handleSubmit = async () => {
    console.log("🚀 handleSubmit called");
    console.log("answers:", answers);
    const quizId = quiz._id ?? quiz.id;
    console.log("quizId:", quizId);
    const answered = Object.keys(answers).length;
    const score = Object.entries(answers).filter(([i, selectedIndex]) => {
      const q = questions[Number(i)];
      if (!q) return false;
      return Number(selectedIndex) === Number(q.answer);
    }).length;

    const submittedAnswers = questions.map((q, i) =>
      answers[i] !== undefined ? q.options[answers[i]] : null,
    );
    try {
      const res = await quizService.submit(quizId, submittedAnswers);
      const result = res.data?.data ?? res.data;
      const resultId = typeof result === "string" ? result : result?.resultId ?? result?._id ?? result?.id ?? null;
      onFinish({ quiz, answers, score, total, questions, answered, resultId });
    } catch (err) {
      console.warn("Submit API lỗi, tính điểm local:", err.message);
      onFinish({
        quiz,
        answers,
        score,
        total,
        questions,
        answered,
        resultId: null,
      });
    }
  };
  const progress = ((currentQ + 1) / total) * 100;
  const pageNums = Array.from({ length: total }, (_, i) => i).filter(
    (i) => i === 0 || i === total - 1 || Math.abs(i - currentQ) <= 1,
  );
  const slideClass =
    animDir === "left"
      ? "anim-slide-left"
      : animDir === "right"
        ? "anim-slide-right"
        : "";
  const tabContentClass =
    tabAnim === "fade-out"
      ? "tab-fade-out"
      : tabAnim === "fade-in"
        ? "tab-fade-in"
        : "";

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 back-btn"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Trở về
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-lg font-semibold text-gray-800 mb-5">
            {quiz.title}
          </h1>

          {/* Tabs */}
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
            {/* ── Tab: Quizz ── */}
            {displayedTab === "Quizz" && (
              <>
                <div
                  className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden ${slideClass}`}
                  style={{
                    boxShadow:
                      "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-5">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0">
                      Câu {currentQ + 1}/{total}
                    </span>
                    <p className="text-gray-800 text-sm font-medium leading-6 pt-0.5">
                      {q.question}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Chọn 1 đáp án đúng
                  </p>
                  <div className="space-y-2.5">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAnswers((p) => ({ ...p, [currentQ]: i }));
                          setShowWarn(false);
                        }}
                        className={`option-btn w-full flex items-center gap-3 p-3.5 border rounded-xl text-left ${selectedAnswer === i ? "selected" : "border-gray-200 bg-white"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${selectedAnswer === i ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                        >
                          {selectedAnswer === i && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${selectedAnswer === i ? "text-blue-700 font-medium" : "text-gray-700"}`}
                        >
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="mt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap tabular-nums">
                      {currentQ + 1} / {total}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-blue-500 rounded-full progress-bar"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrev}
                      disabled={currentQ === 0}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 nav-btn shrink-0"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Trước
                    </button>

                    <div className="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
                      {pageNums.map((i, arrIdx) => (
                        <span
                          key={`page-${arrIdx}`}
                          className="flex items-center gap-1.5"
                        >
                          {arrIdx > 0 &&
                            pageNums[arrIdx] - pageNums[arrIdx - 1] > 1 && (
                              <span className="text-gray-300 text-xs select-none">
                                …
                              </span>
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
                        style={{
                          background: showWarn
                            ? "#ef4444"
                            : selectedAnswer !== undefined
                              ? "#3b82f6"
                              : "#d1d5db",
                        }}
                      >
                        {showWarn ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                              />
                            </svg>
                            Chọn đáp án!
                          </>
                        ) : (
                          <>
                            Câu tiếp{" "}
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    ) : selectedAnswer !== undefined ? (
                      <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 submit-btn"
                      >
                        Nộp bài
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowWarn(true)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 ${showWarn ? "warn-shake" : ""}`}
                        style={{ background: showWarn ? "#ef4444" : "#d1d5db" }}
                      >
                        {showWarn ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                              />
                            </svg>
                            Chọn đáp án!
                          </>
                        ) : (
                          "Nộp bài"
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-start items-center mt-3">
                    <button
                      onClick={() => {
                        setCurrentQ(0);
                        setAnswers({});
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Làm lại từ đầu
                    </button>
                  </div>
                </div>
              </>
            )}
            {/* ── Tab: Thông tin ── */}
            {displayedTab === "Thông tin" && (
              <div
                className="bg-white rounded-2xl border border-gray-200 p-6 anim-fade-in-up"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              >
                <h2 className="text-sm font-bold text-gray-800 mb-4">
                  {quiz.title}
                </h2>
                <div className="flex items-center gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {total} câu hỏi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {Object.keys(answers).length} đã trả lời
                  </span>
                  {quiz.difficulty && (
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {quiz.difficulty === "EASY"
                        ? "Dễ"
                        : quiz.difficulty === "MEDIUM"
                          ? "Trung bình"
                          : "Khó"}
                    </span>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-xs text-gray-400 mt-4 leading-6">
                    {quiz.description}
                  </p>
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
