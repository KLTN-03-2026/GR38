import { Clock } from "lucide-react";
import { DIFF } from "./constants";

export default function QuizCard({ quiz, isTeacher, onStart, onEdit, onDelete, onHistory, docThumbnail }) {
  const cover = quiz.coverImage || docThumbnail || null;
  const diff = DIFF[quiz.difficulty];

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div className="relative overflow-hidden">
        {cover ? (
          <img src={cover} alt={quiz.title} className="w-full h-40 object-cover bg-[#fdf3ec]" />
        ) : (
          <div className="w-full h-40 flex items-center justify-center" style={{ background: "#fdf3ec" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#F26739"
              strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
        )}
        {diff && (
          <span className={`absolute top-2.5 left-2.5 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm ${diff.cls}`}>
            {diff.label}
          </span>
        )}
        {isTeacher && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(quiz); }}
            className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
          >
            <svg className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <p className="font-bold text-gray-800 text-[15px] mb-1 leading-snug line-clamp-2 uppercase tracking-wide">
          {quiz.title}
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Số câu hỏi <span className="font-bold text-[#F26739]">{quiz.questionCount ?? 0} câu</span>
        </p>
        <button
          onClick={() => onStart(quiz)}
          className="w-full py-2.5 rounded-xl text-sm text-white font-semibold transition"
          style={{ background: "#F26739" }}
        >
          Làm bài ngay
        </button>
        <button
          onClick={() => onHistory(quiz)}
          className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-orange-200 text-xs text-orange-500 hover:bg-orange-50 transition"
        >
          <Clock size={13} /> Lịch sử làm bài
        </button>
        {isTeacher && (
          <button
            onClick={() => onEdit(quiz)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blue-200 text-xs text-blue-600 hover:bg-blue-50 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
}