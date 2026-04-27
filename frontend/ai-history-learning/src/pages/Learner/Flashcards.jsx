import React, { useState, useEffect } from "react";
import { Search, Loader2, ImageOff, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api"; 

const Flashcards = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/flashcards");
        
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
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-medium transition-all ${
              currentPage === i 
                ? "border border-[#E4E4E7] text-[#18181B] bg-white shadow-sm" 
                : "text-[#18181B] hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(<span key={i} className="px-1 text-gray-400">...</span>);
      }
    }
    return pages;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] p-10">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Thông báo</h2>
        <p className="text-gray-600 mb-6 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#F26739] text-white px-8 py-2 rounded-lg font-bold hover:bg-orange-600 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FDFDFD] min-h-screen p-6 font-sans">
      {/* Container giới hạn max-width để không bị tràn màn hình */}
      <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
        
        {/* Search Bar - Thu gọn padding và margin */}
        <div className="w-full h-[50px] bg-white border border-gray-200 rounded-xl mb-8 flex items-center px-4 shadow-sm">
          <div className="flex items-center bg-[#F9F9F9] border border-gray-100 rounded-lg px-3 h-[34px] w-full max-w-[400px] gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ thẻ học..."
              className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="hidden md:block bg-[#F26739] text-white text-[13px] font-semibold rounded-lg px-6 h-[32px] ml-auto hover:bg-orange-600 transition-colors shadow-sm">
            Tìm kiếm
          </button>
        </div>

        <h1 className="text-center text-3xl font-black mb-10 uppercase tracking-tight text-[#18181B]">
          Thư viện FlashCards
        </h1>

        {/* Grid Card - Chỉnh sửa gap nhỏ lại và card tinh gọn hơn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {loading ? (
            <div className="col-span-full text-center py-20 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
              <p className="text-gray-400 text-sm">Đang tải bộ thẻ học...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 text-sm">
              Không tìm thấy bộ thẻ học nào.
            </div>
          ) : currentItems.map((item) => (
            <div key={item._id} className="flex flex-col bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden">
              {/* Thumbnail - Giảm chiều cao */}
              <div className="w-full h-[160px] overflow-hidden rounded-[14px] mb-4 bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={40} className="text-gray-300 opacity-40" />
                )}
              </div>
              
              <div className="px-1">
                <h3 className="text-[17px] font-bold mb-3 h-[48px] line-clamp-2 text-[#18181B] group-hover:text-[#F26739] transition-colors leading-snug">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 mb-5">
                  <span className="bg-[#1473E6] text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                    {item.cards?.length || 0} Thẻ
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1473E6]" style={{ width: `${item.progress || 0}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/learner/hoc-flashcard/${item._id}`)} 
                  className="w-full bg-[#F26739] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#d9562d] transition-colors shadow-sm active:scale-[0.98]"
                >
                  Bắt đầu học ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination - Thu nhỏ size button */}
        {!loading && totalPages > 0 && (
          <div className="mt-auto flex justify-between items-center w-full px-2 mb-8">
            <div className="text-[14px] font-medium text-gray-500">
              {currentPage}/{totalPages} trang
            </div>

            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} className="text-[#09090B]" />
                <span className="text-[13px] font-medium text-[#18181B]">Trước</span>
              </button>

              <div className="flex items-center gap-1 mx-1">
                {renderPageNumbers()}
              </div>

              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <span className="text-[13px] font-medium text-[#18181B]">Sau</span>
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