// FlashcardPageInline.jsx
import { useState, useEffect, useRef } from "react";
import api from "../../../lib/api";

export default function FlashcardPageInline({ flash, onBack }) {
  const [cards, setCards] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [animDir, setAnimDir] = useState(null);
  const animRef = useRef(null);

  const [deckName, setDeckName] = useState(flash.title ?? "");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const existingCards = flash.cards ?? [];
    if (existingCards.length > 0) {
      setCards(
        existingCards.map((c) => ({
          q: c.front ?? c.question ?? "",
          a: c.back ?? c.answer ?? "",
        })),
      );
      return;
    }
    alert("Bộ thẻ này chưa có nội dung!");
    onBack();
  }, [flash._id]);

  if (!cards)
    return (
      <div className="flex items-center justify-center py-16 gap-3">
        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Đang tải flashcard...</p>
      </div>
    );

  // Setup screen — shown after cards are loaded, before starting
  if (!started)
    return (
      <div className="space-y-5">
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
            Danh sách bộ thẻ
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-800">
            ⚙️ Cài đặt bộ flashcard
          </h2>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Tên bộ thẻ
            </label>
            <input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-400 transition"
              placeholder="Nhập tên bộ thẻ..."
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
            <span>🃏 {cards.length} thẻ</span>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition"
            style={{ background: "#8b5cf6" }}
          >
            Bắt đầu học →
          </button>
        </div>
      </div>
    );

  const total = cards.length;
  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / total) * 100;

  const goTo = (next, dir) => {
    if (next < 0 || next >= total) return;
    setAnimDir(dir);
    clearTimeout(animRef.current);
    animRef.current = setTimeout(() => {
      setCurrentIndex(next);
      setIsFlipped(false);
      setAnimDir(null);
    }, 180);
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
          Danh sách bộ thẻ
        </button>
        <span className="text-xs text-gray-400">{deckName || flash.title}</span>
      </div>

      {/* Flashcard */}
      <div
        className={`relative w-full min-h-[320px] rounded-xl border-2 flex flex-col p-6 cursor-pointer transition-all duration-300 shadow-sm ${slideClass} ${
          isFlipped
            ? "bg-[#47ED70] border-[#36BA58]"
            : "bg-[#F4F4F5] border-[#E4E4E7]"
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flex justify-start mb-4">
          <span
            className={`text-[12px] px-4 py-1.5 rounded-full font-bold shadow-sm ${
              isFlipped ? "bg-white text-[#36BA58]" : "bg-[#1473E6] text-white"
            }`}
          >
            {isFlipped
              ? `ĐÁP ÁN ${currentIndex + 1}`
              : `CÂU HỎI ${currentIndex + 1}`}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <p
            className={`text-[22px] font-extrabold leading-tight max-w-[800px] ${
              isFlipped ? "text-[#064E3B]" : "text-[#18181B]"
            }`}
          >
            {isFlipped ? card.a : card.q}
          </p>
        </div>

        {!isFlipped && (
          <div className="flex justify-center mt-4">
            <div className="bg-purple-500 text-white text-[13px] px-5 py-2 rounded-xl font-bold shadow-md animate-bounce">
              Chạm để xem đáp án 👆
            </div>
          </div>
        )}
      </div>

      {/* Progress + Navigation */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500 tabular-nums">
            {currentIndex + 1} / {total}
          </span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-purple-500 rounded-full transition-all duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => goTo(currentIndex - 1, "right")}
            disabled={currentIndex === 0}
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
                  i === 0 || i === total - 1 || Math.abs(i - currentIndex) <= 1,
              )
              .map((i, arrIdx, arr) => (
                <span key={i} className="flex items-center gap-1.5">
                  {arrIdx > 0 && arr[arrIdx] - arr[arrIdx - 1] > 1 && (
                    <span className="text-gray-300 text-xs">…</span>
                  )}
                  <button
                    onClick={() => goTo(i, i > currentIndex ? "left" : "right")}
                    className={`w-7 h-7 text-xs rounded-lg border font-medium transition-all ${
                      currentIndex === i
                        ? "bg-purple-500 text-white border-purple-500"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                </span>
              ))}
          </div>

          {currentIndex < total - 1 ? (
            <button
              onClick={() => goTo(currentIndex + 1, "left")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-500 hover:bg-purple-600 transition"
            >
              Tiếp theo
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
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition"
            >
              ✓ Hoàn thành
            </button>
          )}
        </div>

        <div className="flex justify-start mt-2.5">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Học lại từ đầu
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}