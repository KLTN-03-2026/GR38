import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom";
// Đổi import đồng bộ với api.js
import api from "../../../lib/api"; 

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [questions, setQuestions] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Sử dụng api instance
        const res = await api.get(`/flashcards/${id}`);
        
        // Xử lý dữ liệu linh hoạt (tùy backend trả về res.data hay res.data.data)
        const responseData = res.data?.data || res.data || res;

        if (responseData) {
          setFlashcardSet(responseData);
          setQuestions((responseData.cards || []).map((card) => ({
            ...card,
            back: card.back ?? null,
          })));
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
      // Ghi nhận ôn tập thẻ
      if (flashcardSet?._id) {
        await api.post(`/flashcards/${flashcardSet._id}/cards/${cardId}/review`);
      }
    } catch (err) {
      console.error("Lỗi lưu tiến độ:", err);
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-12 h-12" /></div>;

  if (!questions.length) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-500 mb-6">Tài liệu này chưa có bộ thẻ học nào.</p>
      <button onClick={() => navigate(-1)} className="bg-[#F26739] text-white px-8 py-3 rounded-xl font-bold">Quay lại</button>
    </div>
  );

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
      } catch (err) {
        // ignore back fetch error
      }
    }
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center p-8 w-full min-h-screen bg-[#FAFAFA]">
      <div className="w-full max-w-[1000px] bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="text-gray-400 font-bold flex items-center gap-1 uppercase text-sm">
                <ChevronLeft size={20}/> QUAY LẠI
            </button>
            <h2 className="text-[24px] font-black uppercase text-center flex-1">{flashcardSet?.title}</h2>
            <div className="w-20"></div>
        </div>

        <div 
          onClick={handleFlip}
          className={`relative w-full min-h-[400px] rounded-[40px] flex flex-col p-10 cursor-pointer transition-all duration-500 border-b-8 active:translate-y-1 ${
            isFlipped ? "bg-gradient-to-br from-[#47ED70] to-[#36BA58] border-[#2A9144] text-white" : "bg-white border-[#E4E4E7] border-2 text-[#18181B]"
          }`}
        >
          <div className="flex justify-between mb-6">
            <span className={`text-[12px] px-6 py-2 rounded-full font-black ${isFlipped ? "bg-white/20" : "bg-[#1473E6] text-white"}`}>
              {isFlipped ? "ĐÁP ÁN" : `THẺ SỐ ${currentIndex + 1}`}
            </span>
            <span className="font-bold opacity-50">{currentIndex + 1} / {questions.length}</span>
          </div>

          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-[28px] font-bold leading-relaxed">
              {isFlipped ? (questions[currentIndex].back || "...") : questions[currentIndex].front}
            </p>
          </div>
          {!isFlipped && <div className="text-center mt-6 animate-bounce text-gray-300 font-bold text-[11px]">CHẠM ĐỂ LẬT 👆</div>}
        </div>

        <div className="flex justify-between items-center mt-12 gap-6">
            <button disabled={currentIndex === 0} onClick={handlePrev} className="px-8 py-4 bg-gray-100 rounded-2xl font-bold disabled:opacity-20">TRƯỚC ĐÓ</button>
            <div className="text-center">
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
                <span className="text-[14px] font-bold text-gray-400 mt-2 block">Tiến độ: {Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <button disabled={currentIndex === questions.length - 1} onClick={handleNext} className="px-8 py-4 bg-[#F26739] text-white rounded-2xl font-bold shadow-lg">TIẾP THEO</button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDetail;