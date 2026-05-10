import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Circle } from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../lib/api"; 

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [questions, setQuestions] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memorizedIds, setMemorizedIds] = useState(new Set());

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/flashcards/${id}`);
        const responseData = res.data?.data || res.data || res;

        if (responseData) {
          setFlashcardSet(responseData);
          const cards = responseData.cards || [];
          setQuestions(cards.map((card) => ({
            ...card,
            back: card.back ?? null,
          })));

          // Khởi tạo danh sách các thẻ đã thuộc từ dữ liệu server
          const initialMemorized = new Set(
            cards
              .filter(card => card.memoryStatus === "Đã nhớ")
              .map(card => card._id)
          );
          setMemorizedIds(initialMemorized);
        }
      } catch (err) {
        console.error("Lỗi fetch chi tiết:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleReview = async (cardId) => {
    try {
      if (flashcardSet?._id) {
        await api.post(`/flashcards/${flashcardSet._id}/cards/${cardId}/review`);
      }
    } catch (err) {
      console.error("Lỗi lưu tiến độ review:", err);
    }
  };

  const toggleMemorized = async (e, cardId) => {
    e.stopPropagation(); 
    const isCurrentlyMemorized = memorizedIds.has(cardId);
    const newStatus = isCurrentlyMemorized ? "Chưa thuộc" : "Đã nhớ";
    
    try {
        // 1. Gọi API cập nhật trạng thái lên server
        if (flashcardSet?._id) {
            await api.post(`/flashcards/${flashcardSet._id}/cards/${cardId}/review`, {
                memoryStatus: newStatus
            });
        }

        // 2. Cập nhật state memorizedIds để tính % tiến độ
        const newMemorizedIds = new Set(memorizedIds);
        if (isCurrentlyMemorized) {
            newMemorizedIds.delete(cardId);
        } else {
            newMemorizedIds.add(cardId);
        }
        setMemorizedIds(newMemorizedIds);

        // 3. Cập nhật lại mảng questions để đồng bộ dữ liệu memoryStatus
        setQuestions(prev => prev.map(q => 
            q._id === cardId ? { ...q, memoryStatus: newStatus } : q
        ));

    } catch (err) {
        console.error("Lỗi cập nhật trạng thái ghi nhớ:", err);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      handleReview(questions[currentIndex]._id);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = async () => {
    const current = questions[currentIndex];
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
      } catch (err) { }
    }
    setIsFlipped((prev) => !prev);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
    </div>
  );

  if (!questions.length) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-500 mb-6">Tài liệu này chưa có bộ thẻ học nào.</p>
      <button onClick={() => navigate(-1)} className="bg-[#F26739] text-white px-6 py-2 rounded-lg font-bold">
        Quay lại
      </button>
    </div>
  );

  const progressPercent = Math.round((memorizedIds.size / questions.length) * 100);

  return (
    <div className="flex flex-col items-center p-4 md:p-8 w-full min-h-screen bg-[#FAFAFA]">
      <div className="w-full max-w-[850px] bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-400 font-bold flex items-center gap-1 uppercase text-[12px] hover:text-gray-600 transition-colors">
                <ChevronLeft size={16}/> QUAY LẠI
            </button>
            <h2 className="text-xl font-black uppercase text-center flex-1 line-clamp-1 px-4 text-[#18181B]">{flashcardSet?.title}</h2>
            <div className="w-16"></div>
        </div>

        {/* Flashcard Body */}
        <div 
          onClick={handleFlip}
          className={`relative w-full min-h-[350px] rounded-[30px] flex flex-col p-8 cursor-pointer transition-all duration-500 border-b-4 active:translate-y-1 shadow-lg ${
            isFlipped 
              ? "bg-gradient-to-br from-[#47ED70] to-[#36BA58] border-[#2A9144] text-white" 
              : "bg-white border-[#E4E4E7] border-2 text-[#18181B]"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1.5">
                <span className={`text-[10px] px-4 py-1.5 rounded-full font-black w-fit tracking-wider ${isFlipped ? "bg-white/20" : "bg-[#1473E6] text-white"}`}>
                {isFlipped ? "ĐÁP ÁN" : `THẺ SỐ ${currentIndex + 1}`}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isFlipped ? "text-white/70" : "text-gray-400"}`}>
                    Độ khó: {questions[currentIndex]?.difficulty || "---"}
                </span>
            </div>

            <div className="flex flex-col items-end gap-2">
                <span className="font-black opacity-50 text-sm">{currentIndex + 1} / {questions.length}</span>
                
                <button 
                  onClick={(e) => toggleMemorized(e, questions[currentIndex]._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all font-bold text-[10px] ${
                    memorizedIds.has(questions[currentIndex]._id)
                    ? "bg-white text-green-600 border-white shadow-sm"
                    : isFlipped 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-gray-50 border-gray-100 text-gray-400 hover:text-green-500"
                  }`}
                >
                    {memorizedIds.has(questions[currentIndex]._id) ? (
                        <><CheckCircle2 size={14} /> ĐÃ THUỘC</>
                    ) : (
                        <><Circle size={14} /> CHƯA THUỘC</>
                    )}
                </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center text-center px-2">
            <p className="text-[22px] md:text-[26px] font-bold leading-snug max-w-xl">
              {isFlipped ? (questions[currentIndex].back || "...") : questions[currentIndex].front}
            </p>
          </div>

          {!isFlipped && (
            <div className="text-center mt-4 animate-bounce text-gray-300 font-bold text-[9px] tracking-[0.2em]">
              CHẠM ĐỂ LẬT THẺ
            </div>
          )}
        </div>

        {/* Navigation & Progress */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <button 
                disabled={currentIndex === 0} 
                onClick={handlePrev} 
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm disabled:opacity-20 transition-colors"
            >
                TRƯỚC ĐÓ
            </button>

            <div className="text-center flex-1 max-w-xs w-full">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div 
                        className="h-full bg-orange-500 transition-all duration-700 ease-out" 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Tiến độ</span>
                    <span className="text-[13px] font-black text-[#F26739]">{progressPercent}%</span>
                </div>
            </div>

            <button 
                disabled={currentIndex === questions.length - 1} 
                onClick={handleNext} 
                className="w-full sm:w-auto px-6 py-3 bg-[#F26739] text-white rounded-xl font-bold text-sm shadow-md shadow-orange-100 hover:bg-[#d8562c] transition-all"
            >
                TIẾP THEO
            </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDetail;