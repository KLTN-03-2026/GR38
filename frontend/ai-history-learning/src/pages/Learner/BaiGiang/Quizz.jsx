import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";

const Quizz = ({ lessonId, lectureTitle, thumbnail }) => {
  const [quizzesList, setQuizzesList] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // State cho phân trang danh sách Quiz
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // 1 hàng ngang có 2 Quizz theo yêu cầu

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!lessonId) return;
      try {
        setLoading(true);
        const res = await api.get(`/quizzes/document/${lessonId}`);
        const data = res?.data?.data || res?.data || [];
        setQuizzesList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi tải danh sách Quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [lessonId]);

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuizzes = quizzesList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(quizzesList.length / itemsPerPage) || 1;

  const handleStartQuiz = async (quiz) => {
    try {
      setLoading(true);
      const res = await api.get(`/quizzes/play/${quiz._id}`);
      const data = res?.data?.data || res?.data || {};
      setSelectedQuiz(quiz);
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setIsSubmitted(false);
      setResult(null);
    } catch (err) {
      alert("Khong the tai cau hoi. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    if (isSubmitted) return;
    const currentQuestionId = questions[currentQuestionIndex]._id;
    setUserAnswers((prev) => ({ ...prev, [currentQuestionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz?._id) return;
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      if (
        !window.confirm(
          `Bạn mới làm ${answeredCount}/${questions.length} câu. Vẫn muốn nộp chứ?`,
        )
      )
        return;
    }

    try {
      setLoading(true);
      const formattedAnswers = Object.entries(userAnswers).map(
        ([qId, ans]) => ({
          questionId: qId,
          selectedAnswer: ans,
        }),
      );

      const res = await api.post(`/quizzes/${selectedQuiz._id}/submit`, {
        userAnswers: formattedAnswers,
      });
      const resData = res?.data?.data || res?.data;

      if (resData) {
        const total = questions.length;
        const correct = resData.correctCount || 0;
        setResult({
          score: correct,
          correctCount: correct,
          incorrectCount: total - correct,
          totalQuestions: total,
        });
        setIsSubmitted(true);
      }
    } catch (err) {
      alert("Không thể nộp bài. Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="animate-spin text-[#f26739]" size={40} />
        <p className="text-gray-500 italic font-medium">Đang xử lý...</p>
      </div>
    );

  // GIAO DIỆN 1: DANH SÁCH QUIZ + PHÂN TRANG
  if (!selectedQuiz) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            Bài tập ôn tập
          </h2>
          <p className="text-xs text-gray-400 font-medium italic truncate">
            {lectureTitle}
          </p>
        </div>

        {quizzesList.length > 0 ? (
          <>
            {/* Grid hiển thị đúng 2 quiz trên 1 hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {currentQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="aspect-video bg-orange-50 rounded-xl mb-3 overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={quiz.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen
                          size={28}
                          className="text-orange-200 group-hover:scale-110 transition-transform"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-[13px] line-clamp-1 uppercase mb-2">
                    {quiz.title}
                  </h3>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {quiz.questionCount ?? quiz.totalQuestions ?? 0} CÂU
                    </span>
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="bg-[#f26739] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#e0562b] active:scale-95 transition-all"
                    >
                      Làm bài ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PHÂN TRANG CHUẨN FIGMA - ĐÃ SỬA LỖI HIỂN THỊ SỐ TRANG */}
            <div className="flex flex-row justify-between items-center px-2 gap-4 w-full h-10 mt-4 border-t border-gray-50 pt-6">
              <div className="text-[#09090B] font-medium text-sm font-['Inter']">
                Trang {currentPage} / {totalPages}
              </div>

              <div className="flex flex-row items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded bg-transparent disabled:opacity-20 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={16} className="text-[#09090B]" />
                </button>

                <div className="flex flex-row items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;

                    // Logic hiển thị dấu ba chấm nếu quá nhiều trang
                    if (totalPages > 5) {
                      if (
                        pageNum > 2 &&
                        pageNum < totalPages - 1 &&
                        Math.abs(pageNum - currentPage) > 1
                      ) {
                        if (pageNum === 3 || pageNum === totalPages - 1) {
                          return (
                            <MoreHorizontal
                              key={`dots-${pageNum}`}
                              size={14}
                              className="mx-1 text-gray-300"
                            />
                          );
                        }
                        return null;
                      }
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-md font-['Inter'] font-medium text-xs transition-all ${
                          currentPage === pageNum
                            ? "border border-[#E4E4E7] text-[#18181B] bg-white shadow-sm"
                            : "text-[#71717A] hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded bg-transparent disabled:opacity-20 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={16} className="text-[#09090B]" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-xs font-bold uppercase">
              Chưa có bài tập
            </p>
          </div>
        )}
      </div>
    );
  }

  // GIAO DIỆN 2: KẾT QUẢ
  if (isSubmitted && result)
    return (
      <div className="p-8 bg-white rounded-2xl text-center shadow-sm border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-orange-50 rounded-full ring-4 ring-orange-50/50">
            <Trophy className="text-[#f26739]" size={48} />
          </div>
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-1 tracking-tight">
          HOÀN THÀNH
        </h2>
        <p className="text-gray-400 mb-6 text-sm font-medium">
          {selectedQuiz.title}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center">
            <CheckCircle2 size={16} className="text-green-500 mb-1" />
            <p className="text-2xl font-black text-green-600">
              {result.correctCount}
            </p>
            <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest">
              Đúng
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center">
            <XCircle size={16} className="text-red-500 mb-1" />
            <p className="text-2xl font-black text-red-600">
              {result.incorrectCount}
            </p>
            <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest">
              Sai
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleStartQuiz(selectedQuiz)}
            className="w-full py-3 bg-[#f26739] text-white rounded-xl font-bold hover:bg-[#e0562b] shadow-md transition-all active:scale-95"
          >
            Làm lại bài
          </button>
          <button
            onClick={() => setSelectedQuiz(null)}
            className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-95"
          >
            Chọn bài khác
          </button>
        </div>
      </div>
    );

  // GIAO DIỆN 3: LÀM BÀI
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = userAnswers[currentQuestion?._id] || null;

  return (
    <div className="p-4 bg-white rounded-xl">
      <button
        onClick={() => setSelectedQuiz(null)}
        className="flex items-center gap-2 text-gray-400 hover:text-[#f26739] mb-6 transition-all group"
      >
        <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-orange-50">
          <ArrowLeft size={14} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">
          Thoát bài làm
        </span>
      </button>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[#f26739] font-black text-xl leading-none">
            {currentQuestionIndex + 1}
            <span className="text-gray-300 text-[10px] font-normal ml-0.5">
              /{questions.length}
            </span>
          </span>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight line-clamp-1 max-w-[150px]">
            {selectedQuiz.title}
          </p>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-[#f26739] transition-all duration-700 ease-out"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="bg-[#F9FAFB] p-6 rounded-[28px] border border-gray-100 shadow-sm">
        <h2 className="text-md font-bold text-gray-800 leading-snug mb-6 min-h-[50px]">
          {currentQuestion?.question}
        </h2>

        <div className="grid grid-cols-1 gap-2.5">
          {(currentQuestion?.options || []).map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className={`flex items-center p-4 text-left border-2 rounded-2xl transition-all ${
                selectedOption === opt
                  ? "border-[#f26739] bg-orange-50 translate-x-1"
                  : "border-white bg-white hover:border-gray-100"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 text-[9px] font-bold ${
                  selectedOption === opt
                    ? "border-[#f26739] bg-[#f26739] text-white"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </div>
              <span
                className={`text-[13px] font-semibold ${selectedOption === opt ? "text-orange-900" : "text-gray-700"}`}
              >
                {opt}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-50">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="flex items-center gap-1 px-4 py-2 text-gray-400 font-bold text-[11px] disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={14} /> Trước
          </button>

          <button
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
              } else {
                handleSubmitQuiz();
              }
            }}
            className="px-8 py-2 bg-[#f26739] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-[11px] flex items-center gap-2"
          >
            {currentQuestionIndex === questions.length - 1
              ? "Gửi kết quả"
              : "Câu tiếp"}
            {currentQuestionIndex !== questions.length - 1 && (
              <ChevronRight size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Quizz;
