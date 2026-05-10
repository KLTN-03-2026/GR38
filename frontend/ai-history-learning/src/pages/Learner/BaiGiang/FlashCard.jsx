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
  CheckCircle2,
  Circle,
} from "lucide-react";

const FlashCard = ({ documentId, lectureTitle, thumbnail: defaultThumbnail }) => {
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isStudying, setIsStudying] = useState(false);
  const [loading, setLoading] = useState(true);

  // State học Flashcard
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memorizedIds, setMemorizedIds] = useState(new Set());

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      if (!documentId) return;
      try {
        setLoading(true);
        const res = await api.get(`/flashcards/document/${documentId}`);
        
        if (res.data && res.data.success && res.data.data) {
          const setData = res.data.data;
          setFlashcardSet(setData);
          
          const cards = setData.cards || [];
          // Đảm bảo khởi tạo back nếu chưa có để tránh lỗi hiển thị
          setQuestions(cards.map(card => ({
            ...card,
            back: card.back ?? null
          })));

          // Khởi tạo danh sách thẻ đã thuộc
          const initialMemorized = new Set(
            cards.filter(c => c.memoryStatus === "Đã nhớ").map(c => c._id)
          );
          setMemorizedIds(initialMemorized);
        } else {
          setFlashcardSet(null);
        }
      } catch (err) {
        console.error("Lỗi lấy Flashcard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSet();
  }, [documentId]);

  // Logic lật thẻ và fetch đáp án (API Call)
  const handleFlip = async () => {
    const current = questions[currentIndex];
    
    // Nếu chưa lật và thẻ hiện tại chưa có nội dung 'back', gọi API lấy đáp án
    if (!isFlipped && current && !current.back && flashcardSet?._id) {
      try {
        const res = await api.get(`/flashcards/${flashcardSet._id}/cards/${current._id}/back`);
        const backData = res?.data?.data || res?.data || null;
        
        if (backData?.back !== undefined) {
          setQuestions((prev) =>
            prev.map((q, idx) =>
              idx === currentIndex ? { ...q, back: backData.back } : q
            )
          );
        }
      } catch (err) {
        console.error("Lỗi fetch đáp án:", err);
      }
    }
    setIsFlipped((prev) => !prev);
  };

  // Hàm xử lý đánh dấu đã thuộc/chưa thuộc
  const toggleMemorized = async (e, cardId) => {
    e.stopPropagation();
    const isCurrentlyMemorized = memorizedIds.has(cardId);
    const newStatus = isCurrentlyMemorized ? "Chưa thuộc" : "Đã nhớ";

    try {
      if (flashcardSet?._id) {
        await api.post(`/flashcards/${flashcardSet._id}/cards/${cardId}/review`, {
          memoryStatus: newStatus
        });
      }

      const newMemorizedIds = new Set(memorizedIds);
      if (isCurrentlyMemorized) {
        newMemorizedIds.delete(cardId);
      } else {
        newMemorizedIds.add(cardId);
      }
      setMemorizedIds(newMemorizedIds);

      setQuestions(prev => prev.map(q => 
        q._id === cardId ? { ...q, memoryStatus: newStatus } : q
      ));
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  const handleStartStudy = () => {
    setIsStudying(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) return (
    <div className="flex justify-center p-20 text-[#f26739]">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  // GIAO DIỆN 1: DANH SÁCH BỘ THẺ
  if (!isStudying) {
    const listToShow = flashcardSet ? [flashcardSet] : [];
    return (
      <div className="p-4 w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#001d3d] uppercase tracking-tight mb-1">BÀI TẬP ÔN TẬP</h2>
          <p className="text-xs text-gray-400 italic">{lectureTitle || "Danh sách học tập"}</p>
        </div>

        <div className="flex flex-col gap-3 mb-10">
          {listToShow.length > 0 ? (
            listToShow.map((set, index) => (
              <div key={set._id || index} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#fff8f1] rounded-xl flex items-center justify-center overflow-hidden border border-orange-50 shrink-0">
                    {(set.thumbnail || defaultThumbnail) ? (
                      <img src={set.thumbnail || defaultThumbnail} alt={set.title} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform" />
                    ) : (
                      <BookOpen size={24} className="text-[#f2d8c3]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#001d3d] text-sm uppercase tracking-tight">{set.title || "FLASHCARD ÔN TẬP"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                        {questions.length} CÂU
                      </span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">
                        ĐÃ THUỘC: {memorizedIds.size}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={handleStartStudy} className="bg-[#f26739] text-white text-[11px] font-bold px-5 py-2 rounded-xl hover:bg-[#e0562b] transition-all active:scale-95 shadow-md">
                  Làm bài ngay
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
               <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
               <p className="text-gray-400 font-bold uppercase text-xs">Chưa có dữ liệu flashcard</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GIAO DIỆN 2: CHẾ ĐỘ HỌC
  const currentCard = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round((memorizedIds.size / questions.length) * 100) : 0;

  return (
    <div className="w-full flex flex-col items-center p-6 bg-white min-h-[600px]">
      {/* Header học tập */}
      <div className="w-full flex justify-between items-center mb-6 max-w-[600px]">
        <button onClick={() => setIsStudying(false)} className="flex items-center gap-2 text-gray-400 hover:text-[#f26739] font-bold uppercase text-[11px] tracking-widest transition-all">
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-black text-gray-400 uppercase">Tiến độ thuộc bài</span>
           <span className="text-sm font-black text-[#f26739]">{progressPercent}%</span>
        </div>
      </div>

      {/* Thanh tiến độ thuộc bài */}
      <div className="w-full max-w-[600px] h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Flashcard Card */}
      <div
        className="relative w-full max-w-[550px] h-[350px] cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full h-full transition-all duration-700"
          style={{ 
            transformStyle: "preserve-3d", 
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
          }}
        >
          {/* MẶT TRƯỚC */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[40px] shadow-2xl flex flex-col p-10 bg-white border-2 border-gray-100 text-[#001d3d] shadow-gray-100"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                CÂU {currentIndex + 1}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">Độ khó: {currentCard?.difficulty || "Dễ"}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-2xl font-bold text-center leading-tight">{currentCard?.front}</h2>
            </div>
            <div className="flex justify-center">
              <button 
                onClick={(e) => toggleMemorized(e, currentCard?._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${
                  memorizedIds.has(currentCard?._id) ? "bg-green-50 border-green-200 text-green-600" : "border-gray-100 text-gray-400 hover:border-green-200"
                }`}
              >
                {memorizedIds.has(currentCard?._id) ? <CheckCircle2 size={14}/> : <Circle size={14}/>}
                {memorizedIds.has(currentCard?._id) ? "ĐÃ THUỘC" : "CHƯA THUỘC"}
              </button>
            </div>
          </div>

          {/* MẶT SAU */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[40px] shadow-2xl flex flex-col p-10 bg-[#f26739] text-white shadow-orange-200"
            style={{ 
              backfaceVisibility: "hidden", 
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)" 
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest">ĐÁP ÁN</span>
              <button 
                onClick={(e) => toggleMemorized(e, currentCard?._id)}
                className="p-2 bg-white/20 rounded-full hover:bg-white text-white hover:text-green-600 transition-all"
              >
                {memorizedIds.has(currentCard?._id) ? <CheckCircle2 size={20}/> : <Circle size={20}/>}
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-2xl font-bold text-center leading-tight">
                {currentCard?.back || "..."}
              </h2>
            </div>
            <p className="text-center text-[10px] font-bold opacity-60 flex items-center justify-center gap-2">
              <RefreshCcw size={12}/> Chạm để quay lại câu hỏi
            </p>
          </div>
        </div>
      </div>

      {/* Điều hướng Next/Prev */}
      <div className="mt-12 w-full max-w-[550px]">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-400 uppercase italic">Thứ tự thẻ</span>
            <span className="text-xs font-black text-[#f26739]">{currentIndex + 1} / {questions.length}</span>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => { setIsFlipped(false); setCurrentIndex((p) => (p - 1 + questions.length) % questions.length); }}
            disabled={questions.length <= 1}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-900 font-bold text-sm hover:bg-gray-50 disabled:opacity-30"
          >
            TRƯỚC ĐÓ
          </button>
          <button
            onClick={() => { setIsFlipped(false); setCurrentIndex((p) => (p + 1) % questions.length); }}
            disabled={questions.length <= 1}
            className="flex-[2] py-4 rounded-2xl bg-[#f26739] text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all disabled:opacity-30"
          >
            THẺ TIẾP THEO
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;