import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "../../lib/api";
import Swal from "sweetalert2";

const PLACEHOLDER = "https://placehold.co/400x200/FFF5F1/F26739?text=Flashcard";

const Flashcards = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");

  // 1 trang hàng ngang 4 bài, dọc 2 hàng = 8 bài
  const itemsPerPage = 8;

  // GIỮ NGUYÊN LOGIC CALL API CỦA BẠN
  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/flashcards");
      
      const rawData = res?.data?.data || [];
      const formattedData = Array.isArray(rawData) ? rawData.map(item => {
        const cards = item.cards || [];
        const memorizedCount = cards.filter(c => c.memoryStatus === "Đã nhớ").length;
        
        const calcProgress = cards.length > 0 
          ? Math.round((memorizedCount / cards.length) * 100)
          : 0;
        const displayProgress = Number.isFinite(item.progress)
          ? item.progress
          : calcProgress;

        return {
          ...item,
          displayThumbnail: item.thumbnail || item.documentId?.thumbnail || PLACEHOLDER,
          displayCardCount: item.cardCount || cards.length || 0,
          displayProgress: displayProgress
        };
      }) : [];

      setFlashcardSets(formattedData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách Flashcards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleDeleteFlashcard = (e, id) => {
    e.stopPropagation();
    Swal.fire({
      title: "Xóa bộ thẻ?",
      text: "Dữ liệu sẽ biến mất vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteUrl = role === "ADMIN" ? `/admin/flashcards/${id}` : `/flashcards/${id}`;
          await api.delete(deleteUrl);
          Swal.fire("Đã xóa!", "Bộ thẻ đã được gỡ bỏ.", "success");
          fetchFlashcards();
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể xóa bộ thẻ.", "error");
        }
      }
    });
  };

  // LOGIC LỌC DỮ LIỆU
  const filteredData = flashcardSets.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "completed") return matchesSearch && item.displayProgress === 100;
    if (filterStatus === "uncompleted") return matchesSearch && item.displayProgress < 100;
    return matchesSearch;
  });

  // LOGIC PHÂN TRANG
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-screen bg-[#FDFDFD] font-sans overflow-hidden">
      {/* VÙNG NỘI DUNG CÓ THỂ CUỘN */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Thanh công cụ & Bộ lọc */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="flex items-center bg-[#F4F4F5] rounded-lg px-3 h-10 w-full max-w-xs gap-2 border border-transparent focus-within:border-orange-200 transition-all">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên bộ thẻ..."
                  className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
                {["all", "uncompleted", "completed"].map((id) => (
                  <button
                    key={id}
                    onClick={() => { setFilterStatus(id); setCurrentPage(1); }}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                      filterStatus === id ? "bg-white text-[#F26739] shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {id === "all" ? "Tất cả" : id === "uncompleted" ? "Chưa xong" : "Đã xong"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={fetchFlashcards} className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 border border-gray-100">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              {role === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin/flashcards/create")}
                  className="bg-[#F26739] text-white text-[12px] font-bold rounded-lg px-4 h-10 flex items-center gap-2 hover:bg-orange-600 shadow-sm"
                >
                  <Plus size={18} /> Tạo mới
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-[#18181B] border-l-4 border-[#F26739] pl-3 uppercase tracking-tight">
              Thư viện Flashcards
            </h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
              Tổng: {filteredData.length} bộ thẻ
            </div>
          </div>

          {/* Grid Flashcards: 4 Cột x 2 Hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
                <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-sm font-bold uppercase">Không tìm thấy dữ liệu</p>
              </div>
            ) : (
              currentItems.map((item) => {
                const isCompleted = item.displayProgress === 100;
                return (
                  <div key={item._id} className="group relative flex flex-col bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    {/* Tools */}
                    <div className="absolute top-4 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {role === "ADMIN" ? (
                        <button onClick={(e) => handleDeleteFlashcard(e, item._id)} className="p-2 bg-white text-red-500 rounded-lg shadow-sm border hover:bg-red-500 hover:text-white">
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); navigate("/learner/suco", { state: { reportTarget: "flashcards", targetId: item._id } }); }} className="p-2 bg-white text-red-500 rounded-lg shadow-sm border hover:bg-red-500 hover:text-white">
                          <AlertCircle size={14} />
                        </button>
                      )}
                    </div>

                    {/* Image */}
                    <div className="relative w-full h-32 overflow-hidden rounded-xl mb-3 bg-gray-50">
                      <img src={item.displayThumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => (e.target.src = PLACEHOLDER)} />
                      <div className="absolute bottom-2 left-2">
                        {isCompleted ? (
                          <div className="bg-green-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1">
                            <CheckCircle2 size={10} /> Xong
                          </div>
                        ) : (
                          <div className="bg-white text-gray-600 px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 border">
                            <Clock size={10} className="text-orange-400" /> Đang học
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-[13px] font-black mb-2 line-clamp-2 text-[#18181B] leading-tight uppercase font-bold h-8">
                      {item.title}
                    </h3>

                    <div className="flex justify-between items-center text-[11px] mb-2 font-bold border-t pt-2">
                      <span className="text-blue-600">{item.displayCardCount} thẻ</span>
                      <span className={isCompleted ? "text-green-500" : "text-orange-500"}>{item.displayProgress}%</span>
                    </div>

                    <div className="w-full h-1 bg-gray-100 rounded-full mb-4">
                      <div className={`h-full rounded-full ${isCompleted ? "bg-green-500" : "bg-orange-400"}`} style={{ width: `${item.displayProgress}%` }}></div>
                    </div>

                    {role === "ADMIN" ? (
                      <button onClick={() => navigate(`/admin/flashcards/edit/${item._id}`)} className="w-full bg-slate-50 text-slate-600 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-gray-900 hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2">
                        <Edit size={12} /> Chỉnh sửa
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/learner/flashcards/${item._id}`)} className={`w-full py-2 rounded-lg font-black text-[10px] uppercase text-white shadow-sm transition-all ${isCompleted ? "bg-green-600" : "bg-[#F26739]"}`}>
                        {isCompleted ? "Ôn tập" : "Học ngay"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* PHẦN CHUYỂN TRANG CỐ ĐỊNH Ở ĐÁY (STICKY BOTTOM) */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        {/* Số trang bên trái */}
        <div className="text-[14px] font-medium text-gray-700">
          {currentPage} trang
        </div>

        {/* Cụm điều hướng bên phải */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all rounded-md"
          >
            <ChevronLeft size={18} />
            <span className="text-[14px]">Previous</span>
          </button>

          <div className="flex items-center gap-1 mx-2">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-[14px] font-medium transition-all ${
                      currentPage === page
                        ? "border border-gray-300 bg-white shadow-sm text-black font-bold"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="text-gray-400 px-1 font-bold">...</span>;
              }
              return null;
            })}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all rounded-md"
          >
            <span className="text-[14px]">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;