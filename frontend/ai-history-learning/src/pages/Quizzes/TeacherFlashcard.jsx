import React, { useState, useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import imgKhangChien from "../../assets/khangchienchongmy.webp";
import imgThoiTienSu from "../../assets/thoitiensu.jpg";
import imgQuanChu from "../../assets/thoikyquanchu.jpg";
import imgBacThuoc from "../../assets/thoikybatthuoc.webp";
import imgHienDai from "../../assets/thoikyhiendai.webp";
import imgDienBienPhu from "../../assets/Chien-Thang-Dien-Bie.jpg";

const DEFAULT_FLASHCARD = [
  { id: "khang-chien", title: "Kháng chiến chống mỹ", cards: 10, progress: 40, image: imgKhangChien },
  { id: "tien-su", title: "Lịch sử Việt Nam thời tiền sử", cards: 10, progress: 30, image: imgThoiTienSu },
  { id: "quan-chu", title: "Thời kỳ quân chủ (939 - 1945)", cards: 10, progress: 45, image: imgQuanChu },
  { id: "bac-thuoc", title: "Thời bắc thuộc (180 TCN - 938)", cards: 10, progress: 20, image: imgBacThuoc },
  { id: "hien-dai", title: "Thời kỳ hiện đại (1858 - nay)", cards: 10, progress: 60, image: imgHienDai },
  { id: "dien-bien-phu", title: "Chiến tranh Điện Biên Phủ", cards: 10, progress: 15, image: imgDienBienPhu },
];

// ─── CONFIRM DELETE MODAL ─────────────────────────────────────────────────────
const ConfirmDeleteModal = ({ title, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)", animation: "fadeIn 0.18s ease both" }}
    onClick={onCancel}
  >
    <style>{`
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    `}</style>
    <div
      className="bg-white rounded-2xl shadow-xl w-[320px] p-7 text-center"
      style={{ animation: "scaleIn 0.22s cubic-bezier(.4,0,.2,1) both" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Icon */}
      <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </div>

      <p className="text-sm font-semibold text-gray-800 mb-1.5">Xoá bộ Flashcard?</p>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        Bạn có chắc muốn xoá{" "}
        <span className="font-medium text-gray-600">"{title}"</span>?<br />
        Hành động này không thể hoàn tác.
      </p>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Huỷ
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm text-red-500 font-medium transition-colors"
          style={{ background: "#fff1f1", border: "1px solid #fecaca" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe4e4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff1f1")}
        >
          Xoá
        </button>
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Flashcards = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
    // ✅ FIX: normalize cards từ array [{front,back}] thành number
    const normalized = local.map((item) => ({
      ...item,
      cards: Array.isArray(item.cards) ? item.cards.length : (item.cards || 0),
    }));
    setData([...normalized, ...DEFAULT_FLASHCARD]);
  }, []);

  // ✅ Mở modal xác nhận xóa
  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    if (!String(item.id).startsWith("custom-")) {
      alert("Không thể xóa bộ thẻ mặc định!");
      return;
    }
    setDeleteTarget({ id: item.id, title: item.title });
  };

  // ✅ Xác nhận xóa
  const handleDeleteConfirm = () => {
    const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
    const updated = local.filter((item) => String(item.id) !== String(deleteTarget.id));
    localStorage.setItem("flashcards", JSON.stringify(updated));
    setData((prev) => prev.filter((item) => String(item.id) !== String(deleteTarget.id)));
    setDeleteTarget(null);
  };

  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen flex flex-col items-center p-8 font-['Inter']">
      <div className="w-full max-w-[1400px]">

        {/* SEARCH + BUTTON */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-10 flex items-center px-5 justify-between shadow-sm">
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
          <button
            onClick={() => navigate("/teacher/flashcards/add")}
            className="bg-[#F26739] text-white text-[14px] font-semibold rounded-[6px] px-6 h-[36px] hover:bg-orange-600 transition-colors shadow-sm"
          >
            + Thêm Flashcard
          </button>
        </div>

        <h1 className="text-center text-[36px] font-black mb-14 uppercase tracking-tight text-[#18181B]">
          Thư viện FlashCards
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col group bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Ảnh + nút xóa */}
              <div className="relative w-full h-[210px] overflow-hidden rounded-[18px] mb-5 bg-gray-50 shadow-inner">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F26739] to-[#f9a87e]">
                    <span className="text-white text-[40px] font-black">
                      {item.title?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Nút xóa — chỉ hiện với bộ do teacher tạo */}
                {String(item.id).startsWith("custom-") && (
                  <button
                    onClick={(e) => handleDeleteClick(e, item)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa bộ thẻ"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="px-2">
                <h3 className="text-[19px] font-bold mb-4 h-[54px] line-clamp-2 text-[#18181B] leading-tight">
                  {item.title}
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-[#1473E6] text-white text-[12px] px-3 py-1 rounded-full font-bold">
                    {item.cards || item.total || 0} Thẻ học
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1473E6] rounded-full transition-all duration-1000"
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-bold text-gray-400">
                      {item.progress || 0}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/teacher/flashcards/${item.id}`)}
                  className="w-full bg-[#F26739] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#d9562d] transition-colors shadow-lg active:scale-[0.97]"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Flashcards;