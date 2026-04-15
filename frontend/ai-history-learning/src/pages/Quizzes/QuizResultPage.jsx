import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDetail, setShowDetail] = useState(false);

  const { quiz, answers, score, total, questions, answered } = location.state ?? {};

  if (!quiz) {
    navigate("/teacher/quizzes");
    return null;
  }

  const isCompleted = answered > 0;                                          // ← MỚI
  const percent = answered === 0 ? 0 : Math.round((score / total) * 100);   // ← MỚI

  const getPercentColor = () => {
    if (!isCompleted) return "text-red-500";
    if (percent >= 80) return "text-green-500";
    if (percent >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Card tổng kết */}
      <div className="relative bg-gray-100 rounded-xl border border-gray-200 p-6 mb-4 text-center">

        {/* Badge trạng thái */}
        <span
          className={`absolute top-3 left-3 text-white text-xs px-3 py-1 rounded-full font-medium ${
            isCompleted ? "bg-green-500" : "bg-red-500"   // ← MỚI: đỏ khi không làm câu nào
          }`}
        >
          {isCompleted ? "Hoàn Thành" : "Không Hoàn Thành"}  {/* ← MỚI */}
        </span>

        <div className="text-5xl mb-2">👑</div>
        <p className="font-semibold text-gray-800 mb-1">{quiz.title}</p>
        <p className={`text-3xl font-bold ${getPercentColor()}`}>{percent} %</p>

        {/* Stat pills */}
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1.5 rounded-full">
            Hoàn thành {answered}/{total} câu   {/* ← MỚI: answered thay vì total */}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full">
            Đúng {score} câu
          </span>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1.5 rounded-full">
            Sai {answered - score} câu           {/* ← MỚI: answered - score */}
          </span>
        </div>
      </div>

      {/* Toggle chi tiết */}
      <button
        onClick={() => setShowDetail(!showDetail)}
        className="w-full border border-gray-300 rounded-lg py-2.5 text-sm text-gray-700 mb-4 hover:bg-gray-100"
      >
        {showDetail ? "Ẩn chi tiết ▲" : "Xem chi tiết đúng / sai ▼"}
      </button>

      {/* Chi tiết từng câu */}
      {showDetail && (
        <div className="flex flex-col gap-3 mb-4">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isAnswered = userAnswer !== undefined;
            const isCorrect = isAnswered && userAnswer === q.answer;

            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-medium text-gray-800">
                    Câu {i + 1}: {q.q}
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
                  if (isAnswer) {
                    cls += "border-green-300 bg-green-50 text-green-800";
                  } else if (isChosen) {
                    cls += "border-red-300 bg-red-50 text-red-700";
                  } else {
                    cls += "border-gray-100 text-gray-400";
                  }

                  return (
                    <div key={j} className={cls}>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isAnswer ? "bg-green-500" : isChosen ? "bg-red-400" : "bg-gray-300"
                        }`}
                      />
                      <span className="flex-1">{opt}</span>
                      {isAnswer && (
                        <span className="text-xs text-green-600 ml-auto">
                          ✓ Đáp án đúng{isChosen ? " · Bạn chọn" : ""}
                        </span>
                      )}
                      {isChosen && !isAnswer && (
                        <span className="text-xs text-red-500 ml-auto">✗ Bạn chọn</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => navigate("/teacher/quizzes")}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-sm font-medium"
      >
        Quay lại danh sách
      </button>
    </div>
  );
}