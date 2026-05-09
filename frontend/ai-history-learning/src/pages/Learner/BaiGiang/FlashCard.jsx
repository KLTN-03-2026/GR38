import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import {
  Loader2,
  RefreshCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const FlashCard = ({ documentId, lectureTitle, thumbnail: defaultThumbnail }) => {
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [isStudying, setIsStudying] = useState(false);
  const [loading, setLoading] = useState(true);

  // State học Flashcard
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // State Phân trang cho danh sách (nếu có nhiều bộ)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      if (!documentId) return;
      try {
        setLoading(true);
        // Gọi API lấy bộ flashcard theo documentId
        const res = await api.get(`/flashcards/document/${documentId}`);
        
        // Dựa trên Schema: res.data là Object chứa { success, count, data }
        // Dữ liệu bộ thẻ nằm ở res.data.data
        if (res.data && res.data.success && res.data.data) {
          setFlashcardSet(res.data.data);
        } else {
          setFlashcardSet(null);
        }
      } catch (err) {
        console.error("Lỗi lấy Flashcard:", err);
        setFlashcardSet(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSet();
  }, [documentId]);

  const handleStartStudy = () => {
    setIsStudying(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (loading)
    return (
      <div className="flex justify-center p-20 text-[#f26739]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );

  // GIAO DIỆN 1: DANH SÁCH BỘ THẺ
  if (!isStudying) {
    const listToShow = flashcardSet ? [flashcardSet] : []; 
    const totalPages = Math.ceil(listToShow.length / itemsPerPage) || 1;

    return (
      <div className="p-4 w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#001d3d] uppercase tracking-tight mb-1">
            BÀI TẬP ÔN TẬP
          </h2>
          <p className="text-xs text-gray-400 italic">
            {lectureTitle || "Danh sách học tập"}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-10">
          {listToShow.length > 0 ? (
            listToShow.map((set, index) => (
              <div 
                key={set._id || index}
                className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#fff8f1] rounded-xl flex items-center justify-center overflow-hidden border border-orange-50 shrink-0">
                    {(set.thumbnail || defaultThumbnail) ? (
                      <img
                        src={set.thumbnail || defaultThumbnail}
                        alt={set.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <BookOpen size={24} className="text-[#f2d8c3]" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-[#001d3d] text-sm uppercase tracking-tight">
                      {set.title || "FLASHCARD ÔN TẬP"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                        {set.cards?.length || 0} CÂU
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartStudy}
                  className="bg-[#f26739] text-white text-[11px] font-bold px-5 py-2 rounded-xl hover:bg-[#e0562b] transition-all active:scale-95 shadow-md shadow-orange-100"
                >
                  Làm bài ngay
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
               <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
               <p className="text-gray-400 font-bold uppercase text-xs">Chưa có dữ liệu flashcard cho tài liệu này</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="p-1.5 border rounded-lg text-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-8 h-8 flex items-center justify-center border border-orange-100 rounded-lg text-[#f26739] text-xs font-bold">
              {currentPage}
            </div>
            <button 
              className="p-1.5 border rounded-lg text-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GIAO DIỆN 2: CHẾ ĐỘ HỌC (FIX LỖI TRỐNG ĐÁP ÁN)
  const cards = flashcardSet?.cards || [];
  const currentCard = cards[currentCardIndex];

  return (
    <div className="w-full flex flex-col items-center p-6 bg-white min-h-[600px]">
      <div className="w-full flex justify-between items-center mb-10 max-w-[600px]">
        <button
          onClick={() => setIsStudying(false)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#f26739] font-bold uppercase text-[11px] tracking-widest transition-all"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
        <span className="text-gray-300 font-black">/</span>
        <h4 className="text-sm font-black text-[#001d3d] uppercase italic">
          {flashcardSet?.title}
        </h4>
      </div>

      <div
        className="relative w-full max-w-[550px] h-[350px] cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div
          className={`w-full h-full rounded-[40px] shadow-2xl shadow-orange-100 flex flex-col items-center justify-center p-12 text-center transition-all duration-700 relative overflow-hidden ${
            showAnswer ? "bg-[#f26739] text-white" : "bg-white border-2 border-gray-50 text-[#001d3d]"
          }`}
          style={{ 
            transformStyle: "preserve-3d",
            transform: showAnswer ? "rotateY(180deg)" : "rotateY(0deg)" 
          }}
        >
          {/* 
              Sử dụng logic conditional rendering bên trong để đảm bảo 
              khi rotateY(180deg) thì text không bị ngược và luôn hiển thị đúng thuộc tính 
          */}
          <div className="flex flex-col items-center w-full" style={{ backfaceVisibility: "hidden" }}>
             {!showAnswer ? (
                // MẶT TRƯỚC (CÂU HỎI)
                <>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 opacity-40 text-[#f26739]">
                    CÂU HỎI
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                    {currentCard?.front || "Không có nội dung câu hỏi"}
                  </h2>
                </>
             ) : (
                // MẶT SAU (ĐÁP ÁN) - Xoay ngược lại 180 độ để chữ không bị ngược khi thẻ lật
                <div style={{ transform: "rotateY(180deg)" }} className="flex flex-col items-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 opacity-60 text-white">
                    ĐÁP ÁN
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                    {currentCard?.back || "Không có nội dung đáp án"}
                  </h2>
                </div>
             )}
          </div>
          
          <div className={`absolute bottom-8 flex items-center gap-2 text-[10px] font-bold opacity-30 ${showAnswer ? "text-white" : "text-gray-400"}`}
               style={showAnswer ? { transform: "rotateY(180deg)" } : {}}>
            <RefreshCcw size={14} className="animate-pulse" /> Chạm để lật thẻ
          </div>
        </div>
      </div>

      <div className="mt-12 w-full max-w-[550px]">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-400 uppercase italic">Tiến độ tập trung</span>
            <span className="text-xs font-black text-[#f26739]">{cards.length > 0 ? currentCardIndex + 1 : 0}/{cards.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-[#f26739] shadow-[0_0_10px_rgba(242,103,57,0.4)] transition-all duration-500"
            style={{ width: `${((currentCardIndex + 1) / (cards.length || 1)) * 100}%` }}
          ></div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={(e) => { 
                e.stopPropagation();
                setShowAnswer(false); 
                setCurrentCardIndex((p) => (p - 1 + cards.length) % cards.length); 
            }}
            disabled={cards.length <= 1}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-900 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-30"
          >
            TRƯỚC ĐÓ
          </button>
          <button
            onClick={(e) => { 
                e.stopPropagation();
                setShowAnswer(false); 
                setCurrentCardIndex((p) => (p + 1) % cards.length); 
            }}
            disabled={cards.length <= 1}
            className="flex-[2] py-4 rounded-2xl bg-[#f26739] text-white font-bold text-sm shadow-lg shadow-orange-200 hover:scale-[1.02] transition-all disabled:opacity-30"
          >
            THẺ TIẾP THEO
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;