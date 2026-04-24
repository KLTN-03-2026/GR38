import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, CheckCircle, Loader2, AlertCircle } from "lucide-react";
// Sử dụng cấu hình api chung để tự động xử lý token
import api from "../../../lib/api"; 

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
  const [error, setError] = useState(null);

  // 1. Lấy chi tiết bài Quiz từ Server
  useEffect(() => {
    const fetchQuizDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/quiz/${id}`); 
        
        // Bóc tách dữ liệu linh hoạt theo cấu trúc Backend
        const quizData = res?.data?.data || res?.data || res;
        
        if (quizData && quizData.questions) {
          setQuizInfo(quizData);
          setQuestions(quizData.questions);
        } else {
          setError("Không tìm thấy dữ liệu câu hỏi.");
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết bài quiz:", err);
        setError("Lỗi kết nối máy chủ hoặc bài quiz không tồn tại.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetail();
  }, [id]);

  // 2. Xử lý chọn đáp án (Tạm thời)
  const handleSelectOption = (optionIndex) => {
    const currentQ = questions[currentQuestionIndex];
    setSelectedAnswers({ ...selectedAnswers, [currentQ._id]: optionIndex });
  };

  // 3. Lưu đáp án vào danh sách chờ nộp
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

  // 4. Nộp bài và nhận kết quả
  const handleSubmit = async () => {
    if (Object.keys(savedAnswers).length < questions.length) {
      if (!window.confirm("Bạn chưa lưu hết câu trả lời, vẫn muốn nộp bài chứ?")) return;
    }

    try {
      setLoading(true);
      const userAnswers = Object.keys(savedAnswers).map(qId => ({
        questionId: qId,
        selectedAnswer: savedAnswers[qId]
      }));

      const res = await api.post(`/quizzes/${id}/submit`, { userAnswers });

      const result = res?.data?.data || res?.data || res;
      if (res?.data?.success || res?.success) {
        setScoreData({
          score: result.score,
          correct: result.correctCount || result.correct || 0,
          total: result.totalQuestions || questions.length,
        });
        setIsFinished(true);
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      alert("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Giao diện Lỗi
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA]">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <p className="text-gray-600 font-bold mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-gray-200 px-6 py-2 rounded-lg font-bold">Quay lại</button>
      </div>
    );
  }

  // Giao diện Đang tải
  if (loading && !isFinished) return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      <p className="text-gray-500 font-medium animate-pulse">Đang chuẩn bị đề bài...</p>
    </div>
  );

  // Giao diện KẾT QUẢ sau khi nộp bài
  if (isFinished) {
    const wrongCount = scoreData.total - scoreData.correct;

    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border p-12 text-center mt-10">
          <div className="bg-green-500 text-white px-8 py-2 rounded-full inline-block text-xl font-bold mb-6">HOÀN THÀNH</div>
          <div className="text-8xl font-black text-gray-900 mb-2">{scoreData.score}%</div>
          <p className="text-gray-500 mb-10 font-medium italic">Điểm số của bạn</p>

          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {/* Tổng số câu */}
            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-8 py-4 rounded-2xl min-w-[160px]">
              <p className="text-sm uppercase font-bold opacity-70 mb-1">Tổng số câu</p>
              <p className="text-3xl font-black">{scoreData.total}</p>
            </div>

            {/* Số câu đúng */}
            <div className="bg-green-50 border border-green-100 text-green-700 px-8 py-4 rounded-2xl min-w-[160px]">
              <p className="text-sm uppercase font-bold opacity-70 mb-1">Câu đúng</p>
              <p className="text-3xl font-black">{scoreData.correct}</p>
            </div>

            {/* Số câu sai */}
            <div className="bg-red-50 border border-red-100 text-red-700 px-8 py-4 rounded-2xl min-w-[160px]">
              <p className="text-sm uppercase font-bold opacity-70 mb-1">Câu sai</p>
              <p className="text-3xl font-black">{wrongCount >= 0 ? wrongCount : 0}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="bg-white border-2 border-gray-200 text-gray-700 px-10 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">Làm lại</button>
            <button onClick={() => navigate("/learner/quizzes")} className="bg-[#F26739] text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg">Quay về danh sách</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFA] p-5">
      {/* Header Điều hướng */}
      <div className="w-full max-w-6xl bg-white border rounded-xl flex items-center px-4 h-14 mb-5 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-gray-700 hover:text-orange-500 transition-colors">
          <ArrowLeft size={20} /> Trở về
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-xl p-8 shadow-sm border">
        <h2 className="text-xl font-bold mb-8 text-blue-700 uppercase tracking-tight">{quizInfo?.title}</h2>

        {/* Khu vực Câu hỏi */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative min-h-[350px]">
          <div className="flex justify-between items-start mb-6">
            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Câu {currentQuestionIndex + 1}
            </span>
            <div className="flex items-center gap-4">
              {saveMessage && <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-bounce"><CheckCircle size={16}/>{saveMessage}</span>}
              <button onClick={handleSave} className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm">
                <Save size={18}/> Lưu đáp án
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion?.question}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion._id] === index;
                return (
                  <label 
                    key={index} 
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? "border-blue-600 bg-blue-50 shadow-md" : "border-white bg-white hover:border-gray-200"
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={isSelected} 
                      onChange={() => handleSelectOption(index)} 
                    />
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg mr-4 font-bold ${
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium text-gray-700">{option}</span>
                  </label>
                );
            })}
          </div>
        </div>

        {/* Thanh Điều hướng Câu hỏi & Nộp bài */}
        <div className="mt-10 flex items-center justify-between border-t pt-8">
          <div className="text-gray-400 font-bold uppercase text-sm tracking-widest">
            Câu {currentQuestionIndex + 1} / {questions.length}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-20 transition-all shadow-sm"
            >
              <ChevronLeft size={24}/>
            </button>
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-20 transition-all shadow-sm"
            >
              <ChevronRight size={24}/>
            </button>
          </div>

          <button 
            onClick={handleSubmit}
            className="bg-[#F26739] text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
          >
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  );
};

export default HocQuizz;