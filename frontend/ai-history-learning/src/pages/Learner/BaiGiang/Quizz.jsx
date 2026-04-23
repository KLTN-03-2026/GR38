import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trophy } from "lucide-react";

const Quizz = ({ lessonId, lectureTitle }) => {
  const [quizInfo, setQuizInfo] = useState(null); // Lưu thông tin chung của Quiz (ID, Title)
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // 1. State lưu câu trả lời: { questionId: "selectedOption" }
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null); // Lưu kết quả trả về từ API nộp bài

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!lessonId) return;
      try {
        setLoading(true);
        const res = await axiosClient.get(`/quizzes/${lessonId}`);
        if (res?.success && res.data?.length > 0) {
          const firstQuiz = res.data[0];
          setQuizInfo(firstQuiz);
          setQuestions(firstQuiz.questions || []);
        }
      } catch (err) {
        console.error("Lỗi kết nối API Quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [lessonId]);

  // 2. Hàm xử lý khi chọn đáp án
  const handleSelectOption = (option) => {
    if (isSubmitted) return; // Nếu đã nộp bài thì không cho chọn lại
    const currentQuestionId = questions[currentQuestionIndex]._id;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionId]: option
    }));
  };

  // 3. Hàm nộp bài lên Server
  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      // Format data theo yêu cầu API: userAnswers là mảng các object
      const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
        questionId: qId,
        selectedAnswer: ans
      }));

      const res = await axiosClient.post(`/quizzes/${quizInfo._id}/submit`, {
        userAnswers: formattedAnswers
      });

      if (res?.success) {
        setResult(res.data);
        setIsSubmitted(true);
      }
    } catch (err) {
      alert("Lỗi khi nộp bài, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isSubmitted) return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <Loader2 className="animate-spin text-[#f26739]" size={40} />
      <p className="text-gray-500 italic">Đang xử lý...</p>
    </div>
  );

  // Giao diện kết quả sau khi nộp
  if (isSubmitted && result) return (
    <div className="p-10 bg-white rounded-2xl text-center shadow-sm border border-gray-100">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-orange-50 rounded-full">
          <Trophy className="text-[#f26739]" size={60} />
        </div>
      </div>
      <h2 className="text-3xl font-black text-gray-800 mb-2">Kết Quả Bài Làm</h2>
      <p className="text-gray-500 mb-8 font-medium">{lectureTitle}</p>
      
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400 uppercase font-bold">Tổng điểm</p>
          <p className="text-2xl font-black text-[#f26739]">{result.score}/10</p>
        </div>
        <div className="p-4 bg-green-50 rounded-xl">
          <p className="text-xs text-green-600 uppercase font-bold">Câu đúng</p>
          <p className="text-2xl font-black text-green-600">{result.correctCount}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-600 uppercase font-bold">Tổng số câu</p>
          <p className="text-2xl font-black text-blue-600">{result.totalQuestions}</p>
        </div>
      </div>

      <button 
        onClick={() => window.location.reload()} 
        className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
      >
        Làm lại bài tập
      </button>
    </div>
  );

  if (!questions || questions.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center text-gray-400">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="font-bold uppercase">Không tìm thấy dữ liệu</h3>
    </div>
  );

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = userAnswers[currentQuestion._id] || null;

  return (
    <div className="p-6 bg-white rounded-xl min-h-[500px]">
      {/* Progress Bar & Header */}
      <div className="mb-8 px-2">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[12px] text-[#f26739] font-bold uppercase tracking-widest">Học tập & Rèn luyện</p>
            <p className="text-sm text-gray-400 font-medium italic truncate max-w-[250px]">{lectureTitle}</p>
          </div>
          <span className="text-[#f26739] font-black text-xl">
            {currentQuestionIndex + 1}<span className="text-gray-300 text-sm font-normal">/{questions.length}</span>
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
           <div className="h-full bg-[#f26739] transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start gap-4 mb-8">
          <div className="bg-[#1473E6] text-white min-w-[36px] h-[36px] flex items-center justify-center rounded-lg font-bold shadow-md">
            {currentQuestionIndex + 1}
          </div>
          <h2 className="text-[20px] font-bold text-gray-800 leading-snug">{currentQuestion.question}</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {(currentQuestion.options || []).map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className={`group flex items-center p-5 text-left border-2 rounded-xl transition-all ${
                selectedOption === opt 
                ? "border-[#f26739] bg-orange-50" 
                : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-bold ${
                selectedOption === opt ? "border-[#f26739] text-[#f26739]" : "border-gray-200 text-gray-400"
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={`text-[16px] font-semibold ${selectedOption === opt ? "text-orange-800" : "text-gray-700"}`}>
                {opt}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
          <button 
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          
          <button 
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                handleSubmitQuiz(); // Gọi hàm nộp bài khi ở câu cuối
              }
            }}
            style={{ backgroundColor: '#f26739' }}
            className="flex items-center gap-2 px-8 py-2.5 text-white rounded-xl font-bold hover:opacity-90 shadow-lg transition-all"
          >
            {currentQuestionIndex === questions.length - 1 ? "Nộp bài ngay" : "Tiếp theo"} 
            {currentQuestionIndex !== questions.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quizz;