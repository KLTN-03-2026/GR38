import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Loader2, 
  Timer as TimerIcon, AlertCircle, Send, CheckCircle2
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
          const fetchedQuestions = data.questions || [];
          setQuestions(fetchedQuestions);

          const totalQ = fetchedQuestions.length;
          let calcMinutes = 10; 
          if (totalQ > 5) {
            calcMinutes = totalQ + 5;
          } else if (totalQ > 0 && totalQ <= 5) {
            calcMinutes = 10;
          }
          setTimeLeft(calcMinutes * 60);
        }
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!isFinished && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) { 
            if (timerRef.current) clearInterval(timerRef.current);
            handleAutoSubmit(); 
            return 0; 
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isFinished, questions]);

  const handleAutoSubmit = async () => {
    try {
      const userAnswers = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: selectedAnswers[q._id]?.text || ""
      }));
      const resSubmit = await api.post(`/quizzes/${id}/submit`, { userAnswers });
      const result = resSubmit.data?.data || resSubmit.data;
      const rId = result.resultId || result._id || result.id;
      if (rId) {
        setScoreData({
          resultId: rId,
          score: result.score ?? 0,
          correct: result.correctAnswersCount ?? 0,
          total: result.totalQuestions ?? questions.length
        });
        setIsFinished(true);
      }
    } catch (err) { console.error(err); }
  };

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
      const rId = result.resultId || result._id || result.id;
      if (rId) {
        setScoreData({
          resultId: rId,
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
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#F8FAFC] p-3 md:p-4 font-['Be_Vietnam_Pro'] selection:bg-blue-100">
      
      {unansweredModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[1.5rem] p-6 max-w-sm w-full text-center shadow-2xl scale-in-center border border-slate-100">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="text-orange-500" size={32} />
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-1">Chưa hoàn thành!</h4>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Bạn còn câu <span className="font-bold text-orange-600">{unansweredModal.list.join(", ")}</span> chưa chọn đáp án. Bạn có muốn nộp luôn không?
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setUnansweredModal({show:false, list:[]})} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                Làm tiếp câu thiếu
              </button>
              <button onClick={() => {setUnansweredModal({show:false, list:[]}); handleSubmit();}} className="text-slate-400 text-[10px] font-bold hover:text-red-500 transition-colors uppercase tracking-wider py-1">
                Xác nhận nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Thu nhỏ chiều cao h-20 -> h-16 */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md border border-white rounded-2xl flex items-center justify-between px-5 h-16 mb-4 shadow-lg shadow-slate-200/50 sticky top-2 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 font-bold text-xs text-slate-500 hover:text-red-500 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="hidden sm:inline">Rời khỏi</span>
        </button>

        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono font-black text-lg border-2 transition-all ${timeLeft < 60 ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
          <TimerIcon size={18} className={timeLeft < 60 ? "text-red-500" : "text-blue-600"}/>
          <span>{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Đang thi</span>
          <div className="font-black text-slate-800 text-xs uppercase truncate max-w-[120px] md:max-w-[200px]">
            {quizInfo?.title || "Đang tải..."}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse rounded-full"></div>
          </div>
          <p className="text-slate-500 text-xs font-bold tracking-wide animate-pulse uppercase">ĐANG CHUẨN BỊ...</p>
        </div>
      ) : (
        <div className="w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
          {/* Progress Bar - Thu hẹp mb-8 -> mb-4 */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full mb-4 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Main Content - Giảm padding p-10 -> p-6/p-8, giảm bo góc */}
            <div className="md:col-span-12 bg-white rounded-[1.5rem] p-5 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                <CheckCircle2 size={80} />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-md shadow-blue-200">
                  Câu hỏi {currentQuestionIndex + 1}
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                  /{questions.length} CÂU
                </span>
              </div>

              {/* Thu nhỏ font chữ câu hỏi text-2xl -> text-xl */}
              <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6 leading-relaxed">
                {currentQ?.question}
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {currentQ?.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ._id]?.index === idx;
                  const labelLetter = String.fromCharCode(65 + idx);
                  return (
                    <label 
                      key={idx} 
                      className={`group flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-300 transform active:scale-[0.99] ${
                        isSelected 
                        ? "border-blue-600 bg-blue-50/50 shadow-sm translate-x-1" 
                        : "bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-md"
                      }`}
                    >
                      <input 
                        type="radio" 
                        className="hidden" 
                        name={`question-${currentQ._id}`}
                        checked={isSelected}
                        onChange={() => setSelectedAnswers(prev => ({...prev, [currentQ._id]: {index: idx, text: opt}}))} 
                      />
                      {/* Thu nhỏ box chữ cái w-11 -> w-9 */}
                      <span className={`w-9 h-9 flex items-center justify-center rounded-xl mr-3 text-sm font-black transition-all duration-300 ${
                        isSelected 
                        ? "bg-blue-600 text-white scale-105 shadow-md shadow-blue-300" 
                        : "bg-white text-slate-400 group-hover:text-slate-600 shadow-sm"
                      }`}>
                        {labelLetter}
                      </span>
                      <span className={`text-sm font-bold transition-colors ${isSelected ? "text-blue-800" : "text-slate-600"}`}>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Navigation Footer - Giảm margin mt-12 -> mt-8 */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    disabled={currentQuestionIndex === 0} 
                    onClick={() => setCurrentQuestionIndex(prev => prev-1)} 
                    className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-xs text-slate-600"
                  >
                    <ChevronLeft size={16} />
                    Trước
                  </button>
                  <button 
                    disabled={currentQuestionIndex === questions.length-1} 
                    onClick={() => setCurrentQuestionIndex(prev => prev+1)} 
                    className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-xs text-slate-600"
                  >
                    Sau
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button 
                  onClick={handleSubmit} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#F26739] to-[#FF8059] hover:from-[#e0562d] text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-orange-100 transition-all active:scale-95"
                >
                  <Send size={16} />
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="mt-4 text-slate-400 text-[9px] font-medium uppercase tracking-[0.2em] opacity-50">
          Smart Quiz System v2.0
        </div>
      )}
    </div>
  );
};

export default HocQuizz;