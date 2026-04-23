import React, { useState, useEffect } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../lib/axios";

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Logic phân trang chuẩn Figma
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        setLoading(true);
        const docRes = await axiosClient.get("/documents");
        const documents = docRes.success ? docRes.data : docRes;

        if (Array.isArray(documents) && documents.length > 0) {
          const quizPromises = documents.map(doc => 
            axiosClient.get(`/quizzes/${doc._id}`).catch(() => null)
          );

          const quizResponses = await Promise.all(quizPromises);
          
          let allQuizzes = [];
          quizResponses.forEach(res => {
            if (res && (res.success || Array.isArray(res))) {
              const data = res.success ? res.data : res;
              if (Array.isArray(data)) {
                allQuizzes = [...allQuizzes, ...data];
              }
            }
          });

          const uniqueQuizzes = Array.from(new Set(allQuizzes.map(q => q._id)))
            .map(id => allQuizzes.find(q => q._id === id));

          setQuizData(uniqueQuizzes);
        }
      } catch (err) {
        console.error("Lỗi kết nối API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllQuizzes();
  }, []);

  const filteredQuizzes = quizData.filter((quiz) =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuizzes.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Hàm render số trang chuẩn phong cách Figma
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-10 h-10 flex items-center justify-center rounded-md text-[14px] font-medium transition-all ${
              currentPage === i 
                ? "border border-[#E4E4E7] text-[#18181B] bg-white shadow-sm" 
                : "text-[#18181B] hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(<span key={i} className="px-2 text-gray-400">...</span>);
      }
    }
    return pages;
  };

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen p-8 font-sans">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col min-h-[calc(100vh-100px)]">
        
        {/* Search Bar - Đồng bộ với giao diện chung */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-10 flex items-center px-5 shadow-sm">
          <div className="flex items-center bg-[#F9F9F9] border border-gray-200 rounded-[6px] px-3 h-[38px] w-full max-w-[500px] gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài ôn tập..."
              className="bg-transparent border-none outline-none text-[14px] w-full text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="hidden md:block bg-[#F26739] text-white text-[14px] font-semibold rounded-[6px] px-8 h-[36px] ml-auto hover:bg-orange-600 transition-colors">
            Tìm kiếm
          </button>
        </div>

        <h1 className="text-center text-[36px] font-black mb-14 uppercase tracking-tight text-[#18181B]">
          Thư viện Câu hỏi
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 mb-14">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <Loader2 className="animate-spin inline-block text-orange-500 w-10 h-10" />
            </div>
          ) : currentItems.length > 0 ? (
            currentItems.map((quiz) => (
              <div key={quiz._id} className="flex flex-col bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-full h-[210px] overflow-hidden rounded-[18px] mb-5 bg-orange-50 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                   <BookOpen size={60} className="text-orange-200" />
                </div>
                <div className="px-2">
                  <h2 className="text-[19px] font-bold mb-4 h-[54px] line-clamp-2 text-[#18181B] leading-tight uppercase">
                    {quiz.title}
                  </h2>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {quiz.totalQuestions || (quiz.questions ? quiz.questions.length : 0)} câu hỏi
                    </span>
                    <button 
                      onClick={() => navigate(`/learner/hoc-quizz/${quiz._id}`)}
                      className="bg-[#F26739] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#d8562c] transition-all shadow-lg active:scale-95"
                    >
                      Làm bài
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase">
              Không tìm thấy bài ôn tập nào.
            </div>
          )}
        </div>

        {/* --- PAGINATION UI (Theo đúng hình mẫu thiết kế của bạn) --- */}
        {!loading && totalPages > 0 && (
          <div className="mt-auto flex justify-between items-center w-full h-10 px-5 mb-10">
            {/* Bên trái: Tổng số trang */}
            <div className="text-[16px] font-medium text-black">
              {currentPage}/{totalPages} trang
            </div>

            {/* Bên phải: Nút điều hướng */}
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} className="text-[#09090B]" />
                <span className="text-[14px] font-medium text-[#18181B]">Previous</span>
              </button>

              <div className="flex items-center gap-1 mx-2">
                {renderPageNumbers()}
              </div>

              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <span className="text-[14px] font-medium text-[#18181B]">Next</span>
                <ChevronRight size={14} className="text-[#09090B]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;