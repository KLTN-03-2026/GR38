import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Loader2, 
  Eye, CheckCircle2, XCircle, Timer as TimerIcon,
  RotateCcw, Home, AlertCircle // Thêm icon cảnh báo
} from "lucide-react";
import api from "../../../lib/api"; 

const HocQuizz = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, correct: 0, total: 0 });
  const [error, setError] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({}); 
  
  // State mới cho thông báo
  const [unansweredModal, setUnansweredModal] = useState({ show: false, list: [] });

  const [timeLeft, setTimeLeft] = useState(600); 
  const timerRef = useRef(null);

  // ... (Giữ nguyên các useEffect 1 và 2)
  useEffect(() => {
    const fetchQuizDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/${id}/play`);
        const quizData = res?.data?.data || res?.data || res;
        
        if (quizData && quizData.questions) {
          setQuizInfo(quizData);
          setQuestions(quizData.questions);
          if (quizData.timeLimit) setTimeLeft(quizData.timeLimit * 60);
        }
      } catch (err) {
        setError("Không thể tải bài kiểm tra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetail();
  }, [id]);

  useEffect(() => {
    if (!isFinished && questions.length > 0 && !isReviewing) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isFinished, questions.length, isReviewing]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelectOption = (optionIndex) => {
    if (isReviewing || isFinished) return;
    const currentQ = questions[currentQuestionIndex];
    setSelectedAnswers(prev => ({ 
      ...prev, 
      [currentQ._id]: {
        index: optionIndex,
        text: currentQ.options[optionIndex]
      }
    }));
  };

  const isSameAnswer = (ans1, ans2) => {
    if (ans1 === undefined || ans2 === undefined || ans1 === null || ans2 === null) return false;
    const normalize = (str) => String(str).trim().toLowerCase().replace(/\.$/, "");
    return normalize(ans1) === normalize(ans2);
  };

  // 3. Xử lý nộp bài (Đã thêm phần check câu hỏi chưa chọn)
  const handleSubmit = async () => {
    // Kiểm tra câu chưa chọn
    const unanswered = questions
      .map((q, index) => (!selectedAnswers[q._id] ? index + 1 : null))
      .filter(n => n !== null);

    if (unanswered.length > 0 && !unansweredModal.show) {
      setUnansweredModal({ show: true, list: unanswered });
      return; // Dừng lại để người dùng xem thông báo
    }

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      setLoading(true);
      const userAnswers = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: selectedAnswers[q._id]?.text || "" 
      }));

      const resSubmit = await api.post(`/quizzes/${id}/submit`, { userAnswers });
      const submitResult = resSubmit.data?.data || resSubmit.data;
      
      const resultId = submitResult.resultId || submitResult._id;

      if (resultId) {
        const resDetail = await api.get(`/quizzes/detail/${resultId}`);
        const detailData = resDetail?.data?.data || resDetail?.data;

        const serverDetails = detailData.details || detailData.questions || [];
        const correctsMap = {};

        questions.forEach(q => {
          const matched = serverDetails.find(item => 
            (item.questionId === q._id || (item.question && item.question._id === q._id))
          );
          correctsMap[q._id] = matched?.correctAnswer || matched?.rightAnswer;
        });

        setScoreData({
          score: submitResult.score ?? detailData.score ?? 0,
          correct: submitResult.correctAnswersCount ?? detailData.correctAnswersCount ?? 0, 
          total: submitResult.totalQuestions ?? questions.length,
        });

        setCorrectAnswers(correctsMap);
        setIsFinished(true); 
        setUnansweredModal({ show: false, list: [] }); // Reset modal
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render Loading... (Giữ nguyên)
  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-4" />
        <p className="text-gray-500 text-sm italic font-medium">Đang chuẩn bị bài làm...</p>
      </div>
    );
  }

  // MÀN HÌNH KẾT QUẢ (Giữ nguyên)
  if (isFinished && !isReviewing) {
    const percentage = Math.round((scoreData.score / 10) * 100);
    const wrongCount = scoreData.total - scoreData.correct;

    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center mt-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          
          <div className="mb-6">
             <span className="bg-green-100 text-green-600 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
               Hoàn thành
             </span>
          </div>

          <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={552.9} strokeDashoffset={552.9 - (552.9 * percentage) / 100}
                className="text-green-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-black text-gray-800">{percentage}%</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Rất tốt! Bạn đã hoàn thành bài thi!</h2>
          <p className="text-gray-500 mb-8 font-medium">Xem lại chi tiết để củng cố kiến thức tốt hơn</p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Hoàn thành</p>
              <p className="text-2xl font-black text-gray-800">{scoreData.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
              <p className="text-green-600 text-[10px] font-bold uppercase mb-1">Câu đúng</p>
              <p className="text-2xl font-black text-green-700">{scoreData.correct}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="text-red-600 text-[10px] font-bold uppercase mb-1">Câu sai</p>
              <p className="text-2xl font-black text-red-700">{wrongCount}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => setIsReviewing(true)} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
              <Eye size={20}/> Xem chi tiết bài làm
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                <RotateCcw size={18}/> Làm lại
              </button>
              <button onClick={() => navigate("/learner/quizzes")} className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-md">
                <Home size={18}/> Trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-4 relative">
      
      {/* THÔNG BÁO CÂU CHƯA CHỌN (MODAL ĐẸP) */}
      {unansweredModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-orange-100 text-center scale-up-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-orange-500" size={32} />
            </div>
            <h4 className="text-xl font-black text-gray-800 mb-2">Chưa hoàn thành!</h4>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Bạn vẫn còn các câu <span className="font-bold text-orange-600">{unansweredModal.list.join(", ")}</span> chưa có đáp án. Bạn có muốn nộp luôn không?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setUnansweredModal({ show: false, list: [] })}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button 
                onClick={() => {
                  setUnansweredModal({ show: false, list: [] });
                  // Gọi trực tiếp logic nộp bài sau khi tắt modal bằng cách bypass check
                  const forcedSubmit = async () => {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setLoading(true);
                    const userAnswers = questions.map(q => ({
                      questionId: q._id,
                      selectedAnswer: selectedAnswers[q._id]?.text || "" 
                    }));
                    const resSubmit = await api.post(`/quizzes/${id}/submit`, { userAnswers });
                    const submitResult = resSubmit.data?.data || resSubmit.data;
                    const resultId = submitResult.resultId || submitResult._id;
                    if (resultId) {
                      const resDetail = await api.get(`/quizzes/detail/${resultId}`);
                      const detailData = resDetail?.data?.data || resDetail?.data;
                      const serverDetails = detailData.details || detailData.questions || [];
                      const correctsMap = {};
                      questions.forEach(q => {
                        const matched = serverDetails.find(item => (item.questionId === q._id || (item.question && item.question._id === q._id)));
                        correctsMap[q._id] = matched?.correctAnswer || matched?.rightAnswer;
                      });
                      setScoreData({ score: submitResult.score ?? detailData.score ?? 0, correct: submitResult.correctAnswersCount ?? detailData.correctAnswersCount ?? 0, total: submitResult.totalQuestions ?? questions.length });
                      setCorrectAnswers(correctsMap);
                      setIsFinished(true);
                    }
                    setLoading(false);
                  };
                  forcedSubmit();
                }}
                className="w-full py-3 text-gray-400 font-bold hover:text-red-500 text-xs uppercase tracking-widest transition-all"
              >
                Vẫn nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar (Giữ nguyên) */}
      <div className="w-full max-w-5xl bg-white border rounded-2xl flex items-center justify-between px-6 h-16 mb-4 shadow-sm">
        <button onClick={() => isReviewing ? setIsReviewing(false) : navigate(-1)} className="flex items-center gap-2 font-bold text-gray-600 hover:text-red-500 transition-colors uppercase text-xs">
          <ArrowLeft size={18} /> {isReviewing ? "Quay lại kết quả" : "Rời khỏi"}
        </button>
        
        {!isFinished && !isReviewing && (
            <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full font-mono font-bold text-xl border-2 ${timeLeft < 60 ? "bg-red-50 border-red-500 text-red-600 animate-pulse" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                <TimerIcon size={20}/>
                <span>{formatTime(timeLeft)}</span>
            </div>
        )}

        <div className="text-right hidden md:block">
          <p className="font-black text-gray-800 uppercase text-xs truncate max-w-[200px]">
              {quizInfo?.title}
          </p>
          {isReviewing && <span className="text-orange-500 text-[10px] font-bold">CHẾ ĐỘ XEM LẠI</span>}
        </div>
      </div>

      {/* Main Question View (Giữ nguyên logic Review của giáo viên) */}
      <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100 min-h-[400px] flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
              Câu hỏi {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion?.question}
          </h3>

          <div className="grid grid-cols-1 gap-4 mt-auto">
            {currentQuestion?.options.map((option, index) => {
                const qId = currentQuestion._id;
                const userChoiceText = selectedAnswers[qId]?.text;
                const correctText = correctAnswers[qId]; 
                
                let containerStyle = "border-white bg-white hover:border-blue-200";
                let iconStyle = "bg-gray-100 text-gray-400";
                let badge = null;

                if (isReviewing) {
                  const isThisCorrect = isSameAnswer(option, correctText);
                  const isThisUserChoice = isSameAnswer(option, userChoiceText);

                  if (isThisCorrect) {
                    containerStyle = "border-yellow-400 bg-yellow-50 shadow-sm ring-1 ring-yellow-200";
                    iconStyle = "bg-yellow-500 text-white";
                    badge = <span className="ml-auto text-yellow-700 text-[10px] font-black uppercase italic">Đáp án đúng</span>;
                    if (isThisUserChoice) {
                        containerStyle = "border-green-500 bg-green-50 shadow-sm ring-1 ring-green-200";
                        iconStyle = "bg-green-500 text-white";
                        badge = <CheckCircle2 className="ml-auto text-green-600" size={20}/>;
                    }
                  } else if (isThisUserChoice) {
                    containerStyle = "border-red-400 bg-red-50 ring-1 ring-red-200";
                    iconStyle = "bg-red-500 text-white";
                    badge = <XCircle className="ml-auto text-red-600" size={20}/>;
                  }
                } else {
                  if (selectedAnswers[qId]?.index === index) {
                    containerStyle = "border-blue-600 bg-blue-50 ring-2 ring-blue-100 shadow-sm";
                    iconStyle = "bg-blue-600 text-white";
                  }
                }

                return (
                  <label key={index} className={`flex items-center p-5 rounded-2xl border-2 transition-all ${!isReviewing && "cursor-pointer"} ${containerStyle}`}>
                    <input 
                        type="radio" 
                        className="hidden" 
                        disabled={isReviewing} 
                        checked={selectedAnswers[qId]?.index === index} 
                        onChange={() => handleSelectOption(index)} 
                    />
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl mr-4 font-black text-sm transition-colors ${iconStyle}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-bold text-gray-700">{option}</span>
                    {badge}
                  </label>
                );
            })}
          </div>
        </div>

        {/* Navigation Footer (Giữ nguyên) */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} 
              disabled={currentQuestionIndex === 0} 
              className="p-3 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={24}/>
            </button>
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} 
              disabled={currentQuestionIndex === questions.length - 1} 
              className="p-3 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={24}/>
            </button>
          </div>

          {!isReviewing ? (
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="bg-[#F26739] text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-600 shadow-lg uppercase flex items-center gap-2 transition-all disabled:opacity-70"
            >
              {loading && <Loader2 className="animate-spin" size={20}/>}
              Nộp bài
            </button>
          ) : (
            <button 
              onClick={() => setIsReviewing(false)} 
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-md hover:bg-black transition-all"
            >
              Quay lại kết quả
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HocQuizz;