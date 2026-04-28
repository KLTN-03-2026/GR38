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

// correctAnswer là TEXT string → giữ nguyên, chỉ shuffle options
const shuffleOpts = (q) => {
  const shuffled = shuffle(q.options);
  return { ...q, options: shuffled };
};

// Kiểm tra đáp án: so sánh text option được chọn với correctAnswer
const isCorrect = (q, selectedIndex) => {
  if (selectedIndex === undefined || selectedIndex === null) return false;
  const selectedText = q.options[selectedIndex];
  return selectedText === q.correctAnswer;
};

export default function QuizPageInline({ quiz, onBack, documentId }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [detail, setDetail] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWarn, setShowWarn] = useState(false);
  const [animDir, setAnimDir] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const qid = quiz._id ?? quiz.id;
        const res = await quizService.getById(qid);
        const d = res.data?.data ?? res.data ?? res;
        const raw = d.questions ?? [];
        if (!raw.length) {
          alert("Quiz này chưa có câu hỏi!");
          onBack();
          return;
        }
        // Normalize: giữ correctAnswer là string text
        const normalized = raw.map((q) => ({
          question: q.question ?? q.q,
          options: q.options ?? [],
          correctAnswer: q.correctAnswer ?? q.answer ?? "",
          explanation: q.explanation ?? "",
        }));
        setDetail(d);
        setQuestions(shuffle(normalized).map(shuffleOpts));
      } catch (err) {
        console.error("Lỗi:", err);
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

  // Tính điểm
  const correctCount = Object.entries(answers).filter(([i, a]) => {
    const question = questions[Number(i)];
    return question && isCorrect(question, a);
  }).length;
  const wrongCount = Object.keys(answers).length - correctCount;
  const unanswered = total - Object.keys(answers).length;
  const scorePercent = Math.round((correctCount / total) * 100);

  const getMotivation = () => {
    if (scorePercent >= 80) return { text: "Xuất sắc!", sub: "Bạn đã làm rất tốt 🎉" };
    if (scorePercent >= 50) return { text: "Khá tốt!", sub: "Cố gắng thêm một chút nữa nhé 💪" };
    return { text: "Cần cố gắng thêm!", sub: "Xem lại bài và thử lại bạn nhé 📚" };
  };

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
    if (selected === undefined) { setShowWarn(true); return; }
    goTo(currentQ + 1, "left");
  };

  const handleSubmit = () => setShowResult(true);

  const slideClass =
    animDir === "left"
      ? "animate-[slideInLeft_0.2s_ease_both]"
      : animDir === "right"
        ? "animate-[slideInRight_0.2s_ease_both]"
        : "";

  // ── RESULT SCREEN ──────────────────────────────────────────────
  if (showResult) {
    const mot = getMotivation();
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (scorePercent / 100) * circumference;

    return (
      <div className="space-y-4">
        {/* Result card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#fff0eb 0%,#ffe4dc 100%)", border: "1px solid #fcd5c8" }}>
          {/* Badge */}
          <div className="flex justify-center pt-5 pb-2">
            <span className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              Hoàn Thành
            </span>
          </div>

          {/* Circle progress */}
          <div className="flex justify-center py-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#fcd5c8" strokeWidth="7" />
                <circle
                  cx="40" cy="40" r="36" fill="none"
                  stroke={scorePercent >= 80 ? "#22c55e" : scorePercent >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-gray-900">{scorePercent}</span>
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="text-center pb-4 px-4">
            <p className="text-base font-bold text-gray-900">{mot.text}</p>
            <p className="text-xs text-gray-500 mt-0.5">{mot.sub}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mx-4 mb-4">
            {[
              { label: "Hoàn thành", value: Object.keys(answers).length, icon: "📋", color: "#6b7280", bg: "#f9fafb" },
              { label: "Câu đúng",   value: correctCount,                  icon: "✅", color: "#16a34a", bg: "#f0fdf4" },
              { label: "Câu sai",    value: wrongCount,                    icon: "❌", color: "#dc2626", bg: "#fef2f2" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
                <div className="text-lg mb-0.5">{s.icon}</div>
                <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quiz name */}
          <p className="text-center text-xs text-gray-400 pb-4">{detail?.title ?? quiz.title}</p>
        </div>

        {/* Toggle detail */}
        <button
          onClick={() => setShowDetail((p) => !p)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <span>{showDetail ? "▲ Ẩn chi tiết" : "▼ Xem chi tiết"}</span>
        </button>

        {/* Detail list */}
        {showDetail && (
          <div className="space-y-3">
            {questions.map((question, idx) => {
              const userIdx = answers[idx];
              const correct = isCorrect(question, userIdx);
              const userText = userIdx !== undefined ? question.options[userIdx] : null;

              return (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">{idx + 1}</span>
                    <p className="text-sm font-medium text-gray-800 leading-5">{question.question}</p>
                    <span className={`ml-auto shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {correct ? "✓ Đúng" : "✗ Sai"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {question.options.map((opt, oi) => {
                      const isAns = opt === question.correctAnswer;
                      const isUser = oi === userIdx;
                      let cls = "border-gray-100 bg-gray-50 text-gray-600";
                      if (isAns) cls = "border-green-300 bg-green-50 text-green-800";
                      if (isUser && !correct) cls = "border-red-300 bg-red-50 text-red-700";

                      return (
                        <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${cls}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-[10px]
                            ${isAns ? "border-green-500 bg-green-500 text-white" : isUser && !correct ? "border-red-400 bg-red-400 text-white" : "border-gray-300 text-gray-400"}`}>
                            {["A","B","C","D"][oi]}
                          </div>
                          <span className="flex-1">{opt}</span>
                          {isAns && <span className="text-green-600 font-bold text-[10px]">✓ Đáp án đúng</span>}
                          {isUser && !correct && <span className="text-red-500 font-bold text-[10px]">✗ Bạn chọn</span>}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-2">
                      <span className="text-sm">💡</span>
                      <p className="text-xs text-yellow-800 leading-5">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={() => { setShowResult(false); setAnswers({}); setCurrentQ(0); }}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Làm lại
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: "#F26739" }}
          >
            Quay lại
          </button>
        </div>

        <style>{`
          @keyframes slideInLeft  { from{opacity:0;transform:translateX(24px)}  to{opacity:1;transform:translateX(0)} }
          @keyframes slideInRight { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        `}</style>
      </div>
    );
  }

  // ── QUIZ SCREEN ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Danh sách bài kiểm tra
        </button>
        <span className="text-xs text-gray-400">{quiz.title}</span>
      </div>

      {/* Question card */}
      <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm ${slideClass}`}>
        <div className="flex items-start gap-3 mb-4">
          <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
            Câu {currentQ + 1}/{total}
          </span>
          <p className="text-sm font-medium text-gray-800 leading-6 pt-0.5">{q.question}</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">Chọn 1 đáp án đúng</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { setAnswers((p) => ({ ...p, [currentQ]: i })); setShowWarn(false); }}
              className={`w-full flex items-center gap-3 p-3 border rounded-xl text-left transition-all ${
                selected === i ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all font-bold text-xs ${
                selected === i ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 text-gray-500"
              }`}>
                {["A","B","C","D"][i]}
              </div>
              <span className={`text-sm ${selected === i ? "text-blue-700 font-medium" : "text-gray-700"}`}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress + Navigation */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500 tabular-nums">{currentQ + 1} / {total}</span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-1.5 bg-blue-500 rounded-full transition-all duration-400" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400 tabular-nums">{Math.round(progress)}%</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => goTo(currentQ - 1, "right")}
            disabled={currentQ === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Trước
          </button>

          {/* Page dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }, (_, i) => i)
              .filter((i) => i === 0 || i === total - 1 || Math.abs(i - currentQ) <= 1)
              .map((i, arrIdx, arr) => (
                <span key={i} className="flex items-center gap-1.5">
                  {arrIdx > 0 && arr[arrIdx] - arr[arrIdx - 1] > 1 && (
                    <span className="text-gray-300 text-xs">…</span>
                  )}
                  <button
                    onClick={() => goTo(i, i > currentQ ? "left" : "right")}
                    className={`w-7 h-7 text-xs rounded-lg border font-medium transition-all ${
                      currentQ === i ? "bg-blue-500 text-white border-blue-500"
                        : answers[i] !== undefined ? "bg-blue-50 text-blue-500 border-blue-200"
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
                showWarn ? "bg-red-500 animate-[warnShake_0.4s_ease_both]"
                  : selected !== undefined ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              {showWarn ? "Chọn đáp án!" : "Câu tiếp"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#F26739] hover:bg-orange-600 transition"
            >
              Nộp bài
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex justify-between mt-2.5">
          <button
            onClick={() => { setCurrentQ(0); setAnswers({}); }}
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
        @keyframes slideInLeft  { from{opacity:0;transform:translateX(24px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes warnShake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
      `}</style>
    </div>
  );
}