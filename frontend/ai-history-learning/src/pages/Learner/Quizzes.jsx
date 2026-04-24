import React, { useState, useEffect } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight, BookOpen, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api"; 

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy danh sách documents để từ đó lấy quizzes
        const docRes = await api.get("/documents");
        const docs = docRes?.data?.data || docRes?.data || [];

        if (Array.isArray(docs) && docs.length > 0) {
          const quizPromises = docs.map(doc => 
            api.get(`/quizzes/document/${doc._id}`).catch(() => null)
          );

          const quizResponses = await Promise.all(quizPromises);
          
          let allQuizzes = [];
          quizResponses.forEach(res => {
            const data = res?.data?.data || res?.data || [];
            if (Array.isArray(data)) {
              allQuizzes = [...allQuizzes, ...data];
            }
          });

          // Loại bỏ trùng lặp quiz theo ID
          const uniqueQuizzes = Array.from(new Set(allQuizzes.map(q => q._id)))
            .map(id => allQuizzes.find(q => q._id === id))
            .filter(Boolean);

          setQuizData(uniqueQuizzes);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách:", err);
        setError("Không thể tải danh sách bài thi.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllQuizzes();
  }, []);

  // 2. Logic Lọc và Phân trang
  const filteredQuizzes = quizData.filter((quiz) =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage) || 1;
  const currentItems = filteredQuizzes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset về trang 1 khi tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen p-8 font-sans">
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-[#18181B] mb-2 tracking-tight">HỆ THỐNG TRẮC NGHIỆM</h1>
          <p className="text-gray-500 font-medium">Chọn một bài thi để bắt đầu ôn tập kiến thức</p>
        </div>

        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm bài thi..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* QUIZ GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mb-4" />
          <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-3xl border border-red-100">
          <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mb-12">
            {currentItems.length > 0 ? (
              currentItems.map((quiz) => (
                <div key={quiz._id} className="flex flex-col bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-full h-[200px] overflow-hidden rounded-[20px] mb-5 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                     <BookOpen size={64} className="text-orange-300 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-lg font-bold mb-4 h-[56px] line-clamp-2 text-[#18181B] leading-tight uppercase group-hover:text-[#F26739] transition-colors">
                      {quiz.title}
                    </h2>
                    
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Số câu hỏi</span>
                        <span className="text-sm font-bold text-blue-600">
                          {quiz.totalQuestions || quiz.questions?.length || 0} câu
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/learner/hoc-quizz/${quiz._id}`)}
                        className="bg-[#F26739] text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#d8562c] transition-all shadow-md active:scale-95"
                      >
                        Làm bài ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-400 font-medium">
                Không tìm thấy bài thi nào khớp với từ khóa "{searchTerm}"
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pb-10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft size={22} />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-11 h-11 rounded-xl font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-[#F26739] text-white shadow-lg shadow-orange-200"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quizzes;