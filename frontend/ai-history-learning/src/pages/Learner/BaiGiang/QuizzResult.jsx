import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Eye, Home, CheckCircle, XCircle, Award, Info } from "lucide-react";
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
  const pct = apiDetail?.percent ?? (fTotal > 0 ? Math.round((fScore / fTotal) * 100) : 0);
  const totalPoints = fTotal > 0 ? ((fScore / fTotal) * 10).toFixed(1) : "0.0";
  const color = pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <RefreshCw className="animate-spin text-orange-500" size={32} />
    </div>
  );

  if (showReview) {
    return (
      <div className="p-4 bg-[#F8FAFC] min-h-screen">
        <div className="max-w-6xl mx-auto"> {/* Tăng max-width để chứa 2 cột */}
          <button onClick={() => setShowReview(false)} className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-orange-500 transition-colors">
            <ArrowLeft size={18} /> QUAY LẠI TỔNG QUAN
          </button>
          
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* CỘT TRÁI: CHI TIẾT CÂU HỎI */}
            <div className="flex-1 space-y-6 pb-10 w-full">
              {apiDetail?.questions?.map((q, idx) => (
                <div key={idx} id={`q-card-${idx}`} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm scroll-mt-6">
                  <div className="flex gap-4 mb-4">
                     <span className="bg-gray-100 text-gray-500 text-xs font-black w-8 h-8 flex items-center justify-center rounded-lg shrink-0">{idx + 1}</span>
                     <p className="font-bold text-gray-800">{q.question}</p>
                  </div>

                  <div className="grid gap-2 mb-4">
                    {q.options.map((opt, j) => {
                      const isCorrectAnswer = j === q.correctIdx;
                      const isUserChosen = j === q.userIdx;
                      
                      let style = "border-gray-100 bg-gray-50 text-gray-400";
                      if (isCorrectAnswer) style = "border-green-500 bg-green-50 text-green-700 font-bold";
                      else if (isUserChosen) style = "border-red-500 bg-red-50 text-red-700 font-bold";

                      return (
                        <div key={j} className={`p-4 rounded-xl border-2 flex justify-between items-center ${style}`}>
                          <span className="text-sm">{opt}</span>
                          {isCorrectAnswer && <CheckCircle size={16} className="text-green-500" />}
                          {isUserChosen && !isCorrectAnswer && <XCircle size={16} className="text-red-500" />}
                        </div>
                      );
                    })}
                  </div>

                  {(q.explanation || q.note) && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                      <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Giải thích đáp án:</p>
                        <p className="text-sm text-blue-800 leading-relaxed italic">
                          {q.explanation || q.note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CỘT PHẢI: BẢN ĐỒ CÂU HỎI (Sticky) */}
            <div className="w-full lg:w-72 sticky top-6">
              <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                <h3 className="text-center font-black text-gray-800 text-sm mb-4 uppercase tracking-widest">Bản đồ câu hỏi</h3>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {apiDetail?.questions?.map((q, idx) => {
                    const isUnanswered = q.userIdx === -1;
                    const isCorrect = q.isCorrect;
                    
                    let bgStyle = "bg-[#47ED70] text-white"; // Mặc định Đúng: Xanh lá
                    if (isUnanswered) bgStyle = "bg-[#FACC15] text-white"; // Chưa chọn: Vàng
                    else if (!isCorrect) bgStyle = "bg-[#EF4444] text-white"; // Sai: Đỏ

                    return (
                      <button
                        key={idx}
                        onClick={() => scrollToQuestion(idx)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-transform active:scale-90 ${bgStyle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#47ED70]"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Đúng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Sai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FACC15]"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Chưa chọn</span>
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-8 text-center border border-gray-50">
        <div className="mb-6 bg-slate-50 py-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: color }}></div>
          <div className="flex flex-col items-center justify-center">
              <div className="text-6xl font-black mb-1" style={{ color: color }}>{totalPoints}</div>
              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tổng điểm (Hệ 10)</div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
            <Award size={14} style={{ color: color }} />
            <span className="text-sm font-black" style={{ color: color }}>{pct}% Chính xác</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
            <div className="text-2xl font-black text-green-600">{fScore}</div>
            <div className="text-[10px] text-green-600 font-bold uppercase">Câu Đúng</div>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <div className="text-2xl font-black text-red-600">{fWrong}</div>
            <div className="text-[10px] text-red-600 font-bold uppercase">Câu Sai</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="text-2xl font-black text-gray-800">{fTotal}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase">Tổng câu</div>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => setShowReview(true)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all">
            <Eye size={20} /> XEM CHI TIẾT BÀI LÀM
          </button>
          <div className="flex gap-3">
            <button onClick={onRetry} className="flex-1 py-4 bg-[#f26739] text-white rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
              <RefreshCw size={18} /> LÀM LẠI
            </button>
            <button onClick={onBack} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black flex items-center justify-center gap-2">
              <Home size={18} /> THOÁT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizzResult;