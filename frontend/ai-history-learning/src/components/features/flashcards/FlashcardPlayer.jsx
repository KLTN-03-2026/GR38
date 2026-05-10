import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Circle,
} from "lucide-react";

const DIFFICULTY_CONFIG = {
  easy: { label: "Dễ", className: "bg-green-100 text-green-700" },
  medium: { label: "Trung bình", className: "bg-yellow-100 text-yellow-700" },
  hard: { label: "Khó", className: "bg-red-100 text-red-600" },
  dễ: { label: "Dễ", className: "bg-green-100 text-green-700" },
  "trung bình": {
    label: "Trung bình",
    className: "bg-yellow-100 text-yellow-700",
  },
  khó: { label: "Khó", className: "bg-red-100 text-red-600" },
};

export default function FlashcardPlayer({
  cards,
  onToggleMemorized,
  initialMemorized,
  onComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [starred, setStarred] = useState(new Set());
  const [seen, setSeen] = useState(new Set());

  // memorizedIds chỉ dùng khi học sinh truyền initialMemorized
  const [memorizedIds, setMemorizedIds] = useState(
    () => new Set(initialMemorized ?? []),
  );

  const normalizedCards = useMemo(() => {
    if (!Array.isArray(cards)) return null;
    return cards.map((card) => ({
      _id: card._id ?? null,
      front: card.front ?? card.q ?? card.question ?? "",
      back: card.back ?? card.a ?? card.answer ?? "",
      difficulty:
        (card.difficulty ?? "").toString().toLowerCase().trim() || null,
    }));
  }, [cards]);

  if (!normalizedCards) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Đang tải flashcard...</p>
      </div>
    );
  }

  if (normalizedCards.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-base font-semibold text-gray-700">
          Bộ thẻ chưa có nội dung
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Hãy tạo thêm thẻ để bắt đầu học.
        </p>
      </div>
    );
  }

  const total = normalizedCards.length;
  const currentCard = normalizedCards[currentIndex];
  const diff = currentCard.difficulty
    ? (DIFFICULTY_CONFIG[currentCard.difficulty] ?? {
        label: currentCard.difficulty,
        className: "bg-gray-100 text-gray-600",
      })
    : null;
  const isStarred = starred.has(currentIndex);
  const isLearner = !!onToggleMemorized; // chỉ học sinh mới truyền prop này
  const isMemorized = memorizedIds.has(currentCard._id);
  const progressPercent =
    total > 0 ? Math.round((memorizedIds.size / total) * 100) : 0;

  const goPrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    setIsFlipped(false);
  };

  const goNext = () => {
    if (currentIndex >= total - 1) return;
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    if (!isFlipped) setSeen((prev) => new Set(prev).add(currentIndex));
    setIsFlipped((prev) => !prev);
  };

  const toggleStar = (e) => {
    e.stopPropagation();
    setStarred((prev) => {
      const next = new Set(prev);
      const wasStarred = next.has(currentIndex);
      wasStarred ? next.delete(currentIndex) : next.add(currentIndex);
      return next;
    });
  };

  const toggleMemorized = (e) => {
    e.stopPropagation();
    const cardId = currentCard._id;
    if (!cardId) return;

    const wasMemorized = memorizedIds.has(cardId);
    const next = new Set(memorizedIds);
    wasMemorized ? next.delete(cardId) : next.add(cardId);
    setMemorizedIds(next);

    if (onToggleMemorized) {
      onToggleMemorized(cardId, !wasMemorized);
    }
  };

  return (
    <div className="w-full">
      {/* Stats row */}
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {total}
        </span>
        <span className="text-sm text-gray-400">
          {seen.size} / {total} đã xem
        </span>
      </div>

      {/* Card */}
      <div style={{ perspective: "1200px" }}>
        <div
          role="button"
          tabIndex={0}
          onClick={handleFlip}
          onKeyDown={(e) => e.key === "Enter" && handleFlip()}
          className="relative block h-[320px] w-full cursor-pointer rounded-2xl border-none bg-transparent focus:outline-none"
        >
          <div
            className="relative h-full w-full rounded-2xl transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT */}
            <div
              className="absolute inset-0 flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Câu hỏi
                </span>
                <div className="flex items-center gap-2">
                  {diff && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${diff.className}`}
                    >
                      {diff.label}
                    </span>
                  )}
                  {/* Nút đã thuộc — chỉ học sinh */}
                  {isLearner && (
                    <button
                      type="button"
                      onClick={toggleMemorized}
                      disabled={!isFlipped}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border transition-all ${
                        isMemorized
                          ? "bg-green-50 border-green-300 text-green-600"
                          : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isMemorized ? (
                        <>
                          <CheckCircle2 size={13} /> Đã thuộc
                        </>
                      ) : (
                        <>
                          <Circle size={13} /> Chưa thuộc
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleStar}
                    className="flex items-center justify-center transition-colors"
                    aria-label="Đánh dấu thẻ"
                  >
                    <Star
                      size={18}
                      className={
                        isStarred
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      }
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center">
                <p className="text-center text-xl font-semibold leading-relaxed text-gray-900">
                  {currentCard.front || "Không có câu hỏi"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleFlip}
                className="mx-auto mt-4 rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:bg-gray-50"
              >
                Xem đáp án
              </button>
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 flex h-full flex-col rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100 p-6 shadow-sm"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  Đáp án
                </span>
                <div className="flex items-center gap-2">
                  {/* Nút đã thuộc mặt sau — chỉ học sinh */}
                  {isLearner && (
                    <button
                      type="button"
                      onClick={toggleMemorized}
                      disabled={!isFlipped}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border transition-all ${
                        isMemorized
                          ? "bg-white/60 border-green-300 text-green-600"
                          : "bg-white/30 border-orange-200 text-orange-400 hover:text-green-500 hover:border-green-300"
                      }`}
                    >
                      {isMemorized ? (
                        <>
                          <CheckCircle2 size={13} /> Đã thuộc
                        </>
                      ) : (
                        <>
                          <Circle size={13} /> Chưa thuộc
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleStar}
                    className="flex items-center justify-center transition-colors"
                    aria-label="Đánh dấu thẻ"
                  >
                    <Star
                      size={18}
                      className={
                        isStarred
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-orange-300 hover:text-yellow-400"
                      }
                    />
                  </button>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <p className="text-center text-xl font-semibold leading-relaxed text-orange-900">
                  {currentCard.back || "Chưa có đáp án"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="mt-2 text-center text-xs text-gray-400">
        Nhấn vào thẻ để lật
      </p>

      {/* Navigation + Progress (progress chỉ học sinh) */}
      <div className="mt-4 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-semibold text-gray-500 transition hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        {/* Giáo viên: số trang to ở giữa | Học sinh: progress bar */}
        {isLearner ? (
          <div className="flex flex-col items-center gap-1 flex-1 max-w-xs mx-4">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F26739] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                Tiến độ
              </span>
              <span className="text-[12px] font-black text-[#F26739]">
                {progressPercent}%
              </span>
            </div>
          </div>
        ) : (
          <span className="text-2xl font-black text-gray-900">
            {currentIndex + 1}{" "}
            <span className="text-sm font-medium text-gray-400">/ {total}</span>
          </span>
        )}

        <button
  type="button"
  onClick={
    currentIndex >= total - 1 && isLearner && progressPercent === 100
      ? onComplete
      : goNext
  }
  disabled={
    currentIndex >= total - 1 &&
    !(isLearner && progressPercent === 100)
  }
  className={`flex items-center gap-1 text-sm font-semibold transition ${
    currentIndex >= total - 1 && isLearner && progressPercent === 100
      ? "bg-[#F26739] text-white px-4 py-2 rounded-xl hover:bg-orange-600"
      : "text-gray-500 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-35"
  }`}
>
  {currentIndex >= total - 1 && isLearner && progressPercent === 100
    ? "Hoàn thành"
    : "Tiếp"}
  {!(currentIndex >= total - 1 && isLearner && progressPercent === 100) && (
    <ChevronRight size={16} />
  )}
</button>
      </div>
    </div>
  );
}