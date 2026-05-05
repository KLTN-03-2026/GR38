import React, { useState, useEffect } from "react";
import api from "../../../lib/api"; 
import { Loader2, RefreshCcw, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

const FlashCard = ({ documentId, lectureTitle }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [setId, setSetId] = useState(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!documentId) return;
      try {
        setLoading(true);
        // SỬA TẠI ĐÂY: Thêm /document/ vào đường dẫn API theo đúng Swagger
        const res = await api.get(`/flashcards/document/${documentId}`);
        
        // Kiểm tra dữ liệu trả về theo cấu trúc Swagger { success: true, data: { cards: [...] } }
        const responseData = res?.data?.data || res?.data || res;
        
        if (responseData && responseData.cards && Array.isArray(responseData.cards)) {
          setSetId(responseData._id ?? null);
          setCards(responseData.cards.map((card) => ({
            ...card,
            back: card.back ?? null,
          })));
        } else {
          setCards([]);
        }
      } catch (err) {
        console.error("Lỗi lấy Flashcard theo ID tài liệu:", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [documentId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-3 text-[#f26739]">
      <Loader2 className="animate-spin" size={40} />
      <p className="text-gray-500 font-medium italic">Đang tải thẻ ghi nhớ...</p>
    </div>
  );

  if (!cards || cards.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center">
      <BookOpen className="text-gray-300 mb-4" size={56} />
      <h3 className="text-[18px] font-bold text-gray-400 uppercase tracking-widest">Chưa có Flashcards</h3>
      <p className="text-gray-500 font-semibold text-lg mt-2">{lectureTitle}</p>
      <p className="text-gray-400 text-sm mt-1">Hệ thống đang chuẩn bị bộ thẻ cho bài giảng này.</p>
    </div>
  );

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = async () => {
    if (!cards.length) return;
    const currentCard = cards[currentIndex];
    if (!showAnswer && currentCard && !currentCard.back && setId) {
      try {
        const res = await api.get(`/flashcards/${setId}/cards/${currentCard._id}/back`);
        const backData = res?.data?.data || res?.data || null;
        if (backData?.back !== undefined) {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === currentIndex ? { ...card, back: backData.back } : card
            )
          );
        }
      } catch (err) {
        // ignore back fetch error
      }
    }
    setShowAnswer((prev) => !prev);
  };

  return (
    <div className="w-full flex flex-col items-center p-6 bg-white min-h-[500px]">
      <div className="text-center mb-8">
        <div className="px-4 py-1 bg-orange-50 text-[#f26739] rounded-full text-[12px] font-bold uppercase inline-block mb-2">
          Ôn tập nhanh
        </div>
        <h4 className="text-[20px] font-bold text-gray-800">{lectureTitle}</h4>
      </div>
      
      <div 
        className="relative w-full max-w-[550px] h-[320px] cursor-pointer"
        onClick={handleFlip}
      >
        <div className={`w-full h-full rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-10 text-center transition-all duration-500 transform ${
          showAnswer ? "bg-[#f26739] text-white rotate-y-180 scale-[1.02]" : "bg-white border-2 border-gray-100 text-gray-800"
        }`}>
          <span className={`text-[11px] font-black uppercase tracking-[3px] mb-4 opacity-60 ${showAnswer ? "text-white" : "text-[#f26739]"}`}>
            {showAnswer ? "ĐÁP ÁN" : "CÂU HỎI"}
          </span>
          <h2 className={`text-[22px] md:text-[26px] font-bold leading-tight px-4 ${showAnswer ? "rotate-y-180" : ""}`}>
            {showAnswer ? (currentCard.back || "...") : currentCard.front}
          </h2>
          <div className={`absolute bottom-8 flex items-center gap-2 text-[12px] font-bold opacity-50 ${showAnswer ? "text-white" : "text-gray-400"}`}>
            <RefreshCcw size={14} /> 
            Chạm vào thẻ để lật
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mt-10 w-full max-w-[550px]">
         <div className="flex items-center gap-4 w-full px-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#f26739] transition-all duration-300" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}></div>
            </div>
            <span className="text-gray-400 font-bold text-xs whitespace-nowrap">{currentIndex + 1} / {cards.length} thẻ</span>
         </div>

         <div className="flex gap-4 w-full">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-900 text-gray-900 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-30"
              disabled={cards.length <= 1}
            >
              <ChevronLeft size={20} /> Thẻ trước
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="flex-[2] flex items-center justify-center gap-2 bg-[#f26739] text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-30"
              disabled={cards.length <= 1}
            >
              Thẻ tiếp theo <ChevronRight size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default FlashCard;