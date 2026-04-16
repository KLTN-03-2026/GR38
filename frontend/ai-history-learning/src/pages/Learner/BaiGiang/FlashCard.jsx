import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FlashCard = () => {
  // Dữ liệu 10 câu hỏi về Điện Biên Phủ
  const flashcards = [
    { id: 1, q: "Chiến dịch Điện Biên Phủ diễn ra vào thời gian nào?", a: "Từ ngày 13/3/1954 đến 7/5/1954." },
    { id: 2, q: "Ai là tổng chỉ huy quân đội Việt Nam trong chiến dịch Điện Biên Phủ?", a: "Đại tướng Võ Nguyên Giáp." },
    { id: 3, q: "Đối thủ chính của quân đội Việt Nam trong chiến dịch là ai?", a: "Quân đội thực dân Pháp." },
    { id: 4, q: "Tập đoàn cứ điểm Điện Biên Phủ nằm ở đâu?", a: "Ở Điện Biên Phủ (Tây Bắc Việt Nam)." },
    { id: 5, q: "Chiến dịch Điện Biên Phủ gồm mấy đợt tấn công chính?", a: "Gồm 3 đợt tấn công." },
    { id: 6, q: "Kết quả cuối cùng của chiến dịch Điện Biên Phủ là gì?", a: "Quân ta tiêu diệt và bắt sống toàn bộ quân địch, thắng lợi hoàn toàn." },
    { id: 7, q: "Chiến thắng Điện Biên Phủ đã dẫn đến hiệp định nào?", a: "Hiệp định Genève 1954." },
    { id: 8, q: "Ý nghĩa lớn nhất của chiến thắng Điện Biên Phủ là gì?", a: "Chấm dứt ách thống trị của thực dân Pháp ở Việt Nam." },
    { id: 9, q: "Phương châm tác chiến nổi bật của ta trong chiến dịch là gì?", a: "“Đánh chắc, tiến chắc”." },
    { id: 10, q: "Chiến thắng Điện Biên Phủ có ảnh hưởng như thế nào trên thế giới?", a: "Cổ vũ mạnh mẽ phong trào giải phóng dân tộc trên toàn thế giới." },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false); // Reset trạng thái khi sang câu mới
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-6 bg-white min-h-[500px]">
      
      {/* Container của Flashcard */}
      <div 
        className={`relative w-full max-w-[1051px] h-[350px] rounded-[20px] shadow-sm transition-all duration-500 flex flex-col items-center justify-center px-10 text-center
          ${showAnswer ? "bg-[#4ADE80]" : "bg-[#F4F4F5]"} 
        `}
      >
        {/* Badge "Câu X" */}
        <div className="absolute top-6 left-6 bg-[#1473E6] text-white px-4 py-1 rounded-full text-[14px] font-bold">
          Câu {flashcards[currentIndex].id}
        </div>

        {/* Nội dung text */}
        <h2 className={`text-[32px] font-bold leading-tight transition-colors duration-300
          ${showAnswer ? "text-[#064E3B]" : "text-[#09090B]"}
        `}>
          {showAnswer ? flashcards[currentIndex].a : flashcards[currentIndex].q}
        </h2>

        {/* Nút lật thẻ (Chỉ hiện khi chưa lật) */}
        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-8 bg-[#F26739] text-white px-6 py-2 rounded-[8px] font-semibold text-[14px] hover:opacity-90 transition-all shadow-md"
          >
            Ấn vào đây để hiện câu trả lời
          </button>
        )}
      </div>

      {/* Thanh điều hướng và Pagination */}
      <div className="w-full max-w-[1051px] mt-10 flex items-center justify-between">
        <span className="text-[16px] font-medium text-gray-500">
          {currentIndex + 1} / {flashcards.length} Câu
        </span>

        <div className="flex items-center gap-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 text-[18px] font-medium disabled:opacity-30 hover:text-[#1473E6] transition-colors"
          >
            <ChevronLeft size={24} /> Previous
          </button>

          {/* Danh sách số trang */}
          <div className="flex items-center gap-2">
            {flashcards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowAnswer(false);
                }}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[14px] font-medium transition-all
                  ${currentIndex === idx ? "bg-[#1473E6] text-white shadow-md" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center gap-2 text-[18px] font-medium disabled:opacity-30 hover:text-[#1473E6] transition-colors"
          >
            Next <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;