import React, { useState, useEffect } from "react";
import { Search, Loader2, ImageOff, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Đổi import sang api.js mới
import api from "../../lib/api"; 

const Flashcards = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Quản lý trạng thái lỗi
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Sử dụng api thay vì axiosClient
        const res = await api.get("/flashcards");
        
        // Kiểm tra cấu trúc dữ liệu linh hoạt (giống bên Documents)
        let data = [];
        if (res?.data?.success && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.success && Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res)) {
          data = res;
        }
        
        setFlashcardSets(data);
      } catch (err) {
        console.error("Lỗi lấy danh sách Flashcards:", err);
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn.");
        } else {
          setError("Không thể tải danh sách Flashcards. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, []);

  const filteredData = flashcardSets.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  // Nếu gặp lỗi kết nối hoặc token
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] p-10">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Thông báo</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#F26739] text-white px-8 py-2 rounded-md font-bold hover:bg-orange-600 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen p-8 font-sans">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col min-h-[calc(100vh-100px)]">
        
        {/* Search Bar */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-10 flex items-center px-5 shadow-sm">
          <div className="flex items-center bg-[#F9F9F9] border border-gray-200 rounded-[6px] px-3 h-[38px] w-full max-w-[500px] gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ thẻ học..."
              className="bg-transparent border-none outline-none text-[14px] w-full text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="hidden md:block bg-[#F26739] text-white text-[14px] font-semibold rounded-[6px] px-8 h-[36px] ml-auto hover:bg-orange-600 transition-colors shadow-sm">
            Tìm kiếm
          </button>
        </div>

        <h1 className="text-center text-[36px] font-black mb-14 uppercase tracking-tight text-[#18181B]">
          Thư viện FlashCards
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 mb-14">
          {loading ? (
            <div className="col-span-full text-center py-20 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
              <p className="text-gray-500 font-medium">Đang tải bộ thẻ học...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-[24px] border border-dashed border-gray-200">
              Không tìm thấy bộ thẻ học nào.
            </div>
          ) : currentItems.map((item) => (
            <div key={item._id} className="flex flex-col bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="w-full h-[210px] overflow-hidden rounded-[18px] mb-5 bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-[1.01]">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={48} className="text-gray-300 opacity-50" />
                )}
              </div>
              <div className="px-2">
                <h3 className="text-[19px] font-bold mb-4 h-[54px] line-clamp-2 text-[#18181B] group-hover:text-[#F26739] transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-[#1473E6] text-white text-[12px] px-3 py-1 rounded-full font-bold">
                    {item.cards?.length || 0} Thẻ
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1473E6]" style={{ width: `${item.progress || 0}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/learner/hoc-flashcard/${item.documentId?._id || item.documentId}`)} 
                  className="w-full bg-[#F26739] text-white py-3.5 rounded-xl font-bold hover:bg-[#d9562d] transition-colors shadow-lg active:scale-[0.98]"
                >
                  Bắt đầu học ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- PAGINATION UI --- */}
        {!loading && totalPages > 0 && (
          <div className="mt-auto flex justify-between items-center w-full h-10 px-5 mb-10">
            <div className="text-[16px] font-medium text-black">
              {currentPage}/{totalPages} trang
            </div>

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

export default Flashcards;