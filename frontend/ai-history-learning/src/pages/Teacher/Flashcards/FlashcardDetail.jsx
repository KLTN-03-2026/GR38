import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Sparkles, Star } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../lib/api";

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const rawDocId = location.state?.documentId ?? sessionStorage.getItem(`flash_docId_${id}`);
  const documentId = typeof rawDocId === "object" && rawDocId !== null ? rawDocId?._id : rawDocId;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(new Set());
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [starredMap, setStarredMap] = useState({});

  const handleToggleStar = async (e, cardId, idx) => {
    e.stopPropagation();
    if (!cardId) return;
    const next = !getStarred(idx);
    setStarredMap(prev => ({ ...prev, [idx]: next }));
    try {
      await api.put(`/flashcards/${id}/cards/${cardId}/star`);
    } catch {
      setStarredMap(prev => ({ ...prev, [idx]: !next }));
    }
  };

  const getStarred = (idx) => {
    if (starredMap[idx] !== undefined) return starredMap[idx];
    return flashcardSet?.questions?.[idx]?.isStarred ?? false;
  };

  useEffect(() => {
    if (location.state?.documentId)
      sessionStorage.setItem(`flash_docId_${id}`, location.state.documentId);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
        const found = local.find((item) => String(item.id) === String(id));

        if (found) {
          const questions = (Array.isArray(found.cards) ? found.cards : [])
            .map((c) => ({
              _id: c._id ?? c.id ?? null,
              q: c.front ?? c.question ?? c.term ?? "",
              a: c.back ?? c.answer ?? c.definition ?? "",
              difficulty: c.difficulty ?? null,
              isStarred: c.isStarred ?? false,
            }))
            .filter((c) => c.q || c.a);
          const hasMissingIds = questions.some((q) => !q._id);
          if (questions.length > 0 && !hasMissingIds) {
            setFlashcardSet({ title: found.title, questions });
            return;
          }
        }

        // Gọi đúng route GET /flashcards/:id — backend sẽ merge FlashcardProgress vào cards
        const res = await api.get(`/flashcards/${id}`);
        const raw = res.data.data ?? res.data ?? null;
        if (!raw) { setFlashcardSet(null); return; }

        const questions = (raw?.cards ?? raw?.items ?? []).map((c) => ({
          _id: c._id ?? c.id ?? null,
          q: c.front ?? c.question ?? c.term ?? "",
          a: c.back ?? c.answer ?? c.definition ?? "",
          difficulty: c.difficulty ?? null,
          isStarred: c.isStarred ?? false,
        }));
        setFlashcardSet({ title: raw?.title ?? "Flashcard", questions });
      } catch {
        setFlashcardSet(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const goBack = () => navigate("/teacher/flashcards");

  const handleFlip = async () => {
    if (animating) return;
    const current = flashcardSet?.questions?.[currentIndex];
    if (!isFlipped && current && !current.a && current._id) {
      try {
        const res = await api.get(`/flashcards/${id}/cards/${current._id}/back`);
        const backData = res?.data?.data || res?.data || null;
        if (backData?.back !== undefined) {
          setFlashcardSet((prev) => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
              idx === currentIndex ? { ...q, a: backData.back } : q
            )
          }));
        }
      } catch (err) {
        // ignore back fetch error
      }
    }
    if (!isFlipped) setAnswered((prev) => new Set(prev).add(currentIndex));
    setIsFlipped((prev) => !prev);
  };

  const goTo = (i) => {
    const maxReachable = Math.max(...[...answered], -1) + 1;
    if (i > maxReachable) return;
    if (animating) return;
    setAnimating(true);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i);
      setAnimating(false);
    }, 320);
  };

  const handleNext = () => {
    if (answered.has(currentIndex) && currentIndex < flashcardSet.questions.length - 1)
      goTo(currentIndex + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0 && answered.has(currentIndex - 1))
      goTo(currentIndex - 1);
  };
  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswered(new Set());
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#F7F6F2" }}>
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-orange-200" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
        <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, color: "#9CA3AF", letterSpacing: "0.05em" }}>
          Đang tải flashcard...
        </p>
      </div>
    </div>
  );

  if (!flashcardSet || !flashcardSet.questions?.length) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5" style={{ background: "#F7F6F2" }}>
      <div style={{ fontSize: 48 }}>📭</div>
      <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600, color: "#374151" }}>
        Không tìm thấy bộ flashcard này.
      </p>
      <button onClick={goBack} style={{
        background: "#1C1917", color: "#fff", fontFamily: "'Be Vietnam Pro', sans-serif",
        fontWeight: 600, fontSize: 13, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer"
      }}>
        Quay lại
      </button>
    </div>
  );

  const { title, questions } = flashcardSet;
  const total = questions.length;
  const answeredCount = answered.size;
  const progressPct = (answeredCount / total) * 100;
  const isDone = answeredCount === total;
  const canPrev = currentIndex > 0 && answered.has(currentIndex - 1);
  const canNext = answered.has(currentIndex) && currentIndex < total - 1;

  const difficultyConfig = {
    "Dễ":       { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    "Trung bình": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    "Khó":      { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        .fc-card-scene { perspective: 1400px; height: 340px; }

        .fc-card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.45, 0.05, 0.15, 1.0);
          cursor: pointer;
        }

        .fc-card-inner.flipped { transform: rotateY(180deg); }

        .fc-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          padding: 32px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .fc-face-front {
          background: #ffffff;
          border: 1.5px solid #E5E7EB;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }

        .fc-face-back {
          background: linear-gradient(145deg, #F26739 0%, #F5895A 100%);
          border: 1.5px solid #E8541A;
          box-shadow: 0 4px 24px rgba(242,103,57,0.28), 0 1px 4px rgba(242,103,57,0.15);
          transform: rotateY(180deg);
        }

        .fc-face-back::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .fc-flip-btn {
          border: 1.5px solid #E5E7EB;
          background: transparent;
          border-radius: 50px;
          padding: 8px 22px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }

        .fc-flip-btn:hover {
          background: #F9FAFB;
          border-color: #D1D5DB;
          transform: translateY(-1px);
        }

        .fc-flip-btn-back {
          border-color: rgba(255,255,255,0.35);
          color: rgba(255,255,255,0.85);
        }

        .fc-flip-btn-back:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.6);
          color: #fff;
        }

        .fc-dot-btn {
          width: 28px; height: 28px;
          border-radius: 8px;
          border: none;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .fc-dot-btn:hover:not(:disabled) { transform: translateY(-1px); }

        .fc-nav-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 600;
          background: none; border: none; cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.15s ease;
          padding: 8px 0;
        }

        .fc-nav-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .fc-nav-btn:not(:disabled):hover { transform: translateX(-2px); }
        .fc-nav-btn.next:not(:disabled):hover { transform: translateX(2px); }

        .fc-progress-fill {
          height: 3px;
          background: linear-gradient(90deg, #F26739, #F5A470);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0 2px 2px 0;
        }

        .fc-done-banner {
          background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
          border: 1.5px solid #A7F3D0;
          border-radius: 14px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 10px;
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fc-card-enter {
          animation: cardIn 0.3s ease;
        }

        @keyframes cardIn {
          from { opacity: 0.6; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        .fc-difficulty-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 50px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.04em;
        }

        .fc-star-btn {
          background: none; border: none; cursor: pointer;
          padding: 4px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s ease;
        }
        .fc-star-btn:hover { transform: scale(1.25); }
        .fc-star-btn:active { transform: scale(0.9); }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: "#fff", borderBottom: "1.5px solid #F3F4F6",
        padding: "0 24px", height: 54,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <button onClick={goBack} style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 13, fontWeight: 600, color: "#6B7280",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          transition: "color 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#1C1917"}
          onMouseLeave={e => e.currentTarget.style.color = "#6B7280"}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          Quay lại
        </button>

        <span style={{
          fontSize: 14, fontWeight: 700, color: "#1C1917",
          maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
        }}>
          {title}
        </span>

        <button onClick={handleReset} style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, fontWeight: 600, color: "#9CA3AF",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          transition: "color 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#374151"}
          onMouseLeave={e => e.currentTarget.style.color = "#9CA3AF"}
        >
          <RotateCcw size={12} strokeWidth={2.5} />
          Làm lại
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#F3F4F6" }}>
        <div className="fc-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>

        {/* Counter row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em" }}>
            {currentIndex + 1} <span style={{ color: "#D1D5DB" }}>/</span> {total}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isDone && <Sparkles size={12} style={{ color: "#F26739" }} />}
            <span style={{ fontSize: 12, fontWeight: 600, color: isDone ? "#F26739" : "#9CA3AF" }}>
              {isDone ? "Hoàn thành!" : `${answeredCount} / ${total} đã xem`}
            </span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="fc-card-scene" onClick={handleFlip}>
          <div className={`fc-card-inner ${isFlipped ? "flipped" : ""}`}>

            {/* Front face */}
            <div className="fc-face fc-face-front">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "#D1D5DB"
                }}>
                  Câu hỏi
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {questions[currentIndex].difficulty && (() => {
                    const cfg = difficultyConfig[questions[currentIndex].difficulty] ?? { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" };
                    return (
                      <span className="fc-difficulty-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {questions[currentIndex].difficulty}
                      </span>
                    );
                  })()}
                  <button
                    className="fc-star-btn"
                    onClick={e => handleToggleStar(e, questions[currentIndex]._id, currentIndex)}
                    title={getStarred(currentIndex) ? "Bỏ đánh dấu sao" : "Đánh dấu sao"}
                  >
                    <Star
                      size={16}
                      strokeWidth={2}
                      style={{
                        fill: getStarred(currentIndex) ? "#FBBF24" : "none",
                        color: getStarred(currentIndex) ? "#FBBF24" : "#D1D5DB",
                        transition: "all 0.2s ease"
                      }}
                    />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
                <p style={{
                  fontSize: 20, fontWeight: 700, color: "#1C1917",
                  lineHeight: 1.45, textAlign: "center", margin: 0
                }}>
                  {questions[currentIndex].q}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="fc-flip-btn" style={{ color: "#6B7280" }}
                  onClick={e => { e.stopPropagation(); handleFlip(); }}>
                  Xem đáp án
                </button>
              </div>
            </div>

            {/* Back face */}
            <div className="fc-face fc-face-back">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.6)"
                }}>
                  Đáp án
                </span>
                {questions[currentIndex].difficulty && (() => {
                  return (
                    <span className="fc-difficulty-badge" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      {questions[currentIndex].difficulty}
                    </span>
                  );
                })()}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
                <p style={{
                  fontSize: 20, fontWeight: 700, color: "#FFFFFF",
                  lineHeight: 1.45, textAlign: "center", margin: 0
                }}>
                  {questions[currentIndex].a || "..."}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="fc-flip-btn fc-flip-btn-back"
                  onClick={e => { e.stopPropagation(); handleFlip(); }}>
                  Xem lại câu hỏi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hint text */}
        {!isFlipped && (
          <p style={{
            textAlign: "center", fontSize: 11, color: "#C4C4BF",
            marginTop: 10, fontWeight: 500, letterSpacing: "0.03em"
          }}>
            Nhấn vào thẻ để lật
          </p>
        )}

        {/* Done banner */}
        {isDone && (
          <div className="fc-done-banner" style={{ marginTop: 16 }}>
            <CheckCircle2 size={16} style={{ color: "#10B981", flexShrink: 0 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#065F46", margin: 0, flex: 1 }}>
              Xuất sắc! Đã xem hết {total} thẻ 
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={handleReset} style={{
                fontSize: 12, fontWeight: 700, color: "#059669",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Be Vietnam Pro', sans-serif",
                textDecoration: "underline", textUnderlineOffset: 2
              }}>
                Làm lại
              </button>
              <span style={{ color: "#A7F3D0", fontSize: 12 }}>|</span>
              <button onClick={goBack} style={{
                fontSize: 12, fontWeight: 700, color: "#059669",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Be Vietnam Pro', sans-serif",
                textDecoration: "underline", textUnderlineOffset: 2
              }}>
                Trang flashcard
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          <button className="fc-nav-btn" onClick={handlePrev} disabled={!canPrev} style={{ color: "#6B7280" }}>
            <ChevronLeft size={16} strokeWidth={2.5} /> Trước
          </button>

          {/* Card counter */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#1C1917", letterSpacing: "-0.02em" }}>
              {currentIndex + 1}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#D1D5DB" }}>/</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#9CA3AF" }}>{total}</span>
          </div>

          <button className="fc-nav-btn next" onClick={handleNext} disabled={!canNext} style={{ color: "#6B7280" }}>
            Tiếp <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default FlashcardDetail;