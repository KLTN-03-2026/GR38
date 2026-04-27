import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, AlertCircle, Eye, CheckCircle2, XCircle } from "lucide-react";
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

  // Hàm so sánh chuỗi chuẩn hóa để tránh lỗi khoảng trắng hoặc viết hoa/thường
  const isSameAnswer = (ans1, ans2) => {
    if (ans1 === undefined || ans2 === undefined || ans1 === null || ans2 === null) return false;
    return String(ans1).trim().toLowerCase() === String(ans2).trim().toLowerCase();
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount === 0) return alert("Vui lòng chọn ít nhất 1 đáp án!");

    try {
      setLoading(true);
      const userAnswers = Object.keys(selectedAnswers).map(qId => ({
        questionId: qId,
        selectedAnswer: selectedAnswers[qId].text
      }));

      const res = await api.post(`/quizzes/${id}/submit`, { userAnswers });
      const result = res?.data?.data || res?.data || res;

      if (result) {
        const total = questions.length;
        let calculatedCorrect = 0;
        const corrects = {};

        // Duyệt qua kết quả từ server để map đáp án đúng và tự đếm lại số câu đúng
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
          score: result.score || 0,
          // Nếu backend trả về 0 câu đúng nhưng score > 0, ưu tiên số câu tự đếm được
          correct: (result.correctCount || result.correct) || calculatedCorrect,
          total: result.totalQuestions || total,
        });

        setCorrectAnswers(corrects);
        setIsFinished(true);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Lỗi nộp bài!");
    } finally {
      setLoading(false);
    }
  };

  if (isFinished && !isReviewing) {
    const wrongCount = scoreData.total - scoreData.correct;
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border p-12 text-center mt-10">
          <div className="bg-green-500 text-white px-8 py-2 rounded-full inline-block text-xl font-bold mb-6">HOÀN THÀNH</div>
          <div className="text-8xl font-black text-gray-900 mb-2">{Math.round(scoreData.score)}%</div>
          <p className="text-gray-500 mb-10 font-medium italic">Kết quả bài làm của bạn</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
              <p className="text-blue-600 text-xs font-bold uppercase mb-2">Tổng số câu</p>
              <p className="text-4xl font-black">{scoreData.total}</p>
            </div>
            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl">
              <p className="text-green-600 text-xs font-bold uppercase mb-2">Câu đúng</p>
              <p className="text-4xl font-black">{scoreData.correct}</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
              <p className="text-red-600 text-xs font-bold uppercase mb-2">Câu sai</p>
              <p className="text-4xl font-black">{wrongCount < 0 ? 0 : wrongCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => setIsReviewing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all">
              <Eye size={20}/> Xem đáp án chi tiết
            </button>
            <button onClick={() => window.location.reload()} className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all">Làm lại</button>
            <button onClick={() => navigate("/learner/quizzes")} className="bg-gray-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all">Quay về</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
      <div className="w-full max-w-6xl bg-white border rounded-xl flex items-center justify-between px-6 h-16 mb-5 shadow-sm">
        <button onClick={() => isReviewing ? setIsReviewing(false) : navigate(-1)} className="flex items-center gap-2 font-bold text-gray-700 hover:text-orange-500">
          <ArrowLeft size={20} /> {isReviewing ? "Quay lại kết quả" : "Thoát"}
        </button>
        <p className="font-black text-blue-700 uppercase">{quizInfo?.title}</p>
        {isReviewing && <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold">XEM LẠI</span>}
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl p-8 shadow-sm border">
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 min-h-[400px]">
          <div className="mb-6">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-10">
            {currentQuestion?.question}
          </h3>

          <div className="grid grid-cols-1 gap-4">
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
                    containerStyle = "border-green-500 bg-green-50 shadow-sm";
                    iconStyle = "bg-green-500 text-white";
                    showBadge = <CheckCircle2 className="ml-auto text-green-600" size={24}/>;
                    
                    // Nếu là đáp án đúng nhưng người dùng không chọn -> Hiện màu vàng gợi ý
                    if (!isThisUserChoice) {
                      containerStyle = "border-yellow-500 bg-yellow-50 shadow-sm";
                      iconStyle = "bg-yellow-500 text-white";
                      showBadge = <span className="ml-auto text-yellow-700 text-xs font-bold uppercase">Đáp án đúng</span>;
                    }
                  } else if (isThisUserChoice) {
                    containerStyle = "border-red-500 bg-red-50";
                    iconStyle = "bg-red-500 text-white";
                    showBadge = <XCircle className="ml-auto text-red-600" size={24}/>;
                  }
                } else {
                  if (userChoice?.index === index) {
                    containerStyle = "border-blue-600 bg-blue-50 ring-2 ring-blue-100";
                    iconStyle = "bg-blue-600 text-white";
                  }
                }

                return (
                  <label key={index} className={`flex items-center p-5 rounded-2xl border-2 transition-all ${!isReviewing && "cursor-pointer active:scale-[0.98]"} ${containerStyle}`}>
                    <input type="radio" className="hidden" disabled={isReviewing} checked={userChoice?.index === index} onChange={() => handleSelectOption(index)} />
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl mr-4 font-black ${iconStyle}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-bold text-gray-700 text-lg">{option}</span>
                    {showBadge}
                  </label>
                );
            })}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t pt-8">
          <div className="flex gap-4">
            <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="p-3 border-2 rounded-xl disabled:opacity-20">
              <ChevronLeft size={28}/>
            </button>
            <button onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="p-3 border-2 rounded-xl disabled:opacity-20">
              <ChevronRight size={28}/>
            </button>
          </div>

          {!isReviewing ? (
            <button onClick={handleSubmit} className="bg-[#F26739] text-white px-12 py-4 rounded-2xl font-black hover:bg-orange-600 shadow-lg uppercase">
              Nộp bài
            </button>
          ) : (
            <button onClick={() => setIsReviewing(false)} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase">
              Xong
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HocQuizz;