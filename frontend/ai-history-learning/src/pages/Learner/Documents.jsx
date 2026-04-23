import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import axiosClient from "../../lib/axios";

const Documents = () => {
  const navigate = useNavigate();
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 3 cột x 2 hàng

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/documents");
        const data = (res.success && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        setAllDocuments(data);
      } catch (err) {
        console.error("Lỗi lấy danh sách tài liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocs = allDocuments.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const currentItems = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <h2 className="font-semibold text-[26px] text-black">Tài liệu của tôi</h2>
      </div>

      {/* GRID LAYOUT: 3 CỘT - 2 HÀNG */}
      <div className="grid grid-cols-3 grid-rows-2 gap-[20px] w-full min-h-[460px]">
        {loading ? (
          <div className="col-span-3 text-center py-20 font-medium text-gray-500">Đang tải dữ liệu...</div>
        ) : currentItems.length === 0 ? (
          <div className="col-span-3 text-center py-20 text-gray-500">Không tìm thấy tài liệu phù hợp.</div>
        ) : (
          currentItems.map((doc) => (
            <div 
              key={doc._id} 
              className="bg-white rounded-[10px] flex flex-col p-[12px] gap-[12px] shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200"
              onClick={() => navigate(`/learner/bai-giang/${doc._id}`)}
            >
              <div 
                className="w-full h-[130px] bg-cover bg-center rounded-[6px] bg-gray-100"
                style={{ backgroundImage: `url(${doc.image || 'https://via.placeholder.com/350x130?text=History+Learning'})` }}
              />
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-[17px] text-gray-800 line-clamp-1">{doc.title}</h3>
                <div className="flex justify-between items-center mt-1">
                  <div className="px-3 py-1 bg-[#1473E6] rounded-full text-white text-[10px] font-bold uppercase">Tài liệu</div>
                  <span className="text-[11px] text-gray-500 font-medium">{doc.quizCount || 0} Quizzes</span>
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