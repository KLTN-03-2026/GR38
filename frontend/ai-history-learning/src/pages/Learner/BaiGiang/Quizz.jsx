import React, { useState, useEffect } from "react";
import api from "../../../lib/api"; 
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Trophy, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

const Quizz = ({ lessonId, lectureTitle }) => {
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!lessonId) return;
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/document/${lessonId}`);
        const data = res?.data?.data || res?.data || [];

        if (Array.isArray(data) && data.length > 0) {
          const firstQuiz = data[0];
          setQuizInfo(firstQuiz);
          setQuestions(firstQuiz.questions || []);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Lỗi tải Quiz:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [lessonId]);

  const handleSelectOption = (option) => {
    if (isSubmitted) return;
    const currentQuestionId = questions[currentQuestionIndex]._id;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionId]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizInfo?._id) return;
    
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      if (!window.confirm(`Bạn mới làm ${answeredCount}/${questions.length} câu. Vẫn muốn nộp chứ?`)) return;
    }

    try {
      setLoading(true);
      const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
        questionId: qId,
        selectedAnswer: ans
      }));

      const res = await api.post(`/quizzes/${quizInfo._id}/submit`, {
        userAnswers: formattedAnswers
      });

      const resData = res?.data?.data || res?.data;

      if (resData) {
        const total = questions.length;
        // Logic mới: Điểm số = Số câu đúng
        const correct = resData.correctCount || 0;
        const incorrect = total - correct;

        setResult({
          score: correct, // Hiển thị điểm theo số câu đúng (ví dụ: 7)
          correctCount: correct,
          incorrectCount: incorrect,
          totalQuestions: total
        });
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      alert("Không thể nộp bài. Phúc kiểm tra lại kết nối Server nhé!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isSubmitted) return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <Loader2 className="animate-spin text-[#f26739]" size={40} />
      <p className="text-gray-500 italic font-medium">Đang tải câu hỏi...</p>
    </div>
  );

  if (isSubmitted && result) return (
    <div className="p-8 bg-white rounded-2xl text-center shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-orange-50 rounded-full ring-8 ring-orange-50/50">
          <Trophy className="text-[#f26739]" size={64} />
        </div>
      </div>
      <h2 className="text-3xl font-black text-gray-800 mb-1">HOÀN THÀNH</h2>
      <p className="text-gray-400 mb-8 font-medium">{lectureTitle}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
          <p className="text-[11px] text-orange-600 uppercase font-bold mb-1 tracking-wider">Tổng điểm</p>
          <p className="text-4xl font-black text-[#f26739]">{result.score}</p>
          <p className="text-[10px] text-orange-400 font-bold">Câu đúng</p>
        </div>
        
        <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
          <div className="flex justify-center mb-1"><CheckCircle2 size={16} className="text-green-500" /></div>
          <p className="text-[11px] text-green-600 uppercase font-bold mb-1 tracking-wider">Đúng</p>
          <p className="text-4xl font-black text-green-600">{result.correctCount}</p>
        </div>

        <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
          <div className="flex justify-center mb-1"><XCircle size={16} className="text-red-500" /></div>
          <p className="text-[11px] text-red-600 uppercase font-bold mb-1 tracking-wider">Sai</p>
          <p className="text-4xl font-black text-red-600">{result.incorrectCount}</p>
        </div>

        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex justify-center mb-1"><HelpCircle size={16} className="text-blue-500" /></div>
          <p className="text-[11px] text-blue-600 uppercase font-bold mb-1 tracking-wider">Tổng câu</p>
          <p className="text-4xl font-black text-blue-600">{result.totalQuestions}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button 
          onClick={() => window.location.reload()} 
          className="px-10 py-4 bg-[#f26739] text-white rounded-xl font-bold hover:bg-[#e0562b] transition-all shadow-lg active:scale-95"
        >
          Làm lại bài
        </button>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="px-10 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
        >
          Xem lại đáp án
        </button>
      </div>
    </div>
  );

  if (!questions || questions.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h3 className="font-bold text-gray-400 uppercase tracking-widest">Chưa có bộ câu hỏi</h3>
    </div>
  );

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = userAnswers[currentQuestion._id] || null;

  return (
    <div className="p-6 bg-white rounded-xl min-h-[500px]">
      <div className="mb-8 px-2">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[12px] text-[#f26739] font-bold uppercase tracking-[2px]">Kiểm tra nhanh</p>
            <p className="text-sm text-gray-400 font-medium italic truncate max-w-[250px]">{lectureTitle}</p>
          </div>
          <span className="text-[#f26739] font-black text-2xl">
            {currentQuestionIndex + 1}<span className="text-gray-300 text-sm font-normal">/{questions.length}</span>
          </span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
           <div 
             className="h-full bg-[#f26739] transition-all duration-500 ease-out" 
             style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
           ></div>
        </div>
      </div>

      <div className="bg-[#F9FAFB] p-8 rounded-[32px] border border-gray-100 shadow-sm relative">
        <div className="flex items-start gap-4 mb-8">
          <div className="bg-[#1473E6] text-white min-w-[40px] h-[40px] flex items-center justify-center rounded-xl font-bold shadow-lg">
            {currentQuestionIndex + 1}
          </div>
          <h2 className="text-[22px] font-bold text-gray-800 leading-snug">{currentQuestion.question}</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {(currentQuestion.options || []).map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className={`group flex items-center p-5 text-left border-2 rounded-2xl transition-all ${
                selectedOption === opt 
                ? "border-[#f26739] bg-orange-50 shadow-md translate-x-1" 
                : "border-white bg-white hover:border-gray-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-bold ${
                selectedOption === opt ? "border-[#f26739] bg-[#f26739] text-white" : "border-gray-200 text-gray-400"
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={`text-[17px] font-semibold ${selectedOption === opt ? "text-orange-900" : "text-gray-700"}`}>
                {opt}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
          <button 
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronLeft size={20} /> Trước
          </button>
          
          <button 
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                handleSubmitQuiz();
              }
            }}
            className="flex items-center gap-2 px-10 py-3 bg-[#f26739] text-white rounded-xl font-bold hover:bg-[#e0562b] shadow-xl transition-all active:scale-95"
          >
            {currentQuestionIndex === questions.length - 1 ? "Nộp bài" : "Câu tiếp"} 
            {currentQuestionIndex !== questions.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quizz;