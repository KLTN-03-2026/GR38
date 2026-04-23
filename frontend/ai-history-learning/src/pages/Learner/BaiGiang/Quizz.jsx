import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const Quizz = ({ lessonId, lectureTitle }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!lessonId) return;
      try {
        setLoading(true);
        // Lưu ý: Nếu vẫn 404, Phúc hãy check lại router backend xem có phải /quizzes hay /quiz
        const res = await axiosClient.get(`/quizzes/document/${lessonId}`);
        
        console.log("Dữ liệu nhận được:", res);

        // Bóc tách theo cấu trúc success: true, data: [...]
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setQuestions(res.data[0].questions || []);
        } else if (res?.questions) {
          setQuestions(res.questions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Lỗi kết nối API Quiz:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [lessonId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <Loader2 className="animate-spin text-[#f26739]" size={40} />
      <p className="text-gray-500 italic font-medium">Đang tìm bộ câu hỏi...</p>
    </div>
  );

  if (!questions || questions.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center">
      <AlertCircle className="text-gray-300 mb-4" size={48} />
      <h3 className="text-[18px] font-bold text-gray-400 uppercase">Chưa có dữ liệu Quizz</h3>
      <p className="text-gray-500 mt-2 font-medium">Tài liệu: {lectureTitle}</p>
      <div className="mt-4 p-3 bg-red-50 text-red-500 text-xs rounded-lg border border-red-100">
        Lỗi 404: Không tìm thấy nội dung cho ID: {lessonId}
      </div>
    </div>
  );

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-6 bg-white rounded-xl min-h-[500px]">
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

      <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4 mb-8">
          <div className="bg-[#1473E6] text-white min-w-[36px] h-[36px] flex items-center justify-center rounded-lg font-bold shadow-md">
            {currentQuestionIndex + 1}
          </div>
          <h2 className="text-[20px] font-bold text-gray-800 leading-snug">
            {currentQuestion.question} 
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {(currentQuestion.options || []).map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedOption(opt)}
              className={`group flex items-center p-5 text-left border-2 rounded-xl transition-all ${
                selectedOption === opt 
                ? "border-[#f26739] bg-orange-50 shadow-sm" 
                : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-bold transition-colors ${
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
            onClick={() => {
              setCurrentQuestionIndex(prev => prev - 1);
              setSelectedOption(null);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          
          <button 
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
              } else {
                alert("Hoàn thành bài tập!");
              }
            }}
            style={{ backgroundColor: '#f26739' }}
            className="flex items-center gap-2 px-8 py-2.5 text-white rounded-xl font-bold hover:opacity-90 shadow-lg transition-all"
          > 
            {currentQuestionIndex === questions.length - 1 ? "Kết thúc bài" : "Tiếp theo"} 
            {currentQuestionIndex !== questions.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quizz;