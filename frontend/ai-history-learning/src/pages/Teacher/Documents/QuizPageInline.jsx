// QuizPageInline.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { quizService } from "../../../services/quizService";

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const shuffleOpts = (q) => {
  const indexed = q.options.map((t, i) => ({ t, isAns: i === q.answer }));
  const s = shuffle(indexed);
  return {
    ...q,
    options: s.map((o) => o.t),
    answer: s.findIndex((o) => o.isAns),
  };
};

export default function QuizPageInline({ quiz, onBack, documentId }) {
  console.log("QuizPageInline mounted, quiz:", quiz); // ← thêm ngay đây
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [detail, setDetail] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWarn, setShowWarn] = useState(false);
  const [animDir, setAnimDir] = useState(null);
  const animRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const qid = quiz._id ?? quiz.id;
        console.log("Quiz ID:", qid); // ← thêm
        const res = await quizService.getById(qid);
        console.log("Response:", res); // ← thêm
        const d = res.data?.data ?? res.data ?? res; // ← thêm .data.data
        console.log("Detail:", d); // ← thêm
        const raw = d.questions ?? [];
        console.log("Raw questions:", raw[0]); // ← thêm
        if (!raw.length) {
          alert("Quiz này chưa có câu hỏi!");
          onBack();
          return;
        }
        const normalized = raw.map((q) => ({
          question: q.question ?? q.q,
          options: q.options,
          answer: q.correctAnswer ?? q.answer,
        }));
        setDetail(d);
        setQuestions(shuffle(normalized).map(shuffleOpts));
      } catch (err) {
        // ← thêm err
        console.error("Lỗi:", err); // ← thêm
        alert("Không tải được câu hỏi: " + err.message);
        onBack();
      }
    })();
  }, [quiz._id]);

  if (!questions)
    return (
      <div className="flex items-center justify-center py-16 gap-3">
        <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Đang tải câu hỏi...</p>
      </div>
    );

  const total = questions.length;
  const q = questions[currentQ];
  const selected = answers[currentQ];
  const progress = ((currentQ + 1) / total) * 100;

  const goTo = (next, dir) => {
    if (next < 0 || next >= total) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => {
      setCurrentQ(next);
      setAnimDir(null);
      setShowWarn(false);
    }, 180);
  };

  const handleNext = () => {
    if (selected === undefined) {
      setShowWarn(true);
      return;
    }
    goTo(currentQ + 1, "left");
  };

  const handleSubmit = () => {
      console.log(">>> documentId khi nộp bài:", documentId); 
    const score = Object.entries(answers).filter(([i, a]) => {
      const q = questions[Number(i)];
      if (!q) return false;
      const selectedText = q.options[a];
      return (
        selectedText === q.answer ||
        String(a) === String(q.answer) ||
        Number(a) === Number(q.answer)
      );
    }).length;

    console.log("Tổng đúng:", score);

    navigate("/teacher/quiz-result", {
      state: {
        quiz: detail,
        answers,
        score,
        total,
        questions,
        answered: Object.keys(answers).length,
        documentId,
      },
    });
  };

  const slideClass =
    animDir === "left"
      ? "animate-[slideInLeft_0.2s_ease_both]"
      : animDir === "right"
        ? "animate-[slideInRight_0.2s_ease_both]"
        : "";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
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
          Danh sách bài kiểm tra
        </button>
        <span className="text-xs text-gray-400">{quiz.title}</span>
      </div>

      {/* Question card */}
      <div
        className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm ${slideClass}`}
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
            Câu {currentQ + 1}/{total}
          </span>
          <p className="text-sm font-medium text-gray-800 leading-6 pt-0.5">
            {q.question}
          </p>
        </div>
        <p className="text-xs text-gray-400 mb-3">Chọn 1 đáp án đúng</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                setAnswers((p) => ({ ...p, [currentQ]: i }));
                setShowWarn(false);
              }}
              className={`w-full flex items-center gap-3 p-3 border rounded-xl text-left transition-all ${
                selected === i
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all font-bold text-xs ${
                  selected === i
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {["A", "B", "C", "D"][i]}
              </div>
              <span
                className={`text-sm ${selected === i ? "text-blue-700 font-medium" : "text-gray-700"}`}
              >
                {opt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress + Navigation */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500 tabular-nums">
            {currentQ + 1} / {total}
          </span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-blue-500 rounded-full transition-all duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => goTo(currentQ - 1, "right")}
            disabled={currentQ === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
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

          {/* Page dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }, (_, i) => i)
              .filter(
                (i) =>
                  i === 0 || i === total - 1 || Math.abs(i - currentQ) <= 1,
              )
              .map((i, arrIdx, arr) => (
                <span key={i} className="flex items-center gap-1.5">
                  {arrIdx > 0 && arr[arrIdx] - arr[arrIdx - 1] > 1 && (
                    <span className="text-gray-300 text-xs">…</span>
                  )}
                  <button
                    onClick={() => goTo(i, i > currentQ ? "left" : "right")}
                    className={`w-7 h-7 text-xs rounded-lg border font-medium transition-all ${
                      currentQ === i
                        ? "bg-blue-500 text-white border-blue-500"
                        : answers[i] !== undefined
                          ? "bg-blue-50 text-blue-500 border-blue-200"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                </span>
              ))}
          </div>

          {currentQ < total - 1 ? (
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
                showWarn
                  ? "bg-red-500 animate-[warnShake_0.4s_ease_both]"
                  : selected !== undefined
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300"
              }`}
            >
              {showWarn ? "Chọn đáp án!" : "Câu tiếp"}
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
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#F26739] hover:bg-orange-600 transition"
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
          )}
        </div>

        <div className="flex justify-between mt-2.5">
          <button
            onClick={() => {
              setCurrentQ(0);
              setAnswers({});
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Làm lại từ đầu
          </button>
          <button
            onClick={handleSubmit}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium transition"
          >
            Nộp bài ngay →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes warnShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
      `}</style>
    </div>
  );
}
