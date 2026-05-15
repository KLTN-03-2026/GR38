import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy, 
  AlertCircle,
  Loader2,
  HelpCircle,
  Hash
} from "lucide-react";
import api from "../../../lib/api";

const QuizResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Gọi API lấy chi tiết bài thi theo ID lịch sử
        const res = await api.get(`/quizzes/detail/${resultId}`);
        setData(res?.data?.data || res?.data);
      } catch (err) {
        setError("Không thể tải thông tin chi tiết bài làm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-4" />
        <p className="text-gray-500 font-medium">Đang truy xuất dữ liệu từ dòng thời gian...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <AlertCircle className="text-red-500 mb-4" size={64} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-500 mb-6">{error || "Dữ liệu không tồn tại hoặc đã bị xóa."}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-all"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Destructure dữ liệu từ API
  const { quizId, score, correctAnswers, totalQuestions, results = [] } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Sticky Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Quay lại lịch sử</span>
          </button>
          <div className="text-center">
            <h1 className="font-black text-gray-800 text-xs md:text-sm uppercase truncate max-w-[200px] md:max-w-md">
              {quizId?.title || "Kết quả bài thi"}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1 text-orange-500 font-black">
             <Trophy size={18} />
             <span>{score}đ</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        {/* Bảng thống kê tóm tắt */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-3">
              <Trophy size={28} />
            </div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Tổng điểm</span>
            <span className="text-2xl font-black text-gray-900">{score}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-3">
              <CheckCircle2 size={28} />
            </div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Đúng</span>
            <span className="text-2xl font-black text-gray-900">{correctAnswers}/{totalQuestions}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-3">
              <Clock size={28} />
            </div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Ngày làm</span>
            <span className="text-xs font-black text-gray-900 mt-2">{new Date(data.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Danh sách câu hỏi chi tiết */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-black text-gray-800 uppercase text-sm flex items-center gap-2">
              <HelpCircle size={20} className="text-orange-500" /> 
              Phân tích đáp án
            </h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {results.length} Câu hỏi
            </span>
          </div>
          
          {results.map((res, index) => {
            const isCorrectAnswer = res.selectedOption === res.questionId?.correctOption;

            return (
              <div key={index} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Chỉ báo đúng/sai bên góc */}
                <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase text-white ${isCorrectAnswer ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isCorrectAnswer ? "Chính xác" : "Chưa đúng"}
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                    {index + 1}
                  </span>
                  <p className="text-base font-bold text-gray-800 leading-snug pt-1">
                    {res.questionId?.questionText || "Nội dung câu hỏi đã bị thay đổi hoặc không tồn tại."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 ml-0 md:ml-12">
                  {res.questionId?.options?.map((option, optIdx) => {
                    const isUserChoice = res.selectedOption === optIdx;
                    const isCorrect = res.questionId?.correctOption === optIdx;
                    
                    let statusClass = "bg-gray-50 border-gray-200 text-gray-600";
                    let Icon = <Hash size={14} className="opacity-20" />;

                    if (isCorrect) {
                      statusClass = "bg-green-50 border-green-300 text-green-700 ring-2 ring-green-100";
                      Icon = <CheckCircle2 size={16} />;
                    } else if (isUserChoice && !isCorrect) {
                      statusClass = "bg-red-50 border-red-300 text-red-700";
                      Icon = <XCircle size={16} />;
                    }

                    return (
                      <div 
                        key={optIdx} 
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 text-sm font-bold transition-all ${statusClass}`}
                      >
                        <span>{option}</span>
                        {Icon}
                      </div>
                    );
                  })}
                </div>
                
                {/* Giải thích đáp án */}
                {res.questionId?.explanation && (
                  <div className="mt-6 ml-0 md:ml-12 p-4 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
                    <div className="flex items-center gap-2 mb-1 text-orange-600">
                       <AlertCircle size={14} />
                       <span className="text-[11px] font-black uppercase tracking-wider">Giải thích chuyên sâu</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {res.questionId.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-gray-400 hover:text-orange-500 font-bold text-xs uppercase transition-colors"
          >
            Cuộn lên đầu trang
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultDetail;