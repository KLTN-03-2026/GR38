import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
  Edit,
  Plus, // Thêm icon Plus nếu cần
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

  // Tăng số lượng item mỗi trang vì card đã nhỏ hơn (8 hoặc 12 là con số đẹp cho grid 4 cột)
  const itemsPerPage = 8;

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const res = await api.get("/flashcards");
      const data = res?.data?.data || res?.data || res || [];
      setFlashcardSets(Array.isArray(data) ? data : []);
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
          await api.delete(`/flashcards/${id}`);
          Swal.fire("Đã xóa!", "Bộ thẻ đã được gỡ bỏ.", "success");
          fetchFlashcards();
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể xóa bộ thẻ.", "error");
        }
      }
    });
  };

  const filteredData = flashcardSets.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex-1 bg-[#FDFDFD] min-h-screen p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        {/* Thanh công cụ nhỏ gọn hơn */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center bg-[#F4F4F5] rounded-lg px-3 h-9 w-full max-w-sm gap-2">
            <Search size={14} className="text-gray-400" />
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

          {role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin/flashcards/create")}
              className="bg-[#F26739] text-white text-[12px] font-bold rounded-lg px-4 h-9 flex items-center gap-2 hover:bg-orange-600 transition-all shadow-sm"
            >
              <Plus size={16} /> Tạo bộ thẻ mới
            </button>
          )}
        </div>

        <h2 className="text-xl font-black mb-6 text-[#18181B] border-l-4 border-[#F26739] pl-3">
          THƯ VIỆN FLASHCARDS
        </h2>

        {/* Grid 4 cột trên màn hình lớn, card nhỏ hơn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-orange-500 w-6 h-6" />
              <p className="text-gray-400 text-xs">Đang tải dữ liệu...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 text-xs uppercase font-medium">
              Trống
            </div>
          ) : (
            currentItems.map((item) => (
              <div
                key={item._id}
                className="group relative flex flex-col bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Nút chức năng nhỏ gọn */}
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {role === "ADMIN" ? (
                    <button
                      onClick={(e) => handleDeleteFlashcard(e, item._id)}
                      className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm border border-red-50 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
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
                      className="p-1.5 bg-white text-gray-400 rounded-lg shadow-sm border border-gray-50 hover:text-red-500"
                    >
                      <AlertCircle size={14} />
                    </button>
                  )}
                </div>

                {/* Thumbnail nhỏ lại */}
                <div className="w-full h-[120px] overflow-hidden rounded-xl mb-3 bg-gray-50">
                  <img
                    src={item.thumbnail || item.image || PLACEHOLDER}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => (e.target.src = PLACEHOLDER)}
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <h3 className="text-[14px] font-bold mb-2 line-clamp-2 text-[#18181B] h-10 leading-tight">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-[#1473E6] bg-blue-50 px-2 py-0.5 rounded">
                      {item.cards?.length || 0} thẻ
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Tiến độ: {item.progress || 0}%
                    </span>
                  </div>

                  {role === "ADMIN" ? (
                    <button
                      onClick={() =>
                        navigate(`/admin/flashcards/edit/${item._id}`)
                      }
                      className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-bold text-[12px] hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        navigate(`/learner/flashcards/${item._id}`)
                      }
                      className="w-full bg-[#F26739] text-white py-2 rounded-lg font-bold text-[12px] hover:bg-[#d9562d] transition-all active:scale-95"
                    >
                      Học ngay
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Phân trang tinh gọn */}
        {!loading && totalPages > 1 && (
          <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 gap-4">
            <span className="text-[12px] text-gray-500 font-medium">
              Hiển thị {currentItems.length}/{filteredData.length} bộ thẻ
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Chỉ hiển thị trang đầu, cuối và quanh trang hiện tại
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${
                          currentPage === page
                            ? "bg-[#F26739] text-white shadow-md shadow-orange-200"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="text-gray-300">
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
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
