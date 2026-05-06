import { useState, useEffect } from "react";
import api from "../../../lib/api";
import FlashcardPlayer from "@/components/features/flashcards/FlashcardPlayer";

export default function FlashcardPageInline({ flash, onBack }) {
  const [cards, setCards] = useState(null);
  const [deckName, setDeckName] = useState(flash.title ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        setError("");

        const flashId = flash?._id ?? flash?.id;
        const res = await api.get(`/flashcards/${flashId}`);
        const raw = res?.data?.data ?? res?.data ?? null;
        if (!raw || !Array.isArray(raw.cards)) {
          setCards([]);
          return;
        }

        const setRawId = raw._id ?? flashId;
        const normalized = raw.cards.map((card) => ({
          _id: card._id ?? card.id ?? null,
          front: card.front ?? card.question ?? "",
          back: card.back ?? card.answer ?? "",
          difficulty: card.difficulty ?? null,
        }));

        const withBack = await Promise.all(
          normalized.map(async (card) => {
            if (card.back || !card._id) return card;
            try {
              const backRes = await api.get(`/flashcards/${setRawId}/cards/${card._id}/back`);
              const backData = backRes?.data?.data ?? backRes?.data ?? null;
              return { ...card, back: backData?.back ?? "" };
            } catch {
              return card;
            }
          }),
        );

        setDeckName(raw.title ?? flash.title ?? "");
        setCards(withBack);
      } catch {
        setError("Không tải được flashcard. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [flash?._id, flash?.id, flash?.title]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="text-sm text-gray-500">Đang tải flashcard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Quay lại danh sách</button>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Quay lại danh sách</button>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{deckName || flash?.title || "Flashcard"}</h3>
      </div>
      <FlashcardPlayer cards={cards} />
    </div>
  );
}