import React, { useState, useEffect } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight, BookOpen, AlertCircle, MoreHorizontal } from "lucide-react";
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

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
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
            if (Array.isArray(data)) allQuizzes = [...allQuizzes, ...data];
          });

          const uniqueQuizzes = Array.from(new Set(allQuizzes.map(q => q._id)))
            .map(id => allQuizzes.find(q => q._id === id))
            .filter(Boolean);

          setQuizData(uniqueQuizzes);
        }
      } catch (err) {
        setError("Không thể tải danh sách bài thi.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllQuizzes();
  }, []);

  const filteredQuizzes = quizData.filter((quiz) =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage) || 1;
  const currentItems = filteredQuizzes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 bg-[#FDFDFD] min-h-screen p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#18181B] mb-1 tracking-tight">HỆ THỐNG TRẮC NGHIỆM</h1>
            <p className="text-sm text-gray-500 font-medium">Chọn bài thi để bắt đầu ôn tập</p>
          </div>

          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm bài thi..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* QUIZ GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-3" />
            <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="text-red-500 w-10 h-10 mb-3" />
            <p className="text-red-600 font-bold text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {currentItems.length > 0 ? (
                currentItems.map((quiz) => (
                  <div key={quiz._id} className="flex flex-col bg-white p-4 rounded-[22px] shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden">
                    <div className="w-full h-[140px] overflow-hidden rounded-[14px] mb-4 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                        <BookOpen size={48} className="text-orange-300 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-md font-bold mb-3 h-[44px] line-clamp-2 text-[#18181B] leading-snug uppercase group-hover:text-[#F26739] transition-colors">
                        {quiz.title}
                      </h2>
                      
                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Số câu</span>
                          <span className="text-xs font-bold text-blue-600">
                            {quiz.questionCount ?? quiz.totalQuestions ?? 0} câu
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => navigate(`/learner/quizzes/${quiz._id}`)}
                          className="bg-[#F26739] text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-[#d8562c] transition-all shadow-sm active:scale-95"
                        >
                          Làm bài ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-400 text-sm">
                  Không tìm thấy bài thi nào khớp với "{searchTerm}"
                </div>
              )}
            </div>

            {/* PAGINATION CHUẨN FIGMA - LUÔN HIỂN THỊ ĐỂ KIỂM TRA */}
            <div className="flex flex-row justify-between items-center px-5 gap-4 w-full h-10 mt-8 mb-10">
              {/* 1 trang label */}
              <div className="text-[#000000] font-medium text-base leading-5 flex items-center font-['Inter'] w-[100px]">
                {totalPages} trang
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-row items-center p-0 gap-1 h-10">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex flex-row justify-center items-center py-[6px] px-2 gap-1 h-10 rounded bg-transparent disabled:opacity-30 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={14} className="text-[#09090B]" />
                  <span className="text-[#18181B] font-medium text-sm leading-5 font-['Inter']">Previous</span>
                </button>
                
                {/* Page Numbers */}
                <div className="flex flex-row items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (totalPages > 5 && pageNum > 3 && pageNum < totalPages) {
                      if (pageNum === 4) return <MoreHorizontal key="dots" size={16} className="mx-2 text-gray-400" />;
                      return null;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`box-border flex flex-row justify-center items-center p-2 w-10 h-10 rounded-md font-['Inter'] font-medium text-sm transition-all ${
                          currentPage === pageNum
                            ? "border border-[#E4E4E7] text-[#18181B] bg-white shadow-sm"
                            : "text-[#18181B] hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex flex-row justify-center items-center py-[6px] px-2 gap-1 h-10 rounded bg-transparent disabled:opacity-30 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-[#18181B] font-medium text-sm leading-5 font-['Inter']">Next</span>
                  <ChevronRight size={14} className="text-[#09090B]" />
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