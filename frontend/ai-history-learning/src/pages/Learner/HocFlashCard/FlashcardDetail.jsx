import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; 
import { useNavigate, useParams } from "react-router-dom";

const FlashcardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const questions = [
    { q: "Chiến tranh kháng chiến chống mỹ ai là người lãnh đạo cuộc chiến tranh kháng chiến chống mỹ giải phóng miền nam??", a: "Chủ tịch Hồ Chí Minh là người lãnh đạo dành thắng lợi giải Phóng Miền Nam Việt Nam" },
    { q: "Chiến dịch Điện Biên Phủ diễn ra vào thời gian nào?", a: "Từ ngày 13/3/1954 đến 7/5/1954." },
    { q: "Ai là tổng chỉ huy quân đội Việt Nam trong chiến dịch Điện Biên Phủ?", a: "Đại tướng Võ Nguyên Giáp." },
  ];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex flex-col items-start p-[20px_16px] gap-[20px] w-full min-h-screen bg-[#FAFAFA] font-['Inter']">
      
      {/* Thanh điều hướng trên cùng */}
      <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] flex items-center px-[18px] shadow-sm">
        <button 
          onClick={() => navigate(-1)} // Quay lại trang trước đó (Flashcards library)
          className="text-[16px] font-semibold flex items-center gap-2 text-gray-700 hover:text-[#F26739] transition-colors"
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-[28px] font-black mb-8 uppercase text-[#18181B] tracking-tight">
          Chiến tranh điện biên phủ
        </h2>
        
        {/* Flashcard chính */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full min-h-[400px] rounded-3xl flex flex-col p-8 cursor-pointer transition-all duration-500 shadow-lg border-2 ${
            isFlipped ? "bg-[#47ED70] border-[#36BA58]" : "bg-[#F4F4F5] border-[#E4E4E7]"
          }`}
        >
          <div className="flex justify-start w-full mb-4">
            <span className={`text-[13px] px-6 py-2 rounded-full font-bold shadow-sm ${
              isFlipped ? "bg-white text-[#36BA58]" : "bg-[#1473E6] text-white"
            }`}>
              CÂU HỎI {currentIndex + 1}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
            <p className={`text-[30px] font-extrabold leading-tight max-w-[900px] ${
              isFlipped ? "text-[#064E3B]" : "text-[#18181B]"
            }`}>
              {isFlipped ? questions[currentIndex].a : questions[currentIndex].q}
            </p>
          </div>

          {!isFlipped && (
            <div className="flex justify-center mt-6">
              <div className="bg-[#F26739] text-white text-[14px] px-6 py-2.5 rounded-xl font-bold shadow-md animate-bounce text-center">
                Chạm để xem đáp án 👆
              </div>
            </div>
          )}
        </div>

        {/* Thanh điều hướng dưới Card */}
        <div className="flex justify-between items-center mt-10 px-4">
          <div className="flex flex-col">
             <span className="font-bold text-[18px] text-[#18181B]">{currentIndex + 1} / {questions.length}</span>
             <span className="text-[13px] font-medium uppercase tracking-widest text-gray-400">Tiến độ</span>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 font-bold text-[16px] hover:text-[#F26739] disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={24} /> TRƯỚC
            </button>

            <div className="hidden md:flex gap-2">
                {questions.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setIsFlipped(false); }}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                        currentIndex === i ? "bg-[#18181B] text-white shadow-lg" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 font-bold text-[16px] hover:text-[#F26739] disabled:opacity-20 transition-all"
            >
              TIẾP THEO <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDetail;