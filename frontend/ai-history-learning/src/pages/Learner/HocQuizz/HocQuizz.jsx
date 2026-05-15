// HocQuizz.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, Loader2, Timer as TimerIcon } from "lucide-react";
import api from "../../../lib/api";
import QuizResult from "./QuizResult";

const HocQuizz = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questions,       setQuestions]       = useState([]);
  const [quizInfo,        setQuizInfo]        = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [currentIdx,      setCurrentIdx]      = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft,        setTimeLeft]        = useState(600);
  const [isFinished,      setIsFinished]      = useState(false);
  const [scoreData,       setScoreData]       = useState(null);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [animDir,         setAnimDir]         = useState(null);
  const timerRef     = useRef(null);
  const animRef      = useRef(null);
  const timeLimitRef = useRef(600);

  // ── Fetch quiz ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res  = await api.get(`/quizzes/${id}/play`);
        const data = res?.data?.data || res?.data;
        if (data) {
          setQuizInfo(data);
          const qs = data.questions || [];
          setQuestions(qs);
          const mins = (data.timeLimit ?? data.time_limit) > 0
            ? (data.timeLimit ?? data.time_limit)
            : qs.length > 5 ? qs.length + 5 : 10;
          const secs = mins * 60;
          timeLimitRef.current = secs;
          setTimeLeft(secs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFinished && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) { clearInterval(timerRef.current); doSubmit(true); return 0; }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, questions]);

  const formatTime = (sec) =>
    `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const doSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    try {
      if (!auto) setLoading(true);
      const userAnswers = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: selectedAnswers[q._id]?.text || "",
      }));
      const resSubmit = await api.post(`/quizzes/${id}/submit`, { userAnswers });
      const result    = resSubmit.data?.data || resSubmit.data;
      const rId       = result?.resultId || result?._id || result?.id;
     const correct = result?.correctAnswersCount ?? result?.score ?? 0;
    const total   = result?.totalQuestions ?? questions.length;
const scoreOn10 = total > 0 ? parseFloat(((correct / total) * 10).toFixed(1)) : 0;

setScoreData({
  resultId: rId,
  score:    scoreOn10,   // ← giờ là thang 10
  total:    total,
});
      setIsFinished(true);
    } catch (err) {
      console.error(err);
    } finally {
      if (!auto) setLoading(false);
    }
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goTo = (next, dir) => {
    if (next < 0 || next >= questions.length) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => { setCurrentIdx(next); setAnimDir(null); }, 180);
  };

  const handleNext = () => goTo(currentIdx + 1, "left");
  const handlePrev = () => goTo(currentIdx - 1, "right");
  const handleJump = (i) => { if (i !== currentIdx) goTo(i, i > currentIdx ? "left" : "right"); };

  // ── Finished ────────────────────────────────────────────────────────────────
  if (isFinished) {
    return <QuizResult quiz={quizInfo} resultId={scoreData?.resultId} score={scoreData?.score} total={scoreData?.total} />;
  }

  const currentQ      = questions[currentIdx];
  const total         = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress      = total > 0 ? (answeredCount / total) * 100 : 0;
  const timeRatio     = timeLeft / timeLimitRef.current;
  const isLow         = timeLeft <= 60;
  const selectedIdx   = currentQ ? selectedAnswers[currentQ._id]?.index : undefined;

  const slideClass =
    animDir === "left" ? "anim-slide-left" : animDir === "right" ? "anim-slide-right" : "";

  const getStatus = (i) => {
    const q = questions[i];
    if (i === currentIdx) return "current";
    if (q && selectedAnswers[q._id]) return "answered";
    return "unanswered";
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden" style={{ fontFamily: "inherit" }}>
      <style>{`
        @keyframes slideLeft  { from { opacity:1; transform:translateX(0);    } to { opacity:0; transform:translateX(-24px); } }
        @keyframes slideRight { from { opacity:1; transform:translateX(0);    } to { opacity:0; transform:translateX(24px);  } }
        @keyframes slideIn    { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0);     } }

        .anim-slide-left  { animation: slideLeft  0.18s ease forwards; }
        .anim-slide-right { animation: slideRight 0.18s ease forwards; }
        .slide-in         { animation: slideIn    0.2s ease forwards;  }

        .option-btn { transition: all 0.15s ease; border: 2px solid #e5e7eb; background: white; }
        .option-btn:hover:not(.selected) { border-color: #93c5fd; background: #eff6ff; }
        .option-btn.selected { border-color: #3b82f6; background: #eff6ff; }

        .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .nav-btn:not(:disabled):hover { background: #f3f4f6; }

        .q-dot { transition: all 0.15s; cursor: pointer; border: 2px solid transparent; }
        .q-dot:hover { transform: scale(1.12); }
        .q-dot.current    { background: #f26739; color: white; border-color: #f26739; }
        .q-dot.answered   { background: #fb923c; color: white; border-color: #fb923c; }
        .q-dot.unanswered { background: white;   color: #6b7280; border-color: #e5e7eb; }

        .progress-bar { transition: width 0.4s ease; }
        .time-bar     { transition: width 1s linear; }
        .submit-btn   { transition: all 0.15s; }
        .submit-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .back-btn { transition: color 0.15s; }
        .back-btn:hover { color: #f26739; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 back-btn">
          <ArrowLeft size={16} /> Rời khỏi
        </button>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono font-black text-base border-2 transition-all ${
          isLow ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-orange-50 border-orange-100 text-orange-600"
        }`}>
          <TimerIcon size={16} />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đang thi</p>
          <p className="text-xs font-black text-gray-700 uppercase truncate max-w-[200px]">{quizInfo?.title || "..."}</p>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-orange-500" size={36} />
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Đang tải...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto w-full">

            {/* Progress bars */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-medium text-gray-500 tabular-nums whitespace-nowrap">{answeredCount} / {total}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-1.5 bg-blue-500 rounded-full progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-400 tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-xs font-bold tabular-nums whitespace-nowrap ${isLow ? "text-red-500" : "text-orange-500"}`}>
                {formatTime(timeLeft)}
              </span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-1.5 rounded-full time-bar" style={{
                  width: `${timeRatio * 100}%`,
                  background: isLow ? "#ef4444" : timeRatio <= 0.25 ? "#f97316" : "#f59e0b",
                }} />
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 items-start">

              {/* ── Câu hỏi ── */}
              <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden ${slideClass}`}
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
                <div className="flex items-start gap-3 mb-5">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0">
                    Câu {currentIdx + 1}/{total}
                  </span>
                  <p className="text-gray-800 text-sm font-medium leading-6 pt-0.5">{currentQ?.question}</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">Chọn 1 đáp án đúng</p>
                <div className="space-y-2.5">
                  {currentQ?.options?.map((opt, i) => {
                    const labelLetter = String.fromCharCode(65 + i);
                    const isSelected  = selectedIdx === i;
                    return (
                      <button key={i}
                        onClick={() => setSelectedAnswers(p => ({ ...p, [currentQ._id]: { index: i, text: opt } }))}
                        className={`option-btn w-full flex items-center gap-3 p-3.5 rounded-xl text-left ${isSelected ? "selected" : ""}`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-all ${
                          isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}>{labelLetter}</span>
                        <span className={`text-sm ${isSelected ? "text-blue-700 font-semibold" : "text-gray-700"}`}>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation footer */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button onClick={handlePrev} disabled={currentIdx === 0}
                    className="nav-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </button>

                  {currentIdx < total - 1 ? (
                    <button onClick={handleNext}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white submit-btn"
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
                      <Send size={14} /> Nộp bài
                    </button>
                  )}
                </div>
              </div>

              {/* ── Navigator panel ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm sticky top-4">
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-3">Danh sách câu</p>
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, i) => (
                    <button key={i} onClick={() => handleJump(i)}
                      className={`q-dot w-9 h-9 rounded-xl text-xs font-bold ${getStatus(i)}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowConfirm(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white submit-btn"
                  style={{ background: "linear-gradient(135deg,#F26739,#FF8059)" }}>
                  <Send size={13} /> Nộp bài
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Popup xác nhận nộp bài ─────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                <AlertCircle className="text-orange-500" size={24} />
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
              <button onClick={() => { setShowConfirm(false); doSubmit(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "#f26739" }}>
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HocQuizz;