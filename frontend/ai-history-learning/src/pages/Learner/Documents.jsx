import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import api from "../../lib/api"; 

const Documents = () => {
  const navigate = useNavigate();
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Thêm params để tránh cache 304 nếu cần, nhưng quan trọng là xử lý res
        const res = await api.get("/documents");
        
        console.log("Dữ liệu API trả về:", res); // Debug để kiểm tra cấu trúc thực tế

        // XỬ LÝ LOGIC DỮ LIỆU DỰA TRÊN SWAGGER:
        // Thông thường api.js (axios) trả về response.data là object lớn { success, data, ... }
        let finalData = [];
        
        if (res?.data?.success && Array.isArray(res.data.data)) {
          // Trường hợp axios trả về lồng nhau: res.data (axios) -> .data (backend)
          finalData = res.data.data;
        } else if (res?.success && Array.isArray(res.data)) {
          // Trường hợp interceptor trong api.js đã bóc tách sẵn 1 lớp
          finalData = res.data;
        } else if (Array.isArray(res)) {
          // Trường hợp trả về trực tiếp mảng
          finalData = res;
        }

        setAllDocuments(finalData);
      } catch (err) {
        console.error("Lỗi lấy danh sách tài liệu:", err);
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn.");
        } else {
          setError("Không thể hiển thị tài liệu. Vui lòng kiểm tra kết nối Server.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // Lọc dữ liệu theo tìm kiếm
  const filteredDocs = allDocuments.filter(doc => 
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const currentItems = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-red-100 p-10 mx-auto w-[1113px]">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Thông báo</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-orange-500 text-white px-6 py-2 rounded-md font-bold hover:bg-orange-600 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] rounded-[6px] p-[20px] flex flex-col gap-[20px] w-[1113px] min-h-[700px] mx-auto shadow-sm border border-gray-100">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Tìm kiếm tài liệu học tập..."
              className="w-full pl-10 pr-4 py-2 rounded-md outline-none bg-gray-50 focus:bg-white border border-transparent focus:border-orange-500 text-[14px]"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition text-[14px]">Tìm kiếm</button>
        </div>
        <h2 className="font-semibold text-[26px] text-black">Tài liệu học tập</h2>
      </div>

      <div className="grid grid-cols-3 grid-rows-2 gap-[20px] w-full min-h-[460px]">
        {loading ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-2" />
            <span className="font-medium text-gray-500">Đang truy xuất dữ liệu...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p>Hiện chưa có tài liệu nào khả dụng.</p>
            <p className="text-[12px] mt-1">(Hãy đảm bảo trạng thái tài liệu trong Database là "ready")</p>
          </div>
        ) : (
          currentItems.map((doc) => (
            <div 
              key={doc._id} 
              className="bg-white rounded-[10px] flex flex-col p-[12px] gap-[12px] shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 group"
              onClick={() => navigate(`/learner/bai-giang/${doc._id}`)}
            >
              <div 
                className="w-full h-[130px] bg-cover bg-center rounded-[6px] bg-gray-200"
                style={{ backgroundImage: `url(${doc.image || 'https://via.placeholder.com/350x130?text=AI+History'})` }}
              />
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-[17px] text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
                  {doc.title}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <div className="px-3 py-1 bg-blue-500 rounded-full text-white text-[10px] font-bold uppercase">
                    {doc.status || "Tài liệu"}
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[11px] text-gray-500 font-medium">{doc.flashcardCount || 0} Flashcards</span>
                    <span className="text-[11px] text-gray-500 font-medium">{doc.quizCount || 0} Quizzes</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PHÂN TRANG */}
      <div className="flex items-center justify-between px-2 py-4 border-t border-gray-100 mt-auto">
        <span className="text-[14px] text-gray-500 font-medium">{currentPage} / {totalPages} trang</span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="flex items-center gap-1 px-3 py-1 text-[14px] font-semibold text-gray-500 hover:text-orange-500 disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-md text-[14px] font-bold transition-all ${
                  currentPage === i + 1 ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-black"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="flex items-center gap-1 px-3 py-1 text-[14px] font-semibold text-gray-500 hover:text-orange-500 disabled:opacity-30"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documents;