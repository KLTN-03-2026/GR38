import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import {
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import QuizzView from "./QuizzView";

const Quizz = ({ lessonId, lectureTitle, thumbnail }) => {
  const [quizzesList, setQuizzesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Lấy Base URL để nối link ảnh (xóa /api/v1 nếu có)
  const baseURL = api.defaults.baseURL.replace('/api/v1', '');

  // 1. Lấy danh sách Quizzes theo documentId
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

  // Phân trang logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuizzes = quizzesList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(quizzesList.length / itemsPerPage) || 1;

  // 2. Gọi API /play để lấy đề bài (ẩn đáp án)
  const handleStartQuiz = async (quiz) => {
    try {
      setLoading(true);
      // Đổi thành endpoint /play theo tài liệu Swagger
      const res = await api.get(`/quizzes/${quiz._id}/play`);
      const fullQuizData = res?.data?.data;

      if (!fullQuizData || !fullQuizData.questions || fullQuizData.questions.length === 0) {
        alert("Bài tập này hiện chưa có nội dung câu hỏi.");
        return;
      }

      // Lưu toàn bộ data (bao gồm mảng questions) vào state để chuyển sang QuizzView
      setSelectedQuiz(fullQuizData);
    } catch (err) {
      console.error("Lỗi tải chi tiết đề thi:", err);
      alert("Không thể tải nội dung câu hỏi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Loading Screen
  if (loading && !selectedQuiz) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-[#f26739] mb-2" size={32} />
        <p className="text-gray-500 text-sm italic">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Chuyển sang màn hình làm bài nếu đã có dữ liệu đề thi
  if (selectedQuiz) {
    return (
      <QuizzView 
        quizData={selectedQuiz} 
        onBack={() => setSelectedQuiz(null)} 
      />
    );
  }

  // Giao diện danh sách bài tập
  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
          Danh sách bài tập
        </h2>
        <p className="text-sm text-gray-400 italic">Học phần: {lectureTitle}</p>
      </div>

      {quizzesList.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4">
            {currentQuizzes.map((quiz) => {
              // Ưu tiên thumbnail của quiz từ API, nếu không có thì dùng thumbnail từ props
              const imgUrl = quiz.thumbnail || thumbnail;
              const finalImgPath = imgUrl 
                ? (imgUrl.startsWith('http') ? imgUrl : `${baseURL}/${imgUrl}`)
                : null;

              return (
                <div
                  key={quiz._id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-orange-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                      {finalImgPath ? (
                        <img 
                          src={finalImgPath} 
                          className="w-full h-full object-cover" 
                          alt="quiz" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/200x200?text=Quiz";
                          }}
                        />
                      ) : (
                        <BookOpen size={24} className="text-[#f26739]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-800 uppercase text-sm group-hover:text-[#f26739] transition-colors">
                        {quiz.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full uppercase">
                        Bài tập trắc nghiệm
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="px-6 py-2.5 bg-[#f26739] text-white text-xs font-black rounded-xl hover:bg-orange-600 shadow-md transition-all active:scale-95"
                  >
                    LÀM BÀI NGAY
                  </button>
                </div>
              );
            })}
          </div>

          {/* Phân trang */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Trang {currentPage}/{totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <AlertCircle size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
            Chưa có bài tập nào cho tài liệu này
          </p>
        </div>
      )}
    </div>
  );
};

export default Quizz;