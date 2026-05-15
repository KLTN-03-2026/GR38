import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import api from "../../lib/api";
import Swal from "sweetalert2";
import BannerImg from "@/assets/img/Chien-Thang-Dien-Bie.jpg";

const Documents = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/documents");
      let finalData = [];
      if (res?.data?.success && Array.isArray(res.data.data)) {
        finalData = res.data.data;
      } else if (res?.success && Array.isArray(res.data)) {
        finalData = res.data;
      } else if (Array.isArray(res)) {
        finalData = res;
      }
      setAllDocuments(finalData);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Phiên đăng nhập đã hết hạn."
          : "Không thể hiển thị tài liệu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDeleteDocument = (e, id) => {
    e.stopPropagation();
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Tài liệu này sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteUrl =
            role === "ADMIN" ? `/admin/documents/${id}` : `/documents/${id}`;
          await api.delete(deleteUrl);
          Swal.fire("Đã xóa!", "Tài liệu đã được gỡ bỏ.", "success");
          fetchDocuments();
        } catch (error) {
          Swal.fire(
            "Lỗi!",
            "Bạn không có quyền xóa tài liệu của người khác hoặc tài liệu không tồn tại.",
            "error"
          );
        }
      }
    });
  };

  const filteredDocs = allDocuments.filter((doc) =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const currentItems = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-red-100 p-6 md:p-10 mx-auto w-full max-w-[1400px]">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Thông báo</h2>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
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
    <div className="flex flex-col w-full min-h-screen bg-[#F8F8F8]">

     {/* BANNER COVER */}
<div className="relative rounded-md w-full h-[320px] md:h-[400px] overflow-hidden">
  <img
    src={BannerImg}
    alt="Chiến Thắng Điện Biên Phủ"
    className="w-full h-full object-cover object-center"
  />
  {/* Overlay gradient */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
  {/* Text overlay */}
  <div className="absolute bottom-6 left-8">
    <h1 className="text-white text-2xl md:text-3xl font-black uppercase tracking-wide drop-shadow-lg">
      Tài liệu học tập
    </h1>
    <p className="text-white/80 text-sm mt-1 drop-shadow">
      Khám phá lịch sử Việt Nam qua các bài học
    </p>
  </div>
</div>
      {/* NỘI DUNG */}
      <div className="bg-white flex flex-col gap-[15px] w-full max-w-[1400px] min-h-[600px] mx-auto p-[12px] md:p-[20px]">

        {/* SEARCH */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu học tập..."
              className="w-full pl-9 pr-4 py-1.5 rounded-md outline-none bg-gray-50 focus:bg-white border border-transparent focus:border-orange-500 text-[13px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="w-full sm:w-auto bg-orange-500 text-white px-5 py-1.5 rounded-md font-medium hover:bg-orange-600 transition text-[13px]">
            Tìm kiếm
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px] w-full flex-1">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-orange-500 w-8 h-8 mb-2" />
              <span className="font-medium text-[14px] text-gray-500">
                Đang truy xuất dữ liệu...
              </span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center px-4">
              <p className="text-[14px]">Hiện chưa có tài liệu nào khả dụng.</p>
            </div>
          ) : (
            currentItems.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-[8px] flex flex-col p-[10px] gap-[10px] shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group h-fit relative"
                onClick={() => {
                  const basePath = role === "ADMIN" ? "/admin" : "/learner";
                  navigate(`${basePath}/documents/${doc._id}`);
                }}
              >
                {role === "ADMIN" && (
                  <button
                    onClick={(e) => handleDeleteDocument(e, doc._id)}
                    className="absolute top-3 left-3 z-20 p-1.5 bg-white/90 hover:bg-red-500 rounded-full text-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                    title="Xóa tài liệu này"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {role !== "ADMIN" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/learner/suco", {
                        state: { reportTarget: "tài liệu", targetId: doc._id },
                      });
                    }}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-white/80 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors border border-gray-100"
                    title="Báo cáo lỗi tài liệu này"
                  >
                    <AlertCircle size={16} />
                  </button>
                )}

                <div className="w-full h-[120px] rounded-[6px] bg-gray-100 overflow-hidden flex items-center justify-center">
                  {doc.thumbnail || doc.image ? (
                    <img
                      src={doc.thumbnail || doc.image}
                      alt={doc.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <span className="text-orange-400 text-[10px] font-semibold">
                        Lịch sử Việt Nam
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-[15px] text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {doc.title}
                  </h3>
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="px-2 py-0.5 bg-blue-500 rounded-full text-white text-[9px] font-bold uppercase">
                      Bài học
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {doc.flashcardCount || 0} Flashcards
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {doc.quizCount || 0} Quizzes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row items-center justify-between px-2 py-3 border-t border-gray-50 mt-auto gap-3">
          <span className="text-[13px] text-gray-500 font-medium order-2 md:order-1">
            {currentPage} / {totalPages} trang
          </span>
          <div className="flex items-center gap-1 order-1 md:order-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="flex items-center gap-1 px-2 py-1 text-[13px] font-semibold text-gray-500 hover:text-orange-500 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`min-w-[28px] h-7 rounded text-[13px] font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center gap-1 px-2 py-1 text-[13px] font-semibold text-gray-500 hover:text-orange-500 disabled:opacity-30"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Documents;