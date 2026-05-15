import React, { useState, useEffect } from "react";
import api from "../../../lib/api"; 
import { Loader2, ArrowLeft, ChevronLeft, Timer, Send, AlertTriangle, X } from "lucide-react";
import QuizzResult from "./QuizzResult";

const QuizzView = ({ quizData, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);
  
  // State cho Modal thông báo xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = userAnswers[currentQuestion?._id] || null;

  // Logic thời gian: (Số lượng câu hỏi + 5) phút
  const initialTime = (questions.length + 5) * 60; 
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) {
      if (timeLeft === 0 && !isSubmitted) handleSubmitQuiz(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (option) => {
    setUserAnswers((prev) => ({ 
      ...prev, 
      [currentQuestion._id]: option 
    }));
  };

  // Hàm chuẩn bị dữ liệu và gọi API
  const executeSubmit = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      const durationInSeconds = initialTime - timeLeft;

      const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
        questionId: qId,
        selectedAnswer: ans,
      }));

      // Nếu không có đáp án nào, gửi mảng rỗng thay vì để undefined
      const res = await api.post(`/quizzes/${quizData._id}/submit`, {
        userAnswers: formattedAnswers,
        duration: durationInSeconds,
      });
      
      const resData = res?.data?.data || res?.data;
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
      // Giữ nguyên logic cũ nhưng fix lỗi 400 bằng cách đảm bảo payload đúng format
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = (isAuto = false) => {
    if (isAuto) {
      executeSubmit();
      return;
    }
    setShowConfirmModal(true);
  };

  // Tìm danh sách các câu chưa làm
  const unansweredIndices = questions
    .map((q, idx) => (!userAnswers[q._id] ? idx + 1 : null) )
    .filter(idx => idx !== null);

  if (isSubmitted && resultSummary) {
    return (
      <QuizzResult 
        result={resultSummary} 
        onRetry={() => window.location.reload()} 
        onBack={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto relative">
      {/* Cột trái: Nội dung câu hỏi */}
      <div className="flex-1 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> <span className="text-xs font-bold uppercase">Thoát bài làm</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 text-[#f26739]">
            <Timer size={18} />
            <span className="font-black text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>

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

      {/* Cột phải: Danh sách câu hỏi (Đã thu nhỏ) */}
      <div className="w-full lg:w-64 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-4">
        <h3 className="text-gray-500 font-black text-[11px] uppercase tracking-wider mb-4">DANH SÁCH CÂU</h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {questions.map((q, idx) => {
            const isAnswered = !!userAnswers[q._id];
            const isActive = currentQuestionIndex === idx;
            return (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-9 h-9 rounded-lg font-bold text-xs transition-all border flex items-center justify-center ${
                  isActive 
                    ? "bg-[#f26739] border-[#f26739] text-white shadow-sm scale-105" 
                    : isAnswered 
                      ? "bg-orange-50 border-orange-100 text-[#f26739]" 
                      : "bg-white border-gray-100 text-gray-400 hover:border-orange-100"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleSubmitQuiz()}
          disabled={loading}
          className="w-full py-3 bg-[#f26739] text-white rounded-xl font-bold text-sm shadow-md hover:bg-orange-600 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
          Nộp bài
        </button>
      </div>

      {/* MODAL THÔNG BÁO XÁC NHẬN MỚI */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#f26739]">
                <AlertTriangle size={24} />
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận nộp bài?</h3>
            
            <div className="text-gray-600 text-sm leading-relaxed mb-6">
              {unansweredIndices.length > 0 ? (
                <>
                  <p>Bạn còn các câu: <span className="font-bold text-[#f26739]">{unansweredIndices.join(", ")}</span> chưa trả lời.</p>
                  <p className="mt-1">Bạn vẫn muốn nộp bài chứ?</p>
                </>
              ) : (
                <p>Bạn đã hoàn thành tất cả câu hỏi. Bạn có muốn nộp bài để xem kết quả ngay không?</p>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Hủy / Làm tiếp
              </button>
              <button 
                onClick={executeSubmit}
                className="flex-[1.5] py-3 px-4 bg-[#f26739] text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all"
              >
                Xác nhận nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzView;