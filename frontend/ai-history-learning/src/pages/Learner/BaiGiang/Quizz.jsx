import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";

const Quizz = () => {
  const questions = [
    { id: 1, question: "Chiến dịch Điện Biên Phủ diễn ra vào năm nào?", options: ["1953", "1954", "1955", "1956"], answer: "1954" },
    { id: 2, question: "Chiến thắng Điện Biên Phủ kết thúc vào ngày nào?", options: ["6/5/1954", "7/5/1954", "8/5/1954", "9/5/1954"], answer: "7/5/1954" },
    { id: 3, question: "Ai là Tổng chỉ huy quân đội Việt Nam trong chiến dịch Điện Biên Phủ?", options: ["Trường Chinh", "Võ Nguyên Giáp", "Hồ Chí Minh", "Phạm Văn Đồng"], answer: "Võ Nguyên Giáp" },
    { id: 4, question: "Đối thủ chính của quân đội Việt Nam trong trận Điện Biên Phủ là nước nào?", options: ["Mỹ", "Pháp", "Nhật", "Anh"], answer: "Pháp" },
    { id: 5, question: "Tướng chỉ huy quân Pháp tại Điện Biên Phủ là ai?", options: ["Salan", "De Castries", "Navarre", "Bigeard"], answer: "De Castries" },
    { id: 6, question: "Chiến dịch Điện Biên Phủ thuộc cuộc kháng chiến nào?", options: ["Kháng chiến chống Mỹ", "Kháng chiến chống Pháp", "Kháng chiến chống Nhật", "Nội chiến"], answer: "Kháng chiến chống Pháp" },
    { id: 7, question: "Điện Biên Phủ thuộc khu vực nào của Việt Nam?", options: ["Đồng bằng Bắc Bộ", "Tây Nguyên", "Tây Bắc", "Nam Bộ"], answer: "Tây Bắc" },
    { id: 8, question: "Phương châm tác chiến của ta trong chiến dịch là gì?", options: ["Đánh nhanh thắng nhanh", "Đánh chắc tiến chắc", "Phòng thủ là chính", "Rút lui chiến lược"], answer: "Đánh chắc tiến chắc" },
    { id: 9, question: "Chiến dịch Điện Biên Phủ kéo dài bao nhiêu ngày?", options: ["45 ngày", "56 ngày", "60 ngày", "30 ngày"], answer: "56 ngày" },
    { id: 10, question: "Chiến thắng Điện Biên Phủ có ý nghĩa gì?", options: ["Mở đầu chiến tranh", "Kết thúc chiến tranh Đông Dương lần thứ nhất", "Thống nhất đất nước", "Bắt đầu công nghiệp hóa"], answer: "Kết thúc chiến tranh Đông Dương lần thứ nhất" },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [savedAnswers, setSavedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (showSaveSuccess) {
      const timer = setTimeout(() => setShowSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaveSuccess]);

  const handleSelectOption = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: option });
  };

  const handleSaveAnswer = () => {
    if (selectedAnswers[currentQuestion.id]) {
      setSavedAnswers({ ...savedAnswers, [currentQuestion.id]: selectedAnswers[currentQuestion.id] });
      setShowSaveSuccess(true);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSavedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
  };

  // Hàm quay lại câu 1
  const handleBackToFirst = () => {
    setCurrentQuestionIndex(0);
  };

  const correctCount = questions.filter(q => savedAnswers[q.id] === q.answer).length;
  const scorePercentage = (correctCount / questions.length) * 100;

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F8F9FA]">
        <div className="w-full max-w-[1061px] bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center">
          <div className="bg-[#22C55E] text-white text-[16px] px-6 py-2 rounded-full font-bold mb-6 uppercase tracking-wider">
            Hoàn Thành
          </div>
          <h2 className="text-[28px] font-bold text-[#09090B] mb-2">Cuộc chiến tranh Điện Biên Phủ</h2>
          <div className="text-[64px] font-bold text-[#EF4444] mb-8">{scorePercentage} %</div>
          <div className="flex gap-4 mb-10">
            <div className="bg-[#FBBF24] text-white px-6 py-2 rounded-lg font-bold text-sm">
              Hoàn thành {Object.keys(savedAnswers).length}/{questions.length} câu
            </div>
            <div className="bg-[#22C55E] text-white px-6 py-2 rounded-lg font-bold text-sm">
              Đúng {correctCount} câu
            </div>
            <div className="bg-[#EF4444] text-white px-6 py-2 rounded-lg font-bold text-sm">
              Sai {questions.length - correctCount} câu
            </div>
          </div>
          <button 
            onClick={handleRetry} 
            className="text-[#1473E6] font-bold text-lg hover:underline transition-all"
          >
            Làm lại bài tập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-full flex flex-col gap-6 font-['Inter']">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-[#1473E6] text-white px-4 py-1 rounded-full text-[12px] font-bold">
            Câu {currentQuestionIndex + 1}
          </span>
          <h2 className="text-lg font-semibold text-[#1F2937]">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedAnswers[currentQuestion.id] === option
                  ? "border-[#1473E6] bg-blue-50"
                  : "border-gray-100 hover:border-gray-200 bg-white"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                className="w-4 h-4 accent-[#1473E6]"
                checked={selectedAnswers[currentQuestion.id] === option}
                onChange={() => handleSelectOption(option)}
              />
              <span className="text-[#4B5563] font-medium">{option}</span>
            </label>
          ))}
        </div>

        <div className="absolute right-8 top-8 flex items-center gap-3">
          {showSaveSuccess && (
            <span className="text-green-600 text-[12px] font-bold animate-pulse">
              Lưu thành công!
            </span>
          )}
          <button 
            onClick={handleSaveAnswer}
            className="flex items-center gap-2 bg-[#1473E6] text-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-blue-600 transition-colors shadow-md"
          >
            <Save size={16} /> Lưu câu trả lời
          </button>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-gray-500">
                {currentQuestionIndex + 1} / {questions.length} Câu
             </span>
             <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#1473E6] transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-1">
                {questions.map((q, idx) => {
                    const isSaved = savedAnswers[q.id];
                    const isSelectedButNotSaved = selectedAnswers[q.id] && !savedAnswers[q.id];
                    
                    return (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                                currentQuestionIndex === idx 
                                ? "bg-[#1473E6] text-white" 
                                : isSaved 
                                ? "bg-green-100 text-green-600" 
                                : isSelectedButNotSaved 
                                ? "bg-yellow-100 text-yellow-600 border border-yellow-400" 
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>

            <button
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '8px',
            width: '1061px',
            height: '36px',
            margin: '0 auto'
        }}>
            <button 
                onClick={handleBackToFirst}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 16px',
                    width: '137px',
                    height: '36px',
                    background: '#F26739',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0
                }}
            >
                <span style={{
                    width: '105px',
                    height: '20px',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: '12px',
                    lineHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'center',
                    color: '#FAFAFA'
                }}>
                    Quay lại trang đầu
                </span>
            </button>

            <button 
                onClick={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 16px',
                    width: '77px',
                    height: '36px',
                    background: '#F26739',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    flex: 'none',
                    order: 1,
                    flexGrow: 0
                }}
            >
                <span style={{
                    width: '45px',
                    height: '20px',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: '12px',
                    lineHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'center',
                    color: '#FAFAFA'
                }}>
                    Nộp Bài
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Quizz;