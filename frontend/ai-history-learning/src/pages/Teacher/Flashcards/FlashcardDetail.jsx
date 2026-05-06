import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../../lib/api";
import FlashcardPlayer from "@/components/features/flashcards/FlashcardPlayer";

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

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
            }))
          : [];

        const withBack = await Promise.all(
          baseCards.map(async (card) => {
            if (card.back || !card._id) return card;
            try {
              const backRes = await api.get(`/flashcards/${id}/cards/${card._id}/back`);
              const backData = backRes?.data?.data ?? backRes?.data ?? null;
              return { ...card, back: backData?.back ?? "" };
            } catch {
              return card;
            }
          }),
        );

        setFlashcardSet({
          title: raw.title ?? "Flashcard",
          cards: withBack,
        });
      } catch {
        setError("Khong tai duoc bo flashcard. Vui long thu lai.");
        setFlashcardSet(null);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcardSet();
  }, [id]);

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
          onClick={() => navigate("/teacher/flashcards")}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/teacher/flashcards")}
          className="text-sm font-semibold text-gray-500 hover:text-gray-800"
        >
          Quay lại
        </button>
        <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
          {flashcardSet?.title || "Flashcard"}
        </h2>
      </div>

      <FlashcardPlayer cards={flashcardSet?.cards ?? []} />
    </div>
  );
};

export default FlashcardDetail;
