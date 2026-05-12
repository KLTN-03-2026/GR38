import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Eye, Home, CheckCircle, XCircle, Info, ClipboardCheck, X } from "lucide-react";
import api from "../../../lib/api";

const QuizzResult = ({ result, onRetry, onBack }) => {
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
  const [apiDetail, setApiDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const resultId = result?.resultId;

  useEffect(() => {
    if (!resultId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/detail/${resultId}`);
        const raw = res.data?.data ?? res.data;

        const fullQuestions = raw?.quizId?.questions || [];
        const processedQs = fullQuestions.map((q) => {
          const correctIdx = q.options.findIndex((opt) => opt === q.correctAnswer);
          
          let userIdx = -1;
          if (raw?.answers) {
            const ansInfo = raw.answers.find((a) => String(a.questionId) === String(q._id));
            if (ansInfo) {
              userIdx = q.options.findIndex((opt) => opt === ansInfo.selectedAnswer);
            }
          }
          
          return { 
            ...q, 
            correctIdx, 
            userIdx,
            isCorrect: correctIdx === userIdx && userIdx !== -1 
          };
        });

        setApiDetail({
          score: raw?.correctAnswersCount ?? 0,
          total: raw?.totalQuestions ?? 0,
          questions: processedQs,
          percent: raw?.percent || 0
        });
      } catch (err) {
        console.error("Lỗi lấy chi tiết kết quả:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [resultId]);

  const scrollToQuestion = (index) => {
    const el = document.getElementById(`q-card-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const fScore = apiDetail?.score ?? result?.score ?? 0;
  const fTotal = apiDetail?.total ?? result?.total ?? 0;
  const fWrong = Math.max(0, fTotal - fScore);
  
  // SỬA Ở ĐÂY: Luôn ép UI tự tính toán % dựa trên số câu đúng và tổng số câu để tránh lỗi API trả về 0
  const pct = fTotal > 0 ? Math.round((fScore / fTotal) * 100) : 0;
  
  // Màu sắc theo %
  const color = pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
  
  // Sửa lỗi UI 0%: Nếu pct = 0, cho một giá trị cực nhỏ (0.1) để vòng tròn màu đỏ vẫn hiển thị viền
  const strokeValue = pct === 0 ? 0.1 : pct;
  const strokeDasharray = `${strokeValue}, 100`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <RefreshCw className="animate-spin text-orange-500" size={32} />
    </div>
  );

  if (showReview) {
    return (
      <div className="p-4 bg-[#F8FAFC] min-h-screen">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setShowReview(false)} className="flex items-center gap-2 text-gray-500 font-bold mb-4 hover:text-orange-500 transition-colors uppercase text-[12px]">
            <ArrowLeft size={16} /> Quay lại tổng quan
          </button>
          
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 space-y-4 pb-10 w-full">
              {apiDetail?.questions?.map((q, idx) => (
                <div key={idx} id={`q-card-${idx}`} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm scroll-mt-6">
                  <div className="flex gap-3 mb-3">
                     <span className="bg-orange-50 text-orange-500 text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-lg shrink-0">{idx + 1}</span>
                     <p className="font-bold text-gray-800 text-sm leading-relaxed">{q.question}</p>
                  </div>
                  <div className="grid gap-2 mb-3">
                    {q.options.map((opt, j) => {
                      const isCorrectAnswer = j === q.correctIdx;
                      const isUserChosen = j === q.userIdx;
                      let style = "border-gray-50 bg-white text-gray-500";
                      if (isCorrectAnswer) style = "border-green-500 bg-green-50 text-green-700 font-bold";
                      else if (isUserChosen) style = "border-red-500 bg-red-50 text-red-700 font-bold";
                      return (
                        <div key={j} className={`p-3 rounded-xl border-2 flex justify-between items-center text-xs ${style}`}>
                          <span>{opt}</span>
                          <div className="flex items-center">
                            {isCorrectAnswer && <CheckCircle size={16} className="text-green-500" />}
                            {isUserChosen && !isCorrectAnswer && <XCircle size={16} className="text-red-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(q.explanation || q.note) && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                      <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-blue-800 italic leading-snug">{q.explanation || q.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="w-full lg:w-72 sticky top-6">
              <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-lg">
                <h3 className="text-center font-black text-gray-800 text-[11px] mb-4 uppercase tracking-widest">Bản đồ câu hỏi</h3>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {apiDetail?.questions?.map((q, idx) => {
                    const isUnanswered = q.userIdx === -1;
                    const isCorrect = q.isCorrect;
                    let bgStyle = "bg-green-500 shadow-green-100"; 
                    if (isUnanswered) bgStyle = "bg-yellow-400 shadow-yellow-100"; 
                    else if (!isCorrect) bgStyle = "bg-red-500 shadow-red-100";
                    return (
                      <button key={idx} onClick={() => scrollToQuestion(idx)} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-md transition-all active:scale-90 ${bgStyle}`}>
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Đúng</div>
                    <span className="text-green-600">{fScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Sai</div>
                    <span className="text-red-600">{fWrong}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 text-center border border-white relative z-10">
        <div className="mb-6 flex justify-center">
            <div className={`${pct < 50 ? 'bg-red-500 shadow-red-100' : 'bg-[#10B981] shadow-green-100'} text-white px-4 py-1 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                {pct < 50 ? 'CẦN CỐ GẮNG' : 'HOÀN THÀNH'}
            </div>
        </div>

        <div className="relative flex justify-center mb-6">
            <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="2.5" />
                <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    style={{ stroke: color }} 
                    strokeWidth="2.5" 
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-800 tracking-tighter">{pct}</span>
                <span className="text-sm font-bold text-gray-400 -mt-1">%</span>
            </div>
        </div>

        <div className="mb-8">
            <h2 className="text-xl font-black text-gray-800 mb-1">
              {pct >= 80 ? "Xuất sắc quá!" : pct >= 50 ? "Làm tốt lắm!" : "Cần cố gắng thêm!"}
            </h2>
            <p className="text-[12px] text-gray-400">
              {pct >= 50 ? "Bạn đã vượt qua bài kiểm tra rồi 🎉" : "Xem lại bài và thử lại bạn nhé 🔄"}
            </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50/50 p-4 rounded-[24px] border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm mb-1.5">
                <ClipboardCheck size={16} className="text-gray-400" />
            </div>
            <div className="text-lg font-black text-gray-800">{fTotal}</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Tổng câu</div>
          </div>
          
          <div className="bg-green-50/50 p-4 rounded-[24px] border border-green-100 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm mb-1.5">
                <CheckCircle size={16} className="text-green-500" />
            </div>
            <div className="text-lg font-black text-green-600">{fScore}</div>
            <div className="text-[9px] text-green-600 font-bold uppercase tracking-tight">Câu Đúng</div>
          </div>

          <div className="bg-red-50/50 p-4 rounded-[24px] border border-red-100 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm mb-1.5">
                <X size={16} className="text-red-500" />
            </div>
            <div className="text-lg font-black text-red-600">{fWrong}</div>
            <div className="text-[9px] text-red-600 font-bold uppercase tracking-tight">Câu Sai</div>
          </div>
        </div>

        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[3px] mb-6">Quiz ôn tập</p>

        <div className="space-y-3">
          <button 
            onClick={() => setShowReview(true)} 
            className="w-full py-3.5 bg-white text-gray-700 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
          >
            <Eye size={16} /> Xem chi tiết đúng / sai <span className="ml-1 opacity-40">({fTotal})</span>
          </button>
          
          <button 
            onClick={onBack} 
            className="w-full py-4 bg-[#f26739] text-white rounded-2xl font-black text-[13px] uppercase tracking-wide shadow-lg shadow-orange-100 active:scale-95 transition-all"
          >
            Quay lại danh sách
          </button>

          <div className="flex justify-center gap-6 pt-2">
            <button onClick={onRetry} className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1.5 hover:opacity-70 transition-all">
                <RefreshCw size={12} /> Làm lại
            </button>
            <button onClick={onBack} className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5 hover:opacity-70 transition-all">
                <Home size={12} /> Thoát
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// Quizz 
export default QuizzResult;