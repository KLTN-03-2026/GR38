import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  BookOpen,
  Sparkles,
  PenLine,
  Library,
  Plus,
  LayoutGrid,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api";
import imagesList from "../../../images";

// ─── Constants ───────────────────────────────────────────────────────────────

const IMAGES = {
  imgKhangChien: "/anh1.jpg",
  imgThoiTienSu: "/anh2.jpg",
  imgQuanChu:    "/anh3.jpg",
  imgBacThuoc:   "/anh4.jpg",
  imgHienDai:    "/anh5.jpg",
  imgDienBienPhu:"/anh6.jpg",
};

const DEFAULT_FLASHCARD = [
  { id: "khang-chien",  title: "Kháng chiến chống mỹ",           cardCount: 10, progress: 40, image: IMAGES.imgKhangChien,  source: "default" },
  { id: "tien-su",      title: "Lịch sử Việt Nam thời tiền sử",  cardCount: 10, progress: 30, image: IMAGES.imgThoiTienSu,  source: "default" },
  { id: "quan-chu",     title: "Thời kỳ quân chủ (939 - 1945)",  cardCount: 10, progress: 45, image: IMAGES.imgQuanChu,     source: "default" },
  { id: "bac-thuoc",    title: "Thời bắc thuộc (180 TCN - 938)", cardCount: 10, progress: 20, image: IMAGES.imgBacThuoc,    source: "default" },
  { id: "hien-dai",     title: "Thời kỳ hiện đại (1858 - nay)",  cardCount: 10, progress: 60, image: IMAGES.imgHienDai,     source: "default" },
  { id: "dien-bien-phu",title: "Chiến tranh Điện Biên Phủ",      cardCount: 10, progress: 15, image: IMAGES.imgDienBienPhu, source: "default" },
];

const FILTERS = [
  { key: "all",     label: "Tất cả",   icon: <LayoutGrid size={14} strokeWidth={2} /> },
  { key: "ai",      label: "AI tạo",   icon: <Sparkles   size={14} strokeWidth={2} /> },
  { key: "custom",  label: "Tự tạo",   icon: <PenLine    size={14} strokeWidth={2} /> },
  { key: "default", label: "Mặc định", icon: <BookOpen   size={14} strokeWidth={2} /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceBadge({ source }) {
  if (source === "ai")
    return (
      <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-purple-500 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm">
        <Sparkles size={11} strokeWidth={2.5} /> AI
      </span>
    );
  if (source === "custom")
    return (
      <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-blue-500 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm">
        <PenLine size={11} strokeWidth={2.5} /> Tự tạo
      </span>
    );
  return null;
}

function ConfirmDeleteModal({ title, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[320px] p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
          <AlertTriangle size={20} className="text-red-400" strokeWidth={1.8} />
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1.5">Xoá bộ Flashcard?</p>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          Bạn có chắc muốn xoá{" "}
          <span className="font-medium text-gray-600">"{title}"</span>?<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            Huỷ
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm text-red-500 font-medium bg-red-50 border border-red-200 hover:bg-red-100 transition">
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Flashcards = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm]   = useState("");
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
      const customSets = local.map((item) => ({
        ...item,
        cardCount: Array.isArray(item.cards) ? item.cards.length : 0,
        source: "custom",
      }));

      let aiSets = [];
      try {
        const res = await api.get("/flashcards");
        const raw = res.data.data ?? res.data ?? [];
        console.log("thumbnails:", raw.map(i => ({ title: i.title, thumbnail: i.thumbnail }))); 
        console.log("isAiGenerated check:", raw.map(i => ({ title: i.title, isAiGenerated: i.isAiGenerated })));
      aiSets = raw.map((item, index) => {
  const docId = typeof item.documentId === "object" && item.documentId !== null
    ? item.documentId?._id : item.documentId;
  const cardArr = Array.isArray(item.cards) ? item.cards : [];
  return {
    id:         item._id ?? item.id,
    title:      item.title ?? item.documentTitle ?? "Flashcard AI",
    cards:      cardArr,
    cardCount:  cardArr.length || item.count || 0,
    progress:   item.progress ?? 0,
    image: item.thumbnail ?? imagesList[Math.floor(Math.random() * imagesList.length)].image,    source: item.documentId ? "ai" : "custom",  
    documentId: docId ?? null,
    createdAt:  item.createdAt,
  };
});
      } catch (err) {
        console.warn("Không tải được flashcard từ API:", err.message);
      }

      setData([...aiSets, ...customSets, ...DEFAULT_FLASHCARD]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    if (item.source === "default") { alert("Không thể xóa bộ thẻ mặc định!"); return; }
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = async () => {
    const item = deleteTarget;
    if (item.source === "custom") {
      const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
      localStorage.setItem("flashcards", JSON.stringify(local.filter((i) => String(i.id) !== String(item.id))));
    } else if (item.source === "ai") {
      try {
        await api.delete(`/flashcards/${item.id}`);
      } catch {
        alert("Lỗi xóa bộ thẻ AI, vui lòng thử lại.");
        setDeleteTarget(null);
        return;
      }
    }
    setData((prev) => prev.filter((i) => String(i.id) !== String(item.id)));
    setDeleteTarget(null);
  };

  const filteredData = data.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "all" || item.source === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen flex flex-col items-center p-8 font-['Inter']">
      <div className="w-full max-w-[1400px]">

        {/* Toolbar */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-6 flex items-center px-5 justify-between shadow-sm">
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
            className="flex items-center gap-2 bg-[#F26739] text-white text-[14px] font-semibold rounded-[6px] px-5 h-[36px] hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus size={16} /> Thêm Flashcard
          </button>
        </div>

        {/* Title */}
        <h1 className="text-center text-[36px] font-black mb-6 uppercase tracking-tight text-[#18181B]">
          Thư viện FlashCards
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-10 justify-center flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                activeFilter === f.key
                  ? "bg-[#F26739] text-white border-[#F26739]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
          <span className="px-3 py-1.5 text-sm text-gray-400">({filteredData.length} bộ)</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Đang tải...</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Library size={56} strokeWidth={1.2} className="text-gray-200" />
            <p className="text-sm text-gray-400">Không có bộ thẻ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
            {filteredData.map((item) => (
              <div
                key={`${item.source}-${item.id}`}
                className="flex flex-col group bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative w-full h-[210px] overflow-hidden rounded-[18px] mb-5 bg-gray-50 shadow-inner">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F26739] to-[#f9a87e]">
                      <span className="text-white text-[40px] font-black">{item.title?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <SourceBadge source={item.source} />
                  {item.source !== "default" && (
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
                  <h3 className="text-[19px] font-bold mb-1 h-[54px] line-clamp-2 text-[#18181B] leading-tight">{item.title}</h3>
                  {item.source === "ai" && item.createdAt && (
                    <p className="text-xs text-gray-400 mb-2">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
                  )}
                  <div className="flex items-center gap-4 mb-6 mt-2">
                    <span className="bg-[#1473E6] text-white text-[12px] px-3 py-1 rounded-full font-bold">
                      {item.cardCount ?? 0} Thẻ học
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1473E6] rounded-full transition-all duration-1000" style={{ width: `${item.progress || 0}%` }} />
                      </div>
                      <span className="text-[12px] font-bold text-gray-400">{item.progress || 0}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/teacher/flashcards/${item.id}`, { state: { fromApi: item.source === "ai", documentId: item.documentId } })}
                    className="w-full bg-[#F26739] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#d9562d] transition-colors shadow-lg active:scale-[0.97]"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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