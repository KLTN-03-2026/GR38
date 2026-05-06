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

  // State Phân trang (Vì API trả về 1 set, nhưng bạn muốn giao diện giống Quiz - thường có nhiều set)
  // Ở đây ta xử lý flashcardSet như một mảng chứa 1 phần tử để giữ đúng layout 2 cột
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      if (!documentId) return;
      try {
        setLoading(true);
        const res = await api.get(`/flashcards/document/${documentId}`);
        const data = res?.data?.data;
        if (data && data.cards) {
          setFlashcardSet(data);
        }
      } catch (err) {
        console.error("Lỗi lấy Flashcard:", err);
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

  // GIAO DIỆN DANH SÁCH (GIỐNG HÌNH QUỐC)
  if (!isStudying) {
    // Giả lập danh sách để test layout (Nếu sau này API trả về mảng thì thay flashcardSet bằng mảng đó)
    const listToShow = flashcardSet ? [flashcardSet] : []; 
    const totalPages = Math.ceil(listToShow.length / itemsPerPage) || 1;

    return (
      <div className="p-4 w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-[#001d3d] uppercase tracking-tight mb-1">
            BÀI TẬP ÔN TẬP
          </h2>
          <p className="text-sm text-gray-400 italic">
            {lectureTitle || "Các triều đại Việt Nam"}
          </p>
        </div>

        {/* Grid 2 cột giống trong hình */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {listToShow.length > 0 ? (
            listToShow.map((set, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Thumbnail Area */}
                <div className="aspect-[16/10] bg-[#fff8f1] rounded-2xl mb-5 flex items-center justify-center overflow-hidden border border-orange-50">
                  {set.thumbnail || defaultThumbnail ? (
                    <img
                      src={set.thumbnail || defaultThumbnail}
                      alt={set.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <BookOpen size={48} className="text-[#f2d8c3]" strokeWidth={1.5} />
                  )}
                </div>

                {/* Info Area */}
                <h3 className="font-bold text-[#001d3d] text-lg uppercase mb-4 px-1">
                  {set.title || "FLASHCARD ÔN TẬP"}
                </h3>
                
                <div className="flex justify-between items-center mt-auto px-1">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {set.cards?.length || 0} CÂU
                  </span>
                  <button
                    onClick={handleStartStudy}
                    className="bg-[#f26739] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#e0562b] shadow-lg shadow-orange-100 transition-all active:scale-95"
                  >
                    Làm bài ngay
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
               <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
               <p className="text-gray-400 font-bold uppercase text-sm">Chưa có dữ liệu flashcard</p>
            </div>
          )}
        </div>

        {/* Thanh phân trang bên dưới */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-500">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 border rounded-lg text-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-10 h-10 flex items-center justify-center border-2 border-orange-100 rounded-lg text-[#f26739] font-bold">
              {currentPage}
            </div>
            <button 
              className="p-2 border rounded-lg text-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GIAO DIỆN 2: CHẾ ĐỘ HỌC (GIỮ NGUYÊN HOẶC TÙY CHỈNH THÊM)
  const cards = flashcardSet.cards || [];
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
          {flashcardSet.title}
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
          <div className={`flex flex-col items-center ${showAnswer ? "[transform:rotateY(180deg)]" : ""}`}>
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] mb-6 opacity-40 ${showAnswer ? "text-white" : "text-[#f26739]"}`}>
              {showAnswer ? "ĐÁP ÁN" : "CÂU HỎI"}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold leading-snug">
              {showAnswer ? currentCard.back : currentCard.front}
            </h2>
          </div>
          
          <div className={`absolute bottom-8 flex items-center gap-2 text-[10px] font-bold opacity-30 ${showAnswer ? "text-white [transform:rotateY(180deg)]" : "text-gray-400"}`}>
            <RefreshCcw size={14} className="animate-pulse" /> Chạm để lật thẻ
          </div>
        </div>
      </div>

      <div className="mt-12 w-full max-w-[550px]">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-400 uppercase italic">Tiến độ tập trung</span>
            <span className="text-xs font-black text-[#f26739]">{currentCardIndex + 1}/{cards.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-[#f26739] shadow-[0_0_10px_rgba(242,103,57,0.4)] transition-all duration-500"
            style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => { setShowAnswer(false); setCurrentCardIndex((p) => (p - 1 + cards.length) % cards.length); }}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-900 font-bold text-sm hover:bg-gray-50 transition-all"
          >
            TRƯỚC ĐÓ
          </button>
          <button
            onClick={() => { setShowAnswer(false); setCurrentCardIndex((p) => (p + 1) % cards.length); }}
            className="flex-[2] py-4 rounded-2xl bg-[#f26739] text-white font-bold text-sm shadow-lg shadow-orange-200 hover:scale-[1.02] transition-all"
          >
            THẺ TIẾP THEO
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;