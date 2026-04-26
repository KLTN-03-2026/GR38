import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizService } from "../../../services/quizService";

export default function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDetail, setShowDetail] = useState(false);

  // Data từ QuizPage (local calculation)
  const {
    quiz,
    answers,
    score,
    total,
    questions: localQuestions,
    answered,
    resultId, // có nếu submit API thành công
    documentId,
  } = location.state ?? {};

  // State cho chi tiết từ API (GET /quizzes/detail/{resultId})
  const [apiDetail, setApiDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Dùng câu hỏi từ API nếu có, fallback về local
  const questions = apiDetail?.questions ?? localQuestions ?? [];

  // ── Fetch chi tiết kết quả từ API nếu có resultId ────────────────────────
  useEffect(() => {
    if (!resultId) return;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await quizService.getResult(resultId);
        const raw = res.data?.data ?? res.data;

        // Normalize câu hỏi từ API detail
        const apiQs = (raw?.questions ?? raw?.answers ?? []).map((q) => ({
          _id: q._id ?? q.questionId,
          question: q.question ?? q.q,
          options: q.options ?? [],
          answer: q.correctAnswer ?? q.answer,
          // Đáp án user chọn từ API (nếu có)
          userAnswer: q.userAnswer ?? q.selectedAnswer ?? null,
        }));

        setApiDetail({
          score: raw?.score ?? raw?.correctAnswers ?? score,
          total: raw?.total ?? raw?.totalQuestions ?? total,
          answered: raw?.answered ?? answered,
          percent: raw?.percent ?? raw?.percentage ?? null,
          questions: apiQs.length > 0 ? apiQs : null,
          status: raw?.status,
        });
      } catch (err) {
        console.warn("Không lấy được chi tiết kết quả từ API:", err.message);
        // Fallback: dùng data local, không hiển thị lỗi với user
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [resultId]);

  if (!quiz) {
    navigate(-1);
    return null;
  }

  const finalScore = apiDetail?.score ?? score ?? 0;
  const finalTotal = apiDetail?.total ?? total ?? 0;
  const finalAnswered = apiDetail?.answered ?? answered ?? 0;
  const isCompleted = finalAnswered > 0;
  const percent =
    apiDetail?.percent != null
      ? Math.round(apiDetail.percent)
      : finalAnswered === 0
        ? 0
        : Math.round((finalScore / finalTotal) * 100);

  const getPercentColor = () => {
    if (!isCompleted) return "text-red-500";
    if (percent >= 80) return "text-green-500";
    if (percent >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  // Build answers map — ưu tiên từ API detail nếu có userAnswer
  const answersMap = (() => {
    if (apiDetail?.questions) {
      return apiDetail.questions.reduce((acc, q, i) => {
        if (q.userAnswer !== null && q.userAnswer !== undefined)
          acc[i] = q.userAnswer;
        return acc;
      }, {});
    }
    return answers ?? {};
  })();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Loading overlay khi đang fetch detail */}
      {loadingDetail && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 justify-center">
          <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Đang tải chi tiết kết quả...
        </div>
      )}

      {/* Card tổng kết */}
      <div className="relative bg-gray-100 rounded-xl border border-gray-200 p-6 mb-4 text-center">
        <span
          className={`absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full font-medium ${isCompleted ? "bg-green-500" : "bg-red-500"}`}
        >
          {isCompleted ? "Hoàn Thành" : "Không Hoàn Thành"}
        </span>

        {/* Badge resultId nếu có */}
        {resultId && (
          <span className="absolute top-3 right-3 text-gray-400 text-[10px] font-mono bg-white border border-gray-200 px-2 py-1 rounded-lg">
            ID: {String(resultId).slice(-6)}
          </span>
        )}

        <div className="text-5xl mb-2">👑</div>
        <p className="font-semibold text-gray-800 mb-1">{quiz.title}</p>
        <p className={`text-3xl font-bold ${getPercentColor()}`}>{percent} %</p>

        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1.5 rounded-full">
            Hoàn thành {finalAnswered}/{finalTotal} câu
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full">
            Đúng {finalScore} câu
          </span>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1.5 rounded-full">
            Sai {finalAnswered - finalScore} câu
          </span>
        </div>
      </div>

      {/* Toggle chi tiết */}
      <button
        onClick={() => setShowDetail(!showDetail)}
        disabled={loadingDetail}
        className="w-full border border-gray-300 rounded-lg py-2.5 text-sm text-gray-700 mb-4 hover:bg-gray-100 disabled:opacity-50 transition"
      >
        {loadingDetail
          ? "Đang tải chi tiết..."
          : showDetail
            ? "Ẩn chi tiết ▲"
            : "Xem chi tiết đúng / sai ▼"}
      </button>

      {/* Chi tiết từng câu */}
      {showDetail && (
        <div className="flex flex-col gap-3 mb-4">
          {questions.map((q, i) => {
            const userAnswer = answersMap[i];
            const isAnswered = userAnswer !== undefined && userAnswer !== null;
            const isCorrect = isAnswered && userAnswer === q.answer;

            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-medium text-gray-800">
                    Câu {i + 1}: {q.question ?? q.q}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full shrink-0 font-medium ${
                      !isAnswered
                        ? "bg-gray-100 text-gray-500"
                        : isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {!isAnswered ? "Chưa làm" : isCorrect ? "Đúng" : "Sai"}
                  </span>
                </div>

                {q.options.map((opt, j) => {
                  const isAnswer = j === q.answer;
                  const isChosen = j === userAnswer;

                  let cls =
                    "flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm mb-1.5 border ";
                  if (isAnswer)
                    cls += "border-green-300 bg-green-50 text-green-800";
                  else if (isChosen)
                    cls += "border-red-300 bg-red-50 text-red-700";
                  else cls += "border-gray-100 text-gray-400";

                  return (
                    <div key={j} className={cls}>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${isAnswer ? "bg-green-500" : isChosen ? "bg-red-400" : "bg-gray-300"}`}
                      />
                      <span className="flex-1">{opt}</span>
                      {isAnswer && (
                        <span className="text-xs text-green-600 ml-auto">
                          ✓ Đáp án đúng{isChosen ? " · Bạn chọn" : ""}
                        </span>
                      )}
                      {isChosen && !isAnswer && (
                        <span className="text-xs text-red-500 ml-auto">
                          ✗ Bạn chọn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Quay lại */}
      <button
        onClick={() => {
          if (documentId) {
            navigate(`/teacher/documents/${documentId}`, {
              state: { activeTab: "Quizz" },
            });
          } else {
            navigate(-1);
          }
        }}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-sm font-medium transition"
      >
        Quay lại danh sách
      </button>
    </div>
  );
}
