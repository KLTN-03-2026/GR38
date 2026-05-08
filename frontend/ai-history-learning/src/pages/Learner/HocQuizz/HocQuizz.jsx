import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Loader2, 
  Timer as TimerIcon, AlertCircle 
} from "lucide-react";
import api from "../../../lib/api";
import QuizResult from "./QuizResult";

const HocQuizz = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [questions, setQuestions] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef(null);

  const [isFinished, setIsFinished] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [unansweredModal, setUnansweredModal] = useState({ show: false, list: [] });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/${id}/play`);
        const data = res?.data?.data || res?.data;
        if (data) {
          setQuizInfo(data);
          setQuestions(data.questions || []);
          if (data.timeLimit) setTimeLeft(data.timeLimit * 60);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!isFinished && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) { handleSubmit(); return 0; }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isFinished, questions]);

  const handleSubmit = async () => {
    const unanswered = questions.map((q, i) => !selectedAnswers[q._id] ? i + 1 : null).filter(n => n);
    if (unanswered.length > 0 && !unansweredModal.show) {
      setUnansweredModal({ show: true, list: unanswered });
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      setLoading(true);
      const userAnswers = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: selectedAnswers[q._id]?.text || ""
      }));

      const resSubmit = await api.post(`/quizzes/${id}/submit`, { userAnswers });
      const result = resSubmit.data?.data || resSubmit.data;
      
      // Lấy ID kết quả (Sửa lỗi: Phải lấy đúng key từ Backend trả về)
      const rId = result.resultId || result._id || result.id;

      if (rId) {
        setScoreData({
          resultId: rId, // LƯU QUAN TRỌNG
          score: result.score ?? 0,
          correct: result.correctAnswersCount ?? 0,
          total: result.totalQuestions ?? questions.length
        });
        setIsFinished(true);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (isFinished) {
    return (
      <QuizResult 
        quiz={quizInfo}
        resultId={scoreData?.resultId} 
        score={scoreData?.correct}
        total={scoreData?.total}
      />
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-4 font-['Be_Vietnam_Pro']">
      {unansweredModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <AlertCircle className="text-orange-500 mx-auto mb-4" size={48} />
            <h4 className="text-xl font-black mb-2">Chưa hoàn thành!</h4>
            <p className="text-gray-500 mb-6">Câu {unansweredModal.list.join(", ")} chưa chọn đáp án.</p>
            <button onClick={() => setUnansweredModal({show:false, list:[]})} className="w-full py-3 bg-gray-900 text-white rounded-xl mb-2 font-bold">Làm tiếp</button>
            <button onClick={() => {setUnansweredModal({show:false, list:[]}); handleSubmit();}} className="text-gray-400 font-bold hover:text-gray-600">Vẫn nộp bài</button>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl bg-white border rounded-2xl flex items-center justify-between px-6 h-16 mb-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-gray-500 hover:text-red-500 transition-colors">
          <ArrowLeft size={18} /> Rời khỏi
        </button>
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-full font-mono font-bold text-xl border-2 bg-gray-50 text-gray-700">
          <TimerIcon size={20} className="text-blue-600"/>
          <span>{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</span>
        </div>
        <div className="font-black text-gray-800 uppercase hidden md:block truncate max-w-[300px]">{quizInfo?.title}</div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center mt-20 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-500 font-medium">Đang tải câu hỏi...</p>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-sm border">
          <div className="bg-gray-50 rounded-2xl p-8 min-h-[420px] flex flex-col">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase w-fit mb-6 shadow-md shadow-blue-100">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
            <h3 className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">{currentQ?.question}</h3>
            <div className="grid grid-cols-1 gap-4 mt-auto">
              {currentQ?.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQ._id]?.index === idx;
                return (
                  <label key={idx} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? "border-blue-600 bg-blue-50 shadow-md translate-x-1" : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-100/50"}`}>
                    <input 
                      type="radio" 
                      className="hidden" 
                      name={`question-${currentQ._id}`}
                      checked={isSelected}
                      onChange={() => setSelectedAnswers(prev => ({...prev, [currentQ._id]: {index: idx, text: opt}}))} 
                    />
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl mr-4 font-black transition-colors ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`font-bold transition-colors ${isSelected ? "text-blue-700" : "text-gray-700"}`}>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <div className="flex gap-4">
              <button disabled={currentQuestionIndex===0} onClick={() => setCurrentQuestionIndex(prev => prev-1)} className="p-4 border-2 rounded-2xl hover:bg-gray-50 disabled:opacity-20 transition-all"><ChevronLeft/></button>
              <button disabled={currentQuestionIndex===questions.length-1} onClick={() => setCurrentQuestionIndex(prev => prev+1)} className="p-4 border-2 rounded-2xl hover:bg-gray-50 disabled:opacity-20 transition-all"><ChevronRight/></button>
            </div>
            <button onClick={handleSubmit} className="bg-[#F26739] hover:bg-[#e0562d] text-white px-10 py-4 rounded-2xl font-black uppercase shadow-lg shadow-orange-100 transition-all active:scale-95">Nộp bài</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HocQuizz;