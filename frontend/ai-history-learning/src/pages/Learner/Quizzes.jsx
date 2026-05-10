import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Trash2,
  Edit3,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "../../lib/api";
import Swal from "sweetalert2";

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { role } = useAuth();

  const baseURL = api.defaults.baseURL.replace("/api/v1", "");

  const fetchAllQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (role === "ADMIN") {
        // --- LOGIC CHO ADMIN: Lấy trực tiếp tất cả bài thi từ hệ thống ---
        // Giúp Admin quản lý được cả những bài thi chưa được gán vào tài liệu nào
        const response = await api.get("/quizzes/admin/all");
        const data = response?.data?.data || response?.data || [];
        setQuizData(Array.isArray(data) ? data : []);
      } else {
        // --- LOGIC CHO TEACHER/LEARNER: Lấy theo cấu trúc tài liệu (Logic cũ) ---
        const docRes = await api.get("/documents");
        const docs = docRes?.data?.data || docRes?.data || [];

        if (Array.isArray(docs) && docs.length > 0) {
          const quizPromises = docs.map((doc) =>
            api.get(`/quizzes/document/${doc._id}`).catch(() => null),
          );

          const quizResponses = await Promise.all(quizPromises);
          let allQuizzes = [];

          quizResponses.forEach((res) => {
            const data = res?.data?.data || res?.data || [];
            if (Array.isArray(data)) allQuizzes = [...allQuizzes, ...data];
          });

          // Loại bỏ các bài thi trùng lặp nếu chúng xuất hiện ở nhiều tài liệu khác nhau
          const uniqueQuizzes = Array.from(
            new Set(allQuizzes.map((q) => q._id)),
          )
            .map((id) => allQuizzes.find((q) => q._id === id))
            .filter(Boolean);

          setQuizData(uniqueQuizzes);
        } else {
          setQuizData([]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải bài thi:", err);
      setError("Không thể tải danh sách bài thi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQuizzes();
  }, [role]); // Cập nhật lại khi vai trò người dùng thay đổi

  const handleDeleteQuiz = (e, id) => {
    e.stopPropagation();
    Swal.fire({
      title: "Xác nhận xóa bài thi?",
      text: "Bạn sẽ không thể khôi phục lại bài thi này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/quizzes/${id}`);
          Swal.fire("Đã xóa!", "Bài thi đã được loại bỏ.", "success");
          fetchAllQuizzes();
        } catch (error) {
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa bài thi.", "error");
        }
      }
    });
  };

  const filteredQuizzes = quizData.filter((quiz) =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage) || 1;
  const currentItems = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex-1 bg-[#FDFDFD] min-h-screen p-6 font-sans relative">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-[#18181B] mb-0.5 tracking-tight uppercase">
              HỆ THỐNG TRẮC NGHIỆM
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {role === "ADMIN"
                ? "Quản trị viên: Quản lý toàn bộ bài thi hệ thống"
                : "Học viên: Chọn bài thi để bắt đầu ôn tập"}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[300px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Tìm kiếm bài thi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 w-8 h-8 mb-3" />
            <p className="text-gray-400 text-xs">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="text-red-500 w-8 h-8 mb-3" />
            <p className="text-red-600 font-bold text-xs">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {currentItems.length > 0 ? (
                currentItems.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="relative flex flex-col bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden"
                  >
                    {role === "ADMIN" && (
                      <button
                        onClick={(e) => handleDeleteQuiz(e, quiz._id)}
                        className="absolute top-2 left-2 z-20 p-1.5 bg-white/90 hover:bg-red-500 rounded-full text-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                        title="Xóa bài thi"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {role !== "ADMIN" && (
                      <div className="absolute top-2 right-2 z-20 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/learner/quizzes/result/${quiz._id}`);
                          }}
                          className="p-2 bg-blue-50 hover:bg-blue-500 rounded-lg text-blue-500 hover:text-white transition-all duration-200 border border-blue-100 shadow-sm group/btn"
                          title="Lịch sử làm bài"
                        >
                          <History
                            size={15}
                            className="group-hover/btn:scale-110 transition-transform"
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/learner/suco", {
                              state: {
                                reportTarget: "quizzes",
                                targetId: quiz._id,
                              },
                            });
                          }}
                          className="p-2 bg-red-50 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all duration-200 border border-red-100 shadow-sm group/btn"
                          title="Báo cáo sự cố"
                        >
                          <AlertCircle
                            size={15}
                            className="group-hover/btn:scale-110 transition-transform"
                          />
                        </button>
                      </div>
                    )}

                    <div className="w-full h-[120px] overflow-hidden rounded-lg mb-3 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                      {quiz.thumbnail ? (
                        <img
                          src={
                            quiz.thumbnail.startsWith("http")
                              ? quiz.thumbnail
                              : `${baseURL}/${quiz.thumbnail}`
                          }
                          alt={quiz.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <BookOpen size={32} className="text-orange-300" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h2 className="text-sm font-bold mb-2 h-[40px] line-clamp-2 text-[#18181B] leading-tight uppercase group-hover:text-[#F26739] transition-colors">
                        {quiz.title}
                      </h2>
                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-gray-400">
                            Số câu
                          </span>
                          <span className="text-[11px] font-bold text-blue-600">
                            {quiz.questionCount ?? 0} câu
                          </span>
                        </div>

                        {role === "ADMIN" ? (
                          <button
                            onClick={() =>
                              navigate(`/admin/quizzes/edit/${quiz._id}`)
                            }
                            className="bg-slate-800 text-white px-3 py-1.5 rounded-md font-bold text-[10px] hover:bg-slate-900 transition-all flex items-center gap-1.5"
                          >
                            <Edit3 size={12} /> Sửa
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/learner/quizzes/${quiz._id}`)
                            }
                            className="bg-[#F26739] text-white px-3 py-1.5 rounded-md font-bold text-[10px] hover:bg-[#d8562c] transition-all active:scale-95 shadow-sm"
                          >
                            Làm bài
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-400 text-xs">
                  Không tìm thấy bài thi nào.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-row justify-between items-center px-2 gap-4 w-full h-10 mt-4 mb-6">
              <div className="text-gray-500 font-medium text-xs w-[100px]">
                {totalPages} trang
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className="flex items-center gap-1 px-2 py-1 rounded bg-transparent disabled:opacity-30 hover:bg-gray-100 transition-colors text-xs"
                >
                  <ChevronLeft size={14} /> <span>Trước</span>
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-md text-xs font-medium ${
                        currentPage === i + 1
                          ? "border border-[#E4E4E7] bg-white text-orange-600 font-bold"
                          : "text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="flex items-center gap-1 px-2 py-1 rounded bg-transparent disabled:opacity-30 hover:bg-gray-100 transition-colors text-xs"
                >
                  <span>Sau</span> <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
