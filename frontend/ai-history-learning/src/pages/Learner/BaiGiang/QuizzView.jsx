import React, { useState } from "react";
import api from "../../../lib/api"; 
import { Loader2, ArrowLeft, ChevronLeft } from "lucide-react";
import QuizzResult from "./QuizzResult";

const QuizzView = ({ quizData, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = userAnswers[currentQuestion?._id] || null;

  const handleSelectOption = (option) => {
    setUserAnswers((prev) => ({ 
      ...prev, 
      [currentQuestion._id]: option 
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      // Chuẩn bị payload theo format API yêu cầu
      const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
        questionId: qId,
        selectedAnswer: ans,
      }));

      // Gọi API submit bài làm
      const res = await api.post(`/quizzes/${quizData._id}/submit`, {
        userAnswers: formattedAnswers,
      });
      
      const resData = res?.data?.data || res?.data;
      
      // Lấy ID kết quả để truyền sang component Result xem chi tiết
      const rId = resData.resultId || resData._id || resData.id;

      if (rId) {
        setResultSummary({
          resultId: rId,
          score: resData.correctAnswersCount ?? 0,
          total: resData.totalQuestions ?? questions.length
        });
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      alert("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Nếu đã nộp bài thành công, hiển thị trang kết quả
  if (isSubmitted && resultSummary) {
    return (
      <QuizzResult 
        result={resultSummary} 
        onRetry={() => window.location.reload()} // Reset toàn bộ state bằng cách reload
        onBack={onBack}
      />
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 mb-6 hover:text-orange-500 transition-colors">
        <ArrowLeft size={16} /> <span className="text-xs font-bold uppercase">Thoát bài làm</span>
      </button>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-[#f26739] font-black text-xl">
            Câu {currentQuestionIndex + 1}
            <span className="text-gray-300 text-sm font-normal ml-1">/{questions.length}</span>
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">
            {quizData.title}
          </p>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#f26739] transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">{currentQuestion?.question}</h2>
        <div className="grid gap-3">
          {currentQuestion?.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className={`p-4 text-left border-2 rounded-2xl transition-all flex items-center group ${
                selectedOption === opt ? "border-[#f26739] bg-orange-50" : "border-white bg-white hover:border-orange-100"
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-sm shrink-0 ${
                selectedOption === opt ? "bg-[#f26739] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-orange-100"
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-medium text-gray-700">{opt}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200/50">
          <button 
            disabled={currentQuestionIndex === 0} 
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
            className="flex items-center text-gray-400 font-bold text-sm disabled:opacity-0 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} /> Trước đó
          </button>
          <button
            disabled={loading}
            onClick={() => currentQuestionIndex === questions.length - 1 ? handleSubmitQuiz() : setCurrentQuestionIndex(prev => prev + 1)}
            className="px-10 py-3 bg-[#f26739] text-white rounded-2xl font-bold shadow-lg hover:bg-orange-600 flex items-center gap-2 transition-all active:scale-95"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {currentQuestionIndex === questions.length - 1 ? "Nộp bài" : "Tiếp theo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizzView;