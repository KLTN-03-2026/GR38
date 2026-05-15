import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../../lib/api";
import FlashcardPlayer from "@/components/features/flashcards/FlashcardPlayer";

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const starredOnly = location.state?.starredOnly ?? false;

  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.documentId) {
      sessionStorage.setItem(`flash_docId_${id}`, location.state.documentId);
    }
  }, [id, location.state]);

  useEffect(() => {
    const loadFlashcardSet = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/flashcards/${id}`);
        const raw = res?.data?.data ?? res?.data ?? null;

        if (!raw) {
          setFlashcardSet({ title: "Flashcard", cards: [] });
          return;
        }

        const baseCards = Array.isArray(raw.cards)
  ? raw.cards.map((card) => ({
      _id: card._id ?? card.id ?? null,
      front: card.front ?? card.question ?? card.term ?? "",
      back: card.back ?? card.answer ?? card.definition ?? "",
      difficulty: card.difficulty ?? null,
      memoryStatus: card.memoryStatus ?? null,
      isStarred: card.isStarred ?? false,
    }))
  : [];

        const displayCards = starredOnly
  ? baseCards.filter((c) => c.isStarred)
  : baseCards;


  setFlashcardSet({
  _id: raw._id,
  title: raw.title ?? "Flashcard",
  cards: displayCards,
  initialMemorized: displayCards
    .filter((c) => c.memoryStatus === "Đã nhớ")
    .map((c) => c._id),
  initialStarred: displayCards
    .filter((c) => c.isStarred)
    .map((c) => c._id),
});
} catch {
  setError("Không tải được bộ flashcard. Vui lòng thử lại.");
  setFlashcardSet(null);
} finally {
  setLoading(false);
}
};
loadFlashcardSet();
}, [id]);

  // Hàm toggle ghi nhớ — truyền xuống FlashcardPlayer
  const handleToggleMemorized = async (cardId, newMemorized) => {
    if (!flashcardSet?._id) return;
    const newStatus = newMemorized ? "Đã nhớ" : "Chưa thuộc";
    try {
      await api.post(`/flashcards/${flashcardSet._id}/cards/${cardId}/review`, {
        memoryStatus: newStatus,
      });
      // Cập nhật lại local state để % tiến độ đồng bộ
      setFlashcardSet((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c._id === cardId ? { ...c, memoryStatus: newStatus } : c
        ),
      }));
    } catch {
      // handle silently
    }
  };
const handleToggleStar = async (cardId, newStarred) => {
  if (!flashcardSet?._id) return;
  await api.put(`/flashcards/${flashcardSet._id}/cards/${cardId}/star`);
  setFlashcardSet((prev) => {
    const updatedCards = prev.cards.map((c) =>
      c._id === cardId ? { ...c, isStarred: newStarred } : c
    );
    return {
      ...prev,
      cards: updatedCards,                        
      initialStarred: updatedCards
        .filter((c) => c.isStarred)
        .map((c) => c._id),
    };
  });
};

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Đang tải FlashCard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => navigate("/learner/flashcards")}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

 if ((flashcardSet?.cards ?? []).length === 0) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-sm text-gray-500">
        {starredOnly
          ? "Bộ thẻ này chưa có thẻ nào được đánh dấu sao."
          : "Bộ flashcard này chưa có thẻ nào."}
      </p>
      <button
        onClick={() => navigate("/learner/flashcards")}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Quay lại
      </button>
    </div>
  );
}

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      {/* Header — giống giáo viên */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/learner/flashcards")}
          className="text-sm font-semibold text-gray-500 hover:text-gray-800"
        >
          Quay lại
        </button>
        <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
          {flashcardSet?.title || "Flashcard"}
        </h2>
      </div>

      {/* FlashcardPlayer — dùng chung với giáo viên, thêm prop onToggleMemorized */}
     <FlashcardPlayer
  cards={flashcardSet?.cards ?? []}
  onToggleMemorized={handleToggleMemorized}
  onToggleStar={handleToggleStar}
  initialMemorized={flashcardSet?.initialMemorized ?? []}
  initialStarred={flashcardSet?.initialStarred ?? []}
  onComplete={() => navigate("/learner/flashcards", { state: { filterTab: "completed" } })}
  hideProgress={starredOnly} 
/>
    </div>
  );
};

export default FlashcardDetail;