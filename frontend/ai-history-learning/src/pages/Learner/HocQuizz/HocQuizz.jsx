import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, CheckCircle, Loader2 } from "lucide-react";
import axiosClient from "../../../lib/axios";

const HocQuizz = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [savedAnswers, setSavedAnswers] = useState({});    
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [scoreData, setScoreData] = useState({ score: 0, correct: 0, total: 0 });

  useEffect(() => {
    const fetchQuizDetail = async () => {
      try {
        setLoading(true);
        // Endpoint: /quizzes/quiz/{id}
        const res = await axiosClient.get(`/quizzes/quiz/${id}`); 
        if (res.success && res.data) {
          setQuizInfo(res.data);
          setQuestions(res.data.questions || []);
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết bài quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuizDetail();
  }, [id]);

  const handleSelectOption = (optionIndex) => {
    const currentQ = questions[currentQuestionIndex];
    setSelectedAnswers({ ...selectedAnswers, [currentQ._id]: optionIndex });
  };

  const handleSave = () => {
    const currentQ = questions[currentQuestionIndex];
    const optionIndex = selectedAnswers[currentQ._id];
    
    if (optionIndex !== undefined) {
      const answerText = currentQ.options[optionIndex];
      setSavedAnswers({ ...savedAnswers, [currentQ._id]: answerText });
      setSaveMessage("Đã lưu!");
      setTimeout(() => setSaveMessage(""), 1500);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userAnswers = Object.keys(savedAnswers).map(qId => ({
        questionId: qId,
        selectedAnswer: savedAnswers[qId]
      }));

      const res = await axiosClient.post(`/quizzes/${id}/submit`, {
        userAnswers: userAnswers,
        answers: userAnswers 
      });

      if (res.success) {
        setScoreData({
          score: res.data.score,
          correct: res.data.correctCount,
          total: res.data.totalQuestions,
        });
        setIsFinished(true);
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      alert("Nộp bài thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isFinished) return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
    </div>
  );

  if (isFinished) {
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border p-12 text-center mt-10">
          <div className="bg-green-500 text-white px-8 py-2 rounded-full inline-block text-xl font-bold mb-6">Kết Quả</div>
          <div className="text-8xl font-black text-gray-900 mb-6">{scoreData.score}%</div>
          <div className="flex justify-center gap-6 mb-10">
            <div className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-bold">Tổng: {scoreData.total} câu</div>
            <div className="bg-green-100 text-green-700 px-6 py-3 rounded-lg font-bold">Đúng: {scoreData.correct} câu</div>
          </div>
          <button onClick={() => navigate("/learner/quizzes")} className="bg-orange-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-600">Quay về danh sách</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
      {/* Header */}
      <div className="w-full max-w-6xl bg-white border rounded-xl flex items-center px-4 h-14 mb-5 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-gray-700">
          <ArrowLeft size={20} /> Trở về
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-xl p-8 shadow-sm border">
        <h2 className="text-xl font-bold mb-8 text-blue-700 uppercase">{quizInfo?.title}</h2>

        {/* Question Area */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative min-h-[350px]">
          <div className="flex justify-between items-start mb-6">
            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold">CÂU {currentQuestionIndex + 1}</span>
            <div className="flex items-center gap-4">
              {saveMessage && <span className="text-green-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={16}/>{saveMessage}</span>}
              <button onClick={handleSave} className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-50">
                <Save size={18}/> Lưu câu trả lời
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-8">{currentQuestion?.question}</h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options.map((option, index) => (
              <label 
                key={index} 
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAnswers[currentQuestion._id] === index ? "border-blue-600 bg-blue-50" : "border-white bg-white hover:border-gray-200"
                }`}
              >
                <input 
                  type="radio" 
                  className="hidden" 
                  checked={selectedAnswers[currentQuestion._id] === index} 
                  onChange={() => handleSelectOption(index)} 
                />
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg mr-4 font-bold ${
                  selectedAnswers[currentQuestion._id] === index ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between border-t pt-8">
          <div className="text-gray-400 font-medium">Câu {currentQuestionIndex + 1} trên {questions.length}</div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft size={24}/>
            </button>
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight size={24}/>
            </button>
          </div>

          <button 
            onClick={handleSubmit}
            className="bg-orange-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md active:scale-95"
          >
            NỘP BÀI
          </button>
        </div>
      </div>
    </div>
  );
};

export default HocQuizz;