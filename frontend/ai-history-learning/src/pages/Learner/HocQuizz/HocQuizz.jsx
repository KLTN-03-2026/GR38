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

  const [timeLeft, setTimeLeft] = useState(600); 
  const timerRef = useRef(null);

  // 1. Fetch Quiz
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
          if (quizData.timeLimit) setTimeLeft(quizData.timeLimit * 60);
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetail();
  }, [id]);

  // 2. Timer Logic
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

  /**
   * HÀM QUAN TRỌNG: Chuẩn hóa chuỗi để so sánh đáp án chính xác tuyệt đối
   * Loại bỏ khoảng trắng đầu cuối, viết thường, loại bỏ dấu chấm cuối câu (nếu có)
   */
  const isSameAnswer = (ans1, ans2) => {
    if (ans1 === undefined || ans2 === undefined || ans1 === null || ans2 === null) return false;
    const normalize = (str) => String(str).trim().toLowerCase().replace(/\.$/, "");
    return normalize(ans1) === normalize(ans2);
  };

  // 3. XỬ LÝ NỘP BÀI VÀ TRÍCH XUẤT ĐÁP ÁN ĐÚNG
  const handleSubmit = async () => {
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

        // Backend trả về chi tiết đáp án của từng câu
        const serverDetails = detailData.details || detailData.questions || [];
        const correctsMap = {};

        questions.forEach(q => {
          const matched = serverDetails.find(item => 
            (item.questionId === q._id || (item.question && item.question._id === q._id))
          );
          // Lưu đáp án đúng từ Backend trả về
          correctsMap[q._id] = matched?.correctAnswer || matched?.rightAnswer;
        });

        setScoreData({
          score: submitResult.score ?? detailData.score ?? 0,
          correct: submitResult.correctAnswersCount ?? detailData.correctAnswersCount ?? 0, 
          total: submitResult.totalQuestions ?? questions.length,
        });

        setCorrectAnswers(correctsMap);
        setIsFinished(true); 
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      alert("Nộp bài thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-4" />
        <p className="text-gray-500 text-sm italic font-medium">Đang xử lý...</p>
      </div>
    );
  }

  // MÀN HÌNH KẾT QUẢ (Hình 1)
  if (isFinished && !isReviewing) {
    const wrongCount = scoreData.total - scoreData.correct;
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border p-8 text-center mt-6">
          <div className="bg-green-500 text-white px-6 py-1.5 rounded-full inline-block text-lg font-bold mb-4 uppercase tracking-wider">Hoàn thành</div>
          <div className="text-7xl font-black text-gray-900 mb-1">{Number(scoreData.score).toFixed(1)}</div>
          <p className="text-gray-400 mb-8 text-sm italic font-medium">Điểm số của bạn (Thang 10)</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
              <p className="text-blue-600 text-[10px] font-bold uppercase mb-1">Tổng câu</p>
              <p className="text-2xl font-black text-blue-900">{scoreData.total}</p>
            </div>
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
              <p className="text-green-600 text-[10px] font-bold uppercase mb-1">Câu đúng</p>
              <p className="text-2xl font-black text-green-900">{scoreData.correct}</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
              <p className="text-red-600 text-[10px] font-bold uppercase mb-1">Câu sai</p>
              <p className="text-2xl font-black text-red-900">{wrongCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => setIsReviewing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md text-sm uppercase transition-all">
              <Eye size={18}/> Xem lại câu trả lời
            </button>
            <button onClick={() => window.location.reload()} className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 text-sm shadow-sm uppercase transition-all">Làm lại</button>
            <button onClick={() => navigate("/learner/quizzes")} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black text-sm shadow-md uppercase transition-all">Quay về</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-3">
      {/* Header Bar */}
      <div className="w-full max-w-5xl bg-white border rounded-xl flex items-center justify-between px-5 h-14 mb-3 shadow-sm">
        <button onClick={() => isReviewing ? setIsReviewing(false) : navigate(-1)} className="flex items-center gap-2 font-bold text-gray-600 hover:text-orange-500 text-sm transition-colors uppercase">
          <ArrowLeft size={18} /> {isReviewing ? "Quay lại" : "Thoát"}
        </button>
        
        {!isFinished && !isReviewing && (
            <div className={`flex items-center gap-2 px-4 py-1 rounded-full font-mono font-bold text-lg border-2 ${timeLeft < 60 ? "bg-red-50 border-red-500 text-red-600 animate-pulse" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                <TimerIcon size={18}/>
                <span>{formatTime(timeLeft)}</span>
            </div>
        )}

        <p className="font-black text-blue-800 uppercase text-sm truncate max-w-[200px]">
            {quizInfo?.title || "Đang làm bài..."}
        </p>
        
        {isReviewing && <span className="bg-orange-500 text-white px-3 py-1 rounded text-[10px] font-bold shadow-sm">ĐANG XEM LẠI</span>}
      </div>

      {/* Main Question View (HÌNH 2 SỬA TẠI ĐÂY) */}
      <div className="w-full max-w-4xl bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 min-h-[350px]">
          <div className="mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-6 leading-relaxed">
            {currentQuestion?.question}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion?.options.map((option, index) => {
                const qId = currentQuestion._id;
                const userChoiceText = selectedAnswers[qId]?.text;
                const correctText = correctAnswers[qId]; // Đáp án đúng từ DB
                
                let containerStyle = "border-white bg-white";
                let iconStyle = "bg-gray-100 text-gray-400";
                let badge = null;

                if (isReviewing) {
                  const isThisCorrect = isSameAnswer(option, correctText);
                  const isThisUserChoice = isSameAnswer(option, userChoiceText);

                  // 1. Nếu đây là đáp án ĐÚNG từ Database -> Luôn tô VÀNG để gợi ý
                  if (isThisCorrect) {
                    containerStyle = "border-yellow-400 bg-yellow-50 shadow-sm ring-1 ring-yellow-200";
                    iconStyle = "bg-yellow-500 text-white";
                    badge = <span className="ml-auto text-yellow-700 text-[10px] font-black uppercase italic">Đáp án đúng</span>;
                    
                    // 2. Nếu người dùng chọn đúng câu này -> Ghi đè bằng màu XANH
                    if (isThisUserChoice) {
                        containerStyle = "border-green-500 bg-green-50 shadow-sm ring-1 ring-green-200";
                        iconStyle = "bg-green-500 text-white";
                        badge = <CheckCircle2 className="ml-auto text-green-600" size={20}/>;
                    }
                  } 
                  // 3. Nếu đây là đáp án người dùng chọn nhưng SAI -> Tô ĐỎ
                  else if (isThisUserChoice) {
                    containerStyle = "border-red-400 bg-red-50 ring-1 ring-red-200";
                    iconStyle = "bg-red-500 text-white";
                    badge = <XCircle className="ml-auto text-red-600" size={20}/>;
                  }
                } else {
                  // Style lúc đang làm bài bình thường
                  if (selectedAnswers[qId]?.index === index) {
                    containerStyle = "border-blue-600 bg-blue-50 ring-2 ring-blue-100/50 shadow-sm";
                    iconStyle = "bg-blue-600 text-white";
                  }
                }

                return (
                  <label key={index} className={`flex items-center p-4 rounded-xl border-2 transition-all ${!isReviewing && "cursor-pointer hover:border-blue-300"} ${containerStyle}`}>
                    <input 
                        type="radio" 
                        className="hidden" 
                        disabled={isReviewing} 
                        checked={selectedAnswers[qId]?.index === index} 
                        onChange={() => handleSelectOption(index)} 
                    />
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg mr-4 font-black text-sm transition-colors ${iconStyle}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-bold text-gray-700 text-sm leading-snug">{option}</span>
                    {badge}
                  </label>
                );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
          <div className="flex gap-3">
            <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-20 transition-all shadow-sm">
              <ChevronLeft size={22}/>
            </button>
            <button onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-20 transition-all shadow-sm">
              <ChevronRight size={22}/>
            </button>
          </div>

          {!isReviewing ? (
            <button onClick={handleSubmit} disabled={loading} className="bg-[#F26739] text-white px-12 py-3 rounded-xl font-black hover:bg-orange-600 shadow-lg uppercase flex items-center gap-2 text-sm transition-all disabled:opacity-70">
              {loading && <Loader2 className="animate-spin" size={18}/>}
              Nộp bài ngay
            </button>
          ) : (
            <button onClick={() => setIsReviewing(false)} className="bg-gray-900 text-white px-10 py-3 rounded-xl font-black uppercase text-sm shadow-md hover:bg-black transition-all">
              Thoát Xem Lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HocQuizz;