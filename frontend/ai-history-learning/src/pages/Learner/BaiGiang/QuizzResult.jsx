import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw, Eye, Home, CheckCircle, XCircle } from "lucide-react";
import { quizService } from "../../../services/quizService";

const QuizzResult = ({ result, onRetry, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showReview, setShowReview] = useState(false);
  const [apiDetail, setApiDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const resultId = result?.resultId || location.state?.resultId;

  useEffect(() => {
    if (!resultId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await quizService.getQuizResultDetail(resultId);
        const raw = res.data?.data ?? res.data;

        // ĐỒNG BỘ: Logic xử lý map câu hỏi của file tham khảo
        const fullQuestions = raw?.quizId?.questions || [];
        const processedQs = fullQuestions.map((q) => {
          // Tìm index đáp án đúng
          const correctIdx = q.options.findIndex((opt) => opt === q.correctAnswer);
          
          // Tìm index đáp án người dùng chọn
          let userIdx = null;
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
          score: raw?.correctAnswersCount ?? result?.score,
          total: raw?.totalQuestions ?? result?.total,
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
  }, [resultId, result]);

  const fScore = apiDetail?.score ?? 0;
  const fTotal = apiDetail?.total ?? 0;
  const fWrong = Math.max(0, fTotal - fScore);
  const pct = apiDetail?.percent ?? (fTotal > 0 ? Math.round((fScore / fTotal) * 100) : 0);
  const color = pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <RefreshCw className="animate-spin text-orange-500" size={32} />
    </div>
  );

  if (showReview) {
    return (
      <div className="p-4 bg-[#F8FAFC] min-h-screen">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setShowReview(false)} className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-orange-500">
            <ArrowLeft size={18} /> QUAY LẠI
          </button>
          
          <div className="space-y-6">
            {apiDetail?.questions?.map((q, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex gap-4 mb-4">
                   <span className="bg-gray-100 text-gray-500 text-xs font-black w-8 h-8 flex items-center justify-center rounded-lg shrink-0">{idx + 1}</span>
                   <p className="font-bold text-gray-800">{q.question}</p>
                </div>

                <div className="grid gap-2">
                  {q.options.map((opt, j) => {
                    const isAnswer = j === q.correctIdx;
                    const isChosen = j === q.userIdx;
                    
                    let style = "border-gray-100 bg-gray-50 text-gray-400";
                    if (isAnswer) style = "border-green-500 bg-green-50 text-green-700 font-bold";
                    else if (isChosen) style = "border-red-500 bg-red-50 text-red-700 font-bold";

                    return (
                      <div key={j} className={`p-4 rounded-xl border-2 flex justify-between items-center ${style}`}>
                        <span className="text-sm">{opt}</span>
                        {isAnswer && isChosen && <CheckCircle size={16} className="text-green-500" />}
                        {isChosen && !isAnswer && <XCircle size={16} className="text-red-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
          <div className="text-5xl font-black mb-2" style={{ color: color }}>{pct}%</div>
          <div className="text-gray-400 font-bold uppercase text-xs tracking-widest">Độ chính xác</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
            <div className="text-2xl font-black text-green-600">{fScore}</div>
            <div className="text-[10px] text-green-600 font-bold uppercase">Đúng</div>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <div className="text-2xl font-black text-red-600">{fWrong}</div>
            <div className="text-[10px] text-red-600 font-bold uppercase">Sai</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="text-2xl font-black text-gray-800">{fTotal}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase">Tổng</div>
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
            <button onClick={onBack || (() => navigate("/"))} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black flex items-center justify-center gap-2">
              <Home size={18} /> THOÁT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizzResult;