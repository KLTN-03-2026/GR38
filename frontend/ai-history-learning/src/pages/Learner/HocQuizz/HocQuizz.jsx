import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Eye, CheckCircle2, XCircle, Timer as TimerIcon } from "lucide-react";
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

  // --- THỜI GIAN 10 PHÚT ---
  const [timeLeft, setTimeLeft] = useState(600); 
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuizDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/quiz/${id}`); 
        const quizData = res?.data?.data || res?.data || res;
        
        if (quizData && quizData.questions) {
          setQuizInfo(quizData);
          setQuestions(quizData.questions);
        } else {
          setError("Không tìm thấy dữ liệu câu hỏi.");
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetail();
  }, [id]);

  useEffect(() => {
    if (!isFinished && questions.length > 0) {
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
  }, [isFinished, questions.length]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelectOption = (optionIndex) => {
    if (isReviewing) return;
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
    return String(ans1).trim().toLowerCase() === String(ans2).trim().toLowerCase();
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      setLoading(true);
      const userAnswers = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: selectedAnswers[q._id]?.text || "" 
      }));

      const res = await api.post(`/quizzes/${id}/submit`, { userAnswers });
      const result = res?.data?.data || res?.data || res;

      if (result) {
        const total = questions.length;
        let calculatedCorrect = 0;
        const corrects = {};

        if (result.questions && Array.isArray(result.questions)) {
          result.questions.forEach(q => {
            const qId = q.questionId || q.id || q._id;
            corrects[qId] = q.correctAnswer;
            const userChoiceText = selectedAnswers[qId]?.text;
            if (isSameAnswer(userChoiceText, q.correctAnswer)) {
              calculatedCorrect++;
            }
          });
        }

        setScoreData({
          score: result.score || (calculatedCorrect / total) * 100,
          correct: (result.correctCount !== undefined ? result.correctCount : result.correct) || calculatedCorrect,
          total: result.totalQuestions || total,
        });

        setCorrectAnswers(corrects);
        setIsFinished(true);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Lỗi máy chủ (500) khi nộp bài. Vui lòng kiểm tra lại hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && questions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-4" />
            <p className="text-gray-500 text-sm">Đang chuẩn bị câu hỏi...</p>
        </div>
    );
  }

  if (isFinished && !isReviewing) {
    const wrongCount = scoreData.total - scoreData.correct;
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border p-8 text-center mt-6">
          <div className="bg-green-500 text-white px-6 py-1.5 rounded-full inline-block text-lg font-bold mb-4">HOÀN THÀNH</div>
          <div className="text-7xl font-black text-gray-900 mb-1">{Math.round(scoreData.score)}%</div>
          <p className="text-gray-400 mb-8 text-sm italic">Kết quả bài làm của bạn</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-blue-600 text-[10px] font-bold uppercase mb-1">Tổng số</p>
              <p className="text-2xl font-black">{scoreData.total}</p>
            </div>
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
              <p className="text-green-600 text-[10px] font-bold uppercase mb-1">Câu đúng</p>
              <p className="text-2xl font-black">{scoreData.correct}</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
              <p className="text-red-600 text-[10px] font-bold uppercase mb-1">Câu sai</p>
              <p className="text-2xl font-black">{wrongCount < 0 ? 0 : wrongCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => setIsReviewing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all text-sm">
              <Eye size={18}/> Xem đáp án
            </button>
            <button onClick={() => window.location.reload()} className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">Làm lại</button>
            <button onClick={() => navigate("/learner/quizzes")} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all text-sm">Quay về</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-3">
      {/* Header Gọn hơn */}
      <div className="w-full max-w-5xl bg-white border rounded-xl flex items-center justify-between px-5 h-14 mb-3 shadow-sm">
        <button onClick={() => isReviewing ? setIsReviewing(false) : navigate(-1)} className="flex items-center gap-2 font-bold text-gray-600 hover:text-orange-500 text-sm">
          <ArrowLeft size={18} /> {isReviewing ? "Quay lại" : "Thoát"}
        </button>
        
        {/* Timer Chuyên nghiệp hơn */}
        {!isFinished && !isReviewing && (
            <div className={`flex items-center gap-2 px-4 py-1 rounded-full font-mono font-bold text-lg border-2 transition-all ${timeLeft < 60 ? "bg-red-50 border-red-500 text-red-600 animate-pulse" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                <TimerIcon size={18} className={timeLeft < 60 ? "animate-spin" : ""}/>
                <span>{formatTime(timeLeft)}</span>
            </div>
        )}

        <p className="font-black text-blue-800 uppercase text-sm tracking-tight truncate max-w-[200px] md:max-w-none">
            {quizInfo?.title}
        </p>
        
        {isReviewing && <span className="bg-orange-500 text-white px-3 py-1 rounded text-[10px] font-bold">XEM LẠI</span>}
      </div>

      {/* Vùng nội dung chính thu nhỏ vừa khung hình */}
      <div className="w-full max-w-4xl bg-white rounded-2xl p-5 shadow-sm border">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 min-h-[350px]">
          <div className="mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-6 leading-tight">
            {currentQuestion?.question}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion?.options.map((option, index) => {
                const qId = currentQuestion._id;
                const userChoice = selectedAnswers[qId];
                const userText = userChoice?.text;
                const correctText = correctAnswers[qId];
                
                let containerStyle = "border-white bg-white";
                let iconStyle = "bg-gray-100 text-gray-400";
                let showBadge = null;

                if (isReviewing) {
                  const isThisCorrect = isSameAnswer(option, correctText);
                  const isThisUserChoice = isSameAnswer(option, userText);

                  if (isThisCorrect) {
                    containerStyle = "border-green-500 bg-green-50";
                    iconStyle = "bg-green-500 text-white";
                    showBadge = <CheckCircle2 className="ml-auto text-green-600" size={20}/>;
                    if (!isThisUserChoice) {
                      containerStyle = "border-yellow-400 bg-yellow-50";
                      iconStyle = "bg-yellow-500 text-white";
                      showBadge = <span className="ml-auto text-yellow-700 text-[10px] font-bold uppercase">Đáp án đúng</span>;
                    }
                  } else if (isThisUserChoice) {
                    containerStyle = "border-red-400 bg-red-50";
                    iconStyle = "bg-red-500 text-white";
                    showBadge = <XCircle className="ml-auto text-red-600" size={20}/>;
                  }
                } else {
                  if (userChoice?.index === index) {
                    containerStyle = "border-blue-600 bg-blue-50 ring-1 ring-blue-100";
                    iconStyle = "bg-blue-600 text-white";
                  }
                }

                return (
                  <label key={index} className={`flex items-center p-3.5 rounded-xl border-2 transition-all ${!isReviewing && "cursor-pointer hover:border-blue-300 active:scale-[0.99]"} ${containerStyle}`}>
                    <input type="radio" className="hidden" disabled={isReviewing} checked={userChoice?.index === index} onChange={() => handleSelectOption(index)} />
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg mr-3 font-bold text-sm ${iconStyle}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-semibold text-gray-700 text-sm">{option}</span>
                    {showBadge}
                  </label>
                );
            })}
          </div>
        </div>

        {/* Footer điều hướng */}
        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <div className="flex gap-2">
            <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-20 transition-colors">
              <ChevronLeft size={24}/>
            </button>
            <button onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-20 transition-colors">
              <ChevronRight size={24}/>
            </button>
          </div>

          {!isReviewing ? (
            <button onClick={handleSubmit} disabled={loading} className="bg-[#F26739] text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-md uppercase flex items-center gap-2 text-sm transition-all active:scale-95">
              {loading && <Loader2 className="animate-spin" size={18}/>}
              Nộp bài
            </button>
          ) : (
            <button onClick={() => setIsReviewing(false)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase text-sm">
              Xong
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HocQuizz;