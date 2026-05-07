import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../lib/api";
import QuizPageInline from "./QuizPageInline"; // ← adjust path if needed

const Baikiemtra = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();           // document id
  const location  = useLocation();

  const [quizzes,  setQuizzes]  = useState([]);
  const [selected, setSelected] = useState(null); // quiz being played
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: res } = await api.get(`/quizzes/document/${id}`);
        const list = res.data ?? res ?? [];
        if (!list.length) {
          setError("Tài liệu này chưa có bài kiểm tra nào.");
        } else {
          setQuizzes(list);
          // Nếu chỉ có 1 quiz → vào thẳng luôn
          if (list.length === 1) setSelected(list[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách bài kiểm tra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Đang tải bài kiểm tra...</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#FAFAFA]">
      <div className="text-center space-y-2">
        <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 font-medium">{error}</p>
      </div>
      <button onClick={() => navigate(-1)}
        className="px-5 py-2 bg-[#F26739] text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
        ← Quay lại
      </button>
    </div>
  );

  /* ── Đang chơi quiz ── */
  if (selected) return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-2xl mx-auto">
        <QuizPageInline
          quiz={selected}
          onBack={() => {
            // Nếu chỉ có 1 quiz thì về trang trước, nhiều quiz thì về danh sách
            if (quizzes.length === 1) navigate(-1);
            else setSelected(null);
          }}
        />
      </div>
    </div>
  );

  /* ── Danh sách quiz (khi có nhiều quiz) ── */
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại
        </button>

        <h1 className="text-xl font-bold text-gray-800 mb-1">Chọn bài kiểm tra</h1>
        <p className="text-sm text-gray-400 mb-6">{quizzes.length} bài kiểm tra</p>

        <div className="flex flex-col gap-3">
          {quizzes.map((quiz) => (
            <button key={quiz._id} onClick={() => setSelected(quiz)}
              className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#F26739] transition-colors">
                    {quiz.title ?? "Bài kiểm tra"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {quiz.questions?.length ?? quiz.questionCount ?? 0} câu hỏi
                    {quiz.timeLimitMinutes ? ` · ${quiz.timeLimitMinutes} phút` : ""}
                    {quiz.difficulty ? ` · ${{ EASY:"Dễ", MEDIUM:"Trung bình", HARD:"Khó" }[quiz.difficulty] ?? quiz.difficulty}` : ""}
                  </p>
                </div>
                <div className="ml-3 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-[#F26739] transition-colors">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    className="text-[#F26739] group-hover:text-white transition-colors">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Baikiemtra;