import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "../../lib/api";
import Swal from "sweetalert2";

const PLACEHOLDER = "https://placehold.co/400x200/FFF5F1/F26739?text=Flashcard";
const Flashcards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (location.state?.filterTab) {
      setFilterStatus(location.state.filterTab);
    }
  }, [location.state]);

  const itemsPerPage = 8;

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/flashcards");

      const rawData = res?.data?.data || [];
      const formattedData = Array.isArray(rawData)
        ? rawData.map((item) => {
            const cards = item.cards || [];
            const memorizedCount = cards.filter(
              (c) => c.memoryStatus === "Đã nhớ"
            ).length;

            const calcProgress =
              cards.length > 0
                ? Math.round((memorizedCount / cards.length) * 100)
                : 0;
            const displayProgress = Number.isFinite(item.progress)
              ? item.progress
              : calcProgress;

            return {
              ...item,
              displayThumbnail:
                item.thumbnail || item.documentId?.thumbnail || PLACEHOLDER,
              displayCardCount: item.cardCount || cards.length || 0,
              displayProgress: displayProgress,
            };
          })
        : [];

      setFlashcardSets(formattedData);
    } catch (err) {
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
          const deleteUrl =
            role === "ADMIN"
              ? `/admin/flashcards/${id}`
              : `/flashcards/${id}`;
          await api.delete(deleteUrl);
          Swal.fire("Đã xóa!", "Bộ thẻ đã được gỡ bỏ.", "success");
          fetchFlashcards();
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể xóa bộ thẻ.", "error");
        }
      }
    });
  };

  const filteredData = flashcardSets.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filterStatus === "completed")
      return matchesSearch && item.displayProgress === 100;
    if (filterStatus === "uncompleted")
      return matchesSearch && item.displayProgress < 100;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterTabs = [
    { id: "all", label: "Tất cả" },
    { id: "uncompleted", label: "Chưa xong" },
    { id: "completed", label: "Đã xong" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F8F8F8] font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">

          {/* Tiêu đề lớn */}
          <h1 className="text-2xl font-black text-[#18181B] uppercase mb-5 tracking-tight">
            Thư viện Flashcards
          </h1>

          {/* Tab lọc trạng thái */}
          <div className="flex items-center gap-3 mb-6">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setFilterStatus(tab.id); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition-all border ${
                  filterStatus === tab.id
                    ? "bg-[#F26739] text-white border-[#F26739] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                {tab.id === "all" && <BarChart2 size={14} />}
                {tab.id === "uncompleted" && <Clock size={14} />}
                {tab.id === "completed" && <CheckCircle2 size={14} />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-header: label trái + search/actions phải */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[15px] font-bold text-[#18181B]">
                {filterStatus === "all"
                  ? "Tất cả Flashcard"
                  : filterStatus === "uncompleted"
                  ? "Chưa hoàn thành"
                  : "Đã hoàn thành"}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {filteredData.length} bộ thẻ
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex items-center bg-white rounded-xl px-3 h-10 gap-2 border border-gray-200 w-56 focus-within:border-orange-300 transition-all shadow-sm">
                <Search size={15} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm flashcard..."
                  className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Làm mới */}
              <button
                onClick={fetchFlashcards}
                className="flex items-center gap-1.5 px-3 h-10 bg-white border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-600 hover:bg-gray-50 shadow-sm"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Làm mới
              </button>

              {/* Thêm mới (chỉ ADMIN) */}
              {role === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin/flashcards/create")}
                  className="flex items-center gap-1.5 px-4 h-10 bg-[#F26739] text-white rounded-xl text-[12px] font-bold hover:bg-orange-600 shadow-sm"
                >
                  <Plus size={15} /> Thêm Flashcard
                </button>
              )}
            </div>
          </div>

          {/* Grid Flashcards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
                <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-sm font-bold uppercase">
                  Không tìm thấy dữ liệu
                </p>
              </div>
            ) : (
              currentItems.map((item) => {
                const isCompleted = item.displayProgress === 100;
                return (
                  <div
                    key={item._id}
                    className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Action buttons (hover) */}
                    <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {role === "ADMIN" ? (
                        <button
                          onClick={(e) => handleDeleteFlashcard(e, item._id)}
                          className="p-1.5 bg-white text-red-500 rounded-lg shadow border hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/learner/suco", {
                              state: {
                                reportTarget: "flashcards",
                                targetId: item._id,
                              },
                            });
                          }}
                          className="p-1.5 bg-white text-amber-500 rounded-lg shadow border hover:bg-amber-500 hover:text-white"
                        >
                          <AlertCircle size={13} />
                        </button>
                      )}
                    </div>

                    {/* Image */}
                    <div className="relative w-full h-44 overflow-hidden bg-gray-50">
                      <img
                        src={item.displayThumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.target.src = PLACEHOLDER)}
                      />
                      {/* Badge trạng thái */}
                      <div className="absolute top-3 left-3">
                        {isCompleted ? (
                          <div className="bg-green-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow">
                            <CheckCircle2 size={10} /> Đã xong
                          </div>
                        ) : (
                          <div className="bg-white text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border shadow">
                            <Clock size={10} className="text-orange-400" /> Đang học
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="text-[14px] font-bold mb-3 line-clamp-2 text-[#18181B] leading-snug">
                        {item.title}
                      </h3>

                      {/* Số thẻ + % */}
                      <div className="flex items-center justify-between text-[12px] mb-2">
                        <span className="text-gray-500">
                          Số thẻ:{" "}
                          <span className="text-[#F26739] font-bold">
                            {item.displayCardCount} thẻ
                          </span>
                        </span>
                        <span className={`font-bold ${isCompleted ? "text-green-500" : "text-orange-500"}`}>
                          {item.displayProgress}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-[#F26739]"}`}
                          style={{ width: `${item.displayProgress}%` }}
                        />
                      </div>

                      {/* Buttons */}
                      {role === "ADMIN" ? (
                        <>
                          <button
                            onClick={() => navigate(`/learner/flashcards/${item._id}`)}
                            className={`w-full py-2.5 rounded-xl font-bold text-[13px] text-white mb-2 transition-all ${isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-[#F26739] hover:bg-orange-600"}`}
                          >
                            {isCompleted ? "Ôn tập" : "Học ngay"}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/flashcards/edit/${item._id}`)}
                            className="w-full py-2.5 rounded-xl font-bold text-[13px] text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit size={13} /> Chỉnh sửa
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/learner/flashcards/${item._id}`)}
                          className={`w-full py-2.5 rounded-xl font-bold text-[13px] text-white transition-all ${isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-[#F26739] hover:bg-orange-600"}`}
                        >
                          {isCompleted ? "Ôn tập" : "Học ngay"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sticky Pagination */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="text-[14px] font-medium text-gray-700">
          {currentPage} trang
        </div>

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
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
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
                return (
                  <span key={page} className="text-gray-400 px-1">
                    ...
                  </span>
                );
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