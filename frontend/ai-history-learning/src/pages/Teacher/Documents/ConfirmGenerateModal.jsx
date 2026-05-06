import { useState } from "react";
import { IconQuiz, IconCards } from "./icons";


export default function ConfirmGenerateModal({ type, onConfirm, onCancel, loading }) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const isQuiz = type === "quiz";

  const handleConfirm = () => {
    onConfirm({
      count: numQuestions,
      title: title.trim(),
      timeLimit: isQuiz ? timeLimit : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[380px] p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full ${isQuiz ? "bg-orange-50 border border-orange-100" : "bg-purple-50 border border-purple-100"}`}>
          {isQuiz ? <IconQuiz /> : <IconCards />}
        </div>

        {/* Heading */}
        <p className="text-sm font-semibold text-gray-800 mb-1.5">
          Tạo {isQuiz ? "bài kiểm tra" : "bộ Flashcard"} bằng AI?
        </p>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          AI sẽ tự động phân tích và tạo {isQuiz ? "câu hỏi kiểm tra" : "bộ thẻ học"} phù hợp.
        </p>

        {/* Tiêu đề */}
        <div className="mb-4 text-left">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Tiêu đề {isQuiz ? "bài kiểm tra" : "bộ thẻ"}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Nhập tiêu đề ${isQuiz ? "bài kiểm tra" : "bộ thẻ"}...`}
            disabled={loading}
            className={`w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 outline-none transition disabled:opacity-40 focus:border-${isQuiz ? "orange" : "purple"}-400`}
          />
        </div>

        {/* Số câu hỏi */}
        <div className="mb-4 text-left">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Số {isQuiz ? "câu hỏi" : "thẻ"}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNumQuestions((n) => Math.max(5, n - 5))}
              disabled={loading}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40"
            >−</button>
            <input
              type="number"
              min={5}
              max={50}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.min(50, Math.max(5, Number(e.target.value))))}
              disabled={loading}
              className="flex-1 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold outline-none focus:border-orange-400 disabled:opacity-40"
            />
            <button
              onClick={() => setNumQuestions((n) => Math.min(50, n + 5))}
              disabled={loading}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40"
            >+</button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">Tối đa 50 câu · Tối thiểu 5 câu</p>
        </div>

        {/* Thời gian — chỉ quiz */}
        {isQuiz && (
          <div className="mb-5 text-left">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Thời gian làm bài
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimeLimit((n) => Math.max(15, n - 5))}
                disabled={loading}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40"
              >−</button>
              <input
                type="number"
                min={15}
                max={45}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.min(45, Math.max(15, Number(e.target.value))))}
                disabled={loading}
                className="flex-1 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold outline-none focus:border-orange-400 disabled:opacity-40"
              />
              <button
                onClick={() => setTimeLimit((n) => Math.min(45, n + 5))}
                disabled={loading}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40"
              >+</button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Tối thiểu 15 phút · Tối đa 45 phút</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition flex items-center justify-center gap-2 ${
              isQuiz ? "bg-[#F26739] hover:bg-orange-600" : "bg-purple-500 hover:bg-purple-600"
            } disabled:opacity-60`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              "✨ Tạo ngay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}