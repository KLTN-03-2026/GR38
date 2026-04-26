import { useState } from "react";
import { IconQuiz, IconCards } from "./icons";

export default function ConfirmGenerateModal({ type, onConfirm, onCancel, loading }) {
  const [numQuestions, setNumQuestions] = useState(10);
  const isQuiz = type === "quiz";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-[340px] p-7 text-center" onClick={e => e.stopPropagation()}>
        <div className={`w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full ${isQuiz ? "bg-orange-50 border border-orange-100" : "bg-purple-50 border border-purple-100"}`}>
          {isQuiz ? <IconQuiz /> : <IconCards />}
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1.5">Tạo {isQuiz ? "bài kiểm tra" : "bộ Flashcard"} bằng AI?</p>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">AI sẽ tự động phân tích và tạo {isQuiz ? "câu hỏi kiểm tra" : "bộ thẻ học"} phù hợp.</p>

        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 mb-2 text-left">Số câu hỏi</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setNumQuestions(n => Math.max(1, n - 1))} disabled={loading}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40">−</button>
            <input type="number" min={1} max={50} value={numQuestions}
              onChange={e => setNumQuestions(Math.min(50, Math.max(1, Number(e.target.value))))}
              disabled={loading}
              className="flex-1 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold outline-none focus:border-orange-400 disabled:opacity-40" />
            <button onClick={() => setNumQuestions(n => Math.min(50, n + 1))} disabled={loading}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40">+</button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-left">Tối đa 50 câu</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">Huỷ</button>
          <button onClick={() => onConfirm(numQuestions)} disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition flex items-center justify-center gap-2 ${isQuiz ? "bg-[#F26739] hover:bg-orange-600" : "bg-purple-500 hover:bg-purple-600"} disabled:opacity-60`}>
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang tạo...</> : "✨ Tạo ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}