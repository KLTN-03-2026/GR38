// HocQuizz.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useBeforeUnload } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, Loader2, LogOut, CheckCircle2 } from "lucide-react";
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [animDir,         setAnimDir]         = useState(null);
  const [saveStatus,      setSaveStatus]      = useState(null); // null | "saving" | "saved" | "error"

  const timerRef         = useRef(null);
  const animRef          = useRef(null);
  const timeLimitRef     = useRef(600);
  const pendingNavTarget = useRef(null);
  const isExitingRef     = useRef(false); // bypass click blocker khi thoát

  // ── Chặn reload/đóng tab ─────────────────────────────────────────────────
  useBeforeUnload(
    React.useCallback((e) => {
      if (!isFinished) {
        e.preventDefault();
        e.returnValue = "";
      }
    }, [isFinished])
  );

  // ── Chặn click sidebar/nav bên ngoài component ───────────────────────────
  useEffect(() => {
    if (isFinished) return;

    const handleClick = (e) => {
      if (isExitingRef.current) return; // đang thoát, không chặn
      const target = e.target.closest("a, button");
      if (!target) return;

      const quizRoot = document.getElementById("hoc-quizz-root");
      if (quizRoot && quizRoot.contains(target)) return;

      e.preventDefault();
      e.stopPropagation();
      pendingNavTarget.current = target;
      setShowExitConfirm(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isFinished]);

  // ── Fetch quiz ────────────────────────────────────────────────────────────
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

          // (không restore session – bắt đầu mới)
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Timer ─────────────────────────────────────────────────────────────────
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

  // ── Lưu tiến trình qua API ───────────────────────────────────────────────
  const handleSave = async () => {
    if (saveStatus === "saving") return;
    try {
      setSaveStatus("saving");
      // Transform {[questionId]: {index, text}} → [{questionId, selectedOption}]
      const answersArr = Object.entries(selectedAnswers).map(([questionId, val]) => ({
        questionId,
        selectedOption: val.text ?? null,
      }));
      await api.post("/quiz-session/save-progress", {
        quizId:               id,
        answers:              answersArr,
        timeRemaining:        timeLeft,
        currentQuestionIndex: currentIdx,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const doSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    try {
      if (!auto) setLoading(true);
      const userAnswers = questions.map(q => ({
        questionId:     q._id,
        selectedAnswer: selectedAnswers[q._id]?.text || "",
      }));
      const resSubmit = await api.post(`/quizzes/${id}/submit`, { userAnswers });
      const result    = resSubmit.data?.data || resSubmit.data;
      const rId       = result?.resultId || result?._id || result?.id;
      const correct   = result?.correctAnswersCount ?? result?.score ?? 0;
      const total     = result?.totalQuestions ?? questions.length;
      const scoreOn10 = total > 0 ? parseFloat(((correct / total) * 10).toFixed(1)) : 0;

      setScoreData({ resultId: rId, score: scoreOn10, total });
      setIsFinished(true);
    } catch (err) {
      console.error(err);
    } finally {
      if (!auto) setLoading(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = (next, dir) => {
    if (next < 0 || next >= questions.length) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => { setCurrentIdx(next); setAnimDir(null); }, 180);
  };

  const handleNext = () => goTo(currentIdx + 1, "left");
  const handlePrev = () => goTo(currentIdx - 1, "right");
  const handleJump = (i) => { if (i !== currentIdx) goTo(i, i > currentIdx ? "left" : "right"); };

  // ── Exit handlers ─────────────────────────────────────────────────────────
  const handleExit = () => setShowExitConfirm(true);

  const handleConfirmExit = () => {
    clearInterval(timerRef.current);
    isExitingRef.current = true; // tắt click blocker
    setShowExitConfirm(false);

    const target = pendingNavTarget.current;
    pendingNavTarget.current = null;

    setTimeout(() => {
      if (target) {
        target.click();
      } else {
        navigate(-1);
      }
    }, 50);
  };

  const handleCancelExit = () => {
    pendingNavTarget.current = null;
    setShowExitConfirm(false);
  };

  // ── Finished ──────────────────────────────────────────────────────────────
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

  // ── Save button state config ──────────────────────────────────────────────
  const saveConfig = {
    saving: {
      bg:     "linear-gradient(135deg,#e0f2fe,#dbeafe)",
      border: "#93c5fd",
      color:  "#2563eb",
      icon:   <Loader2 size={13} className="animate-spin" />,
      label:  "Đang lưu...",
    },
    saved: {
      bg:     "linear-gradient(135deg,#dcfce7,#d1fae5)",
      border: "#6ee7b7",
      color:  "#059669",
      icon:   <CheckCircle2 size={13} />,
      label:  "Đã lưu!",
    },
    error: {
      bg:     "linear-gradient(135deg,#fee2e2,#fecaca)",
      border: "#fca5a5",
      color:  "#dc2626",
      icon:   <AlertCircle size={13} />,
      label:  "Lỗi lưu",
    },
    default: {
      bg:     "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
      border: "#7dd3fc",
      color:  "#0369a1",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]">
          <path d="M13 11v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6.5L13 4.5V7" />
          <path d="M10 2v3H5V2M5 8h4M5 10.5h3" />
        </svg>
      ),
      label:  "Lưu tiến trình",
    },
  };

  const activeSave = saveConfig[saveStatus ?? "default"];

  return (
    <div id="hoc-quizz-root" className="h-full flex flex-col bg-gray-50 overflow-hidden" style={{ fontFamily: "inherit" }}>
      <style>{`
        @keyframes slideLeft  { from { opacity:1; transform:translateX(0);    } to { opacity:0; transform:translateX(-24px); } }
        @keyframes slideRight { from { opacity:1; transform:translateX(0);    } to { opacity:0; transform:translateX(24px);  } }
        @keyframes slideIn    { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0);     } }
        @keyframes fadeIn     { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0);     } }
        @keyframes savePopin  { 0% { transform:scale(0.88); opacity:0; } 60% { transform:scale(1.06); } 100% { transform:scale(1); opacity:1; } }
        @keyframes shimmer    { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

        .anim-slide-left  { animation: slideLeft  0.18s ease forwards; }
        .anim-slide-right { animation: slideRight 0.18s ease forwards; }
        .slide-in         { animation: slideIn    0.2s  ease forwards; }
        .fade-in          { animation: fadeIn     0.2s  ease forwards; }
        .save-popin       { animation: savePopin  0.28s cubic-bezier(.34,1.56,.64,1) forwards; }

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

        /* ── Save button ── */
        .save-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
          border-width: 1.5px;
          border-style: solid;
        }
        .save-btn:not(:disabled):hover {
          transform: translateY(-1.5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.10);
          filter: brightness(0.97);
        }
        .save-btn:not(:disabled):active { transform: translateY(0px); }
        .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .save-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .save-btn:not(:disabled):hover::after { transform: translateX(100%); }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
        <button onClick={handleExit} className="flex items-center gap-2 text-sm text-gray-500 back-btn">
          <ArrowLeft size={16} /> Rời khỏi
        </button>

        {/* ── Save button (header) ── */}
        <div className="flex items-center gap-2.5">

          <button
            onClick={handleSave}
            disabled={answeredCount === 0 || saveStatus === "saving"}
            className="save-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
            style={{
              background:   activeSave.bg,
              borderColor:  activeSave.border,
              color:        activeSave.color,
            }}
          >
            <span className={saveStatus === "saved" || saveStatus === "error" ? "save-popin" : ""}>
              {activeSave.icon}
            </span>
            <span>{activeSave.label}</span>
          </button>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đang thi</p>
          <p className="text-xs font-black text-gray-700 uppercase truncate max-w-[200px]">{quizInfo?.title || "..."}</p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
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

                {/* Nút lưu trong panel */}
                <button
                  onClick={handleSave}
                  disabled={answeredCount === 0 || saveStatus === "saving"}
                  className="save-btn mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background:  activeSave.bg,
                    borderColor: activeSave.border,
                    color:       activeSave.color,
                  }}
                >
                  <span className={saveStatus === "saved" || saveStatus === "error" ? "save-popin" : ""}>
                    {activeSave.icon}
                  </span>
                  <span>
                    {saveStatus === "saving" ? "Đang lưu..."
                      : saveStatus === "saved" ? "Đã lưu!"
                      : saveStatus === "error" ? "Lỗi – thử lại"
                      : "Lưu tiến trình"}
                  </span>
                </button>

                <button onClick={() => setShowConfirm(true)}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white submit-btn"
                  style={{ background: "linear-gradient(135deg,#F26739,#FF8059)" }}>
                  <Send size={13} /> Nộp bài
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Popup xác nhận nộp bài ───────────────────────────────────────── */}
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

      {/* ── Popup xác nhận thoát ─────────────────────────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <LogOut className="text-red-500" size={24} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Bạn muốn rời khỏi bài thi?</h3>
              <p className="text-xs text-gray-500 leading-5">
                Tiến trình làm bài sẽ <strong className="text-red-500">không được lưu</strong> nếu bạn thoát ngay bây giờ.
                {answeredCount > 0 && (
                  <span className="block mt-1 text-gray-400">Bạn đã trả lời {answeredCount}/{total} câu.</span>
                )}
              </p>
              {/* Gợi ý lưu trước khi thoát */}
              {answeredCount > 0 && (
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className="save-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background:  activeSave.bg,
                    borderColor: activeSave.border,
                    color:       activeSave.color,
                  }}
                >
                  {activeSave.icon}
                  <span>
                    {saveStatus === "saving" ? "Đang lưu..."
                      : saveStatus === "saved" ? "Đã lưu!"
                      : "Lưu câu trả lời trước khi thoát"}
                  </span>
                </button>
              )}
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={handleCancelExit}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                Tiếp tục làm bài
              </button>
              <button onClick={handleConfirmExit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "#ef4444" }}>
                Rời khỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HocQuizz;