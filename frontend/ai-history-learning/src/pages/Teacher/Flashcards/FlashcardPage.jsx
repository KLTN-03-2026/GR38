import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  BookOpen,
  Sparkles,
  PenLine,
  Library,
  Plus,
  RefreshCw,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api";
import imagesList from "../../../images";

// ─── Constants ───────────────────────────────────────────────────────────────

const IMAGES = {
  imgKhangChien: "/anh1.jpg",
  imgThoiTienSu: "/anh2.jpg",
  imgQuanChu: "/anh3.jpg",
  imgBacThuoc: "/anh4.jpg",
  imgHienDai: "/anh5.jpg",
  imgDienBienPhu: "/anh6.jpg",
};

const DEFAULT_FLASHCARD = [
  {
    id: "khang-chien",
    title: "Kháng chiến chống mỹ",
    cardCount: 10,
    progress: 40,
    image: IMAGES.imgKhangChien,
    source: "default",
    documentTitle: "Mặc định",
  },
  {
    id: "tien-su",
    title: "Lịch sử Việt Nam thời tiền sử",
    cardCount: 10,
    progress: 30,
    image: IMAGES.imgThoiTienSu,
    source: "default",
    documentTitle: "Mặc định",
  },
  {
    id: "quan-chu",
    title: "Thời kỳ quân chủ (939 - 1945)",
    cardCount: 10,
    progress: 45,
    image: IMAGES.imgQuanChu,
    source: "default",
    documentTitle: "Mặc định",
  },
  {
    id: "bac-thuoc",
    title: "Thời bắc thuộc (180 TCN - 938)",
    cardCount: 10,
    progress: 20,
    image: IMAGES.imgBacThuoc,
    source: "default",
    documentTitle: "Mặc định",
  },
  {
    id: "hien-dai",
    title: "Thời kỳ hiện đại (1858 - nay)",
    cardCount: 10,
    progress: 60,
    image: IMAGES.imgHienDai,
    source: "default",
    documentTitle: "Mặc định",
  },
  {
    id: "dien-bien-phu",
    title: "Chiến tranh Điện Biên Phủ",
    cardCount: 10,
    progress: 15,
    image: IMAGES.imgDienBienPhu,
    source: "default",
    documentTitle: "Mặc định",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        <p className="text-sm font-semibold text-gray-800 mb-1.5">
          Xoá bộ Flashcard?
        </p>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          Bạn có chắc muốn xoá{" "}
          <span className="font-medium text-gray-600">"{title}"</span>?<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm text-red-500 font-medium bg-red-50 border border-red-200 hover:bg-red-100 transition"
          >
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

  // Tab: "tai-lieu" | "thu-cong" | "tat-ca"
  const [activeTab, setActiveTab] = useState("tai-lieu");

  // All raw data
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sidebar state
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Right-panel state
  const [rightSearch, setRightSearch] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  // Reset selectedDoc when switching tabs
  useEffect(() => {
    setSelectedDoc(null);
  }, [activeTab]);

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadAll = async () => {
  try {
    setLoading(true);
    const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
     console.log("local flashcards:", local);

    let aiSets = [];
    const apiIds = new Set();
    try {
      const res = await api.get("/flashcards");
      const raw = res.data.data ?? res.data ?? [];
      aiSets = raw.map((item) => {
        const docId =
          typeof item.documentId === "object" && item.documentId !== null
            ? item.documentId?._id
            : item.documentId;
        const cardArr = Array.isArray(item.cards) ? item.cards : [];
        apiIds.add(String(item._id ?? item.id));
        return {
          id: item._id ?? item.id,
          title: item.title ?? item.documentTitle ?? "Flashcard AI",
          cards: cardArr,
          cardCount: cardArr.length || item.count || 0,
          progress: item.progress ?? 0,
          image: item.thumbnail ?? imagesList[item._id?.charCodeAt(0) % imagesList.length].image,
          source: docId ? "ai" : "custom",
          documentId: docId ?? null,
          documentTitle: item.documentTitle ?? item.title ?? "Tài liệu AI",
          createdAt: item.createdAt,
        };
      });
    } catch (err) {
      console.warn("Không tải được flashcard từ API:", err.message);
    }

    // Chỉ giữ local item nào chưa có trong API
  const customSets = local
  .filter((item) => !apiIds.has(String(item.id)))
  .map((item) => ({
    ...item,
    cardCount: Array.isArray(item.cards) ? item.cards.length : 0,
    source: "custom",
    documentTitle: "Tự tạo",
    image: item.thumbnail ?? null, 
  }));

    setAllData([...aiSets, ...customSets, ...DEFAULT_FLASHCARD]);
  } finally {
    setLoading(false);
  }
};

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    if (item.source === "default") {
      alert("Không thể xóa bộ thẻ mặc định!");
      return;
    }
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = async () => {
    const item = deleteTarget;

    if (item.source === "default") {
      setDeleteTarget(null);
      return;
    }
    try {
      await api.delete(`/flashcards/${item.id}`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) alert("Bạn không có quyền xóa bộ thẻ này.");
      else if (status === 404) alert("Không tìm thấy bộ thẻ.");
      else alert("Lỗi xóa, vui lòng thử lại.");
      setDeleteTarget(null);
      return;
    }
    const local = JSON.parse(localStorage.getItem("flashcards") || "[]");
    localStorage.setItem(
      "flashcards",
      JSON.stringify(local.filter((i) => String(i.id) !== String(item.id))),
    );
    setAllData((prev) => prev.filter((i) => String(i.id) !== String(item.id)));
    setDeleteTarget(null);
  };

  // ── Derived data ─────────────────────────────────────────────────────────────

  // Pool of cards based on active tab
  const tabPool = React.useMemo(() => {
    if (activeTab === "tai-lieu")
      return allData.filter((i) => i.source === "ai" || i.source === "default");
    if (activeTab === "thu-cong")
      return allData.filter((i) => i.source === "custom");
    // "tat-ca" = everything
    return allData;
  }, [allData, activeTab]);

  // Sidebar document groups (only for "tai-lieu" and "tat-ca" tabs)
  const sidebarDocs = React.useMemo(() => {
    if (activeTab === "thu-cong") return [];

    const map = new Map();
    tabPool.forEach((item) => {
      if (item.source === "ai") {
        const key = item.documentTitle ?? "Tài liệu AI";
        if (!map.has(key)) {
          map.set(key, {
            title: key,
            documentId: item.documentId,
            count: 0,
            createdAt: item.createdAt,
          });
        }
        map.get(key).count += 1;
      }
    });

    const result = Array.from(map.values());

    if (activeTab === "tat-ca") {
      const customCount = tabPool.filter((i) => i.source === "custom").length;
      const defaultCount = tabPool.filter((i) => i.source === "default").length;
      if (customCount)
        result.push({
          title: "Tự tạo",
          documentId: "__custom__",
          count: customCount,
          createdAt: null,
        });
      if (defaultCount)
        result.push({
          title: "Mặc định",
          documentId: "__default__",
          count: defaultCount,
          createdAt: null,
        });
    } else {
      // tai-lieu tab: show default group
      const defaultCount = tabPool.filter((i) => i.source === "default").length;
      if (defaultCount)
        result.push({
          title: "Mặc định",
          documentId: "__default__",
          count: defaultCount,
          createdAt: null,
        });
    }

    return result;
  }, [tabPool, activeTab]);

  const filteredSidebarDocs = sidebarDocs.filter((d) =>
    d.title.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );

  // Cards shown on the right panel
  const rightCards = React.useMemo(() => {
    let cards = tabPool;

    if (selectedDoc) {
      if (selectedDoc.documentId === "__custom__")
        cards = tabPool.filter((i) => i.source === "custom");
      else if (selectedDoc.documentId === "__default__")
        cards = tabPool.filter((i) => i.source === "default");
      else
        cards = tabPool.filter(
          (i) => i.documentTitle === selectedDoc.title && i.source === "ai",
        );
    }

    if (rightSearch)
      cards = cards.filter((i) =>
        i.title.toLowerCase().includes(rightSearch.toLowerCase()),
      );
    return cards;
  }, [tabPool, selectedDoc, rightSearch]);

  // Determine right panel heading
  const rightHeading = selectedDoc
    ? selectedDoc.title
    : activeTab === "tai-lieu"
      ? "Theo tài liệu"
      : activeTab === "thu-cong"
        ? "Thủ công"
        : "Tất cả Flashcard";

  // Show sidebar only when tab is "tai-lieu" or "tat-ca"
  const showSidebar = activeTab !== "thu-cong";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] p-8 font-['Inter']">
      {/* Page title */}
      <h1 className="text-[28px] font-black mb-5 uppercase tracking-tight text-[#18181B]">
        Thư Viện Flashcards
      </h1>

      {/* ── Tab bar (same style as Quizzes) ── */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("tai-lieu")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
            activeTab === "tai-lieu"
              ? "bg-[#F26739] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FileText size={15} />
          Theo tài liệu
        </button>
        <button
          onClick={() => setActiveTab("thu-cong")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
            activeTab === "thu-cong"
              ? "bg-[#F26739] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <PenLine size={15} />
          Thủ công
        </button>
        <button
          onClick={() => setActiveTab("tat-ca")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
            activeTab === "tat-ca"
              ? "bg-[#F26739] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Library size={15} />
          Tất cả
        </button>
      </div>

      <div className="flex gap-5 flex-1">
        {/* ── Sidebar (hidden on "Thủ công" tab) ── */}
        {showSidebar && (
          <div className="w-[260px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm h-fit">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Chọn tài liệu
            </p>

            {/* Sidebar search */}
            <div className="flex items-center bg-[#F9F9F9] border border-gray-200 rounded-lg px-3 h-9 gap-2 mb-4">
              <Search size={13} className="text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tài liệu..."
                className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </div>

            {/* "Tất cả" option */}
            <button
              onClick={() => setSelectedDoc(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${
                selectedDoc === null
                  ? "bg-orange-50 border border-orange-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${selectedDoc === null ? "bg-[#F26739]" : "bg-gray-100"}`}
              >
                <Library
                  size={13}
                  className={
                    selectedDoc === null ? "text-white" : "text-gray-400"
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-semibold truncate ${selectedDoc === null ? "text-[#F26739]" : "text-gray-700"}`}
                >
                  Tất cả
                </p>
              </div>
              {selectedDoc === null && (
                <div className="w-2 h-2 rounded-full bg-[#F26739] shrink-0" />
              )}
            </button>

            {/* Document list */}
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              filteredSidebarDocs.map((doc) => {
                const isSelected = selectedDoc?.documentId === doc.documentId;
                return (
                  <button
                    key={doc.documentId}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${
                      isSelected
                        ? "bg-orange-50 border border-orange-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-[#F26739]" : "bg-gray-100"}`}
                    >
                      <BookOpen
                        size={13}
                        className={isSelected ? "text-white" : "text-gray-400"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] font-semibold truncate ${isSelected ? "text-[#F26739]" : "text-gray-700"}`}
                      >
                        {doc.title}
                      </p>
                      {doc.createdAt && (
                        <p className="text-[11px] text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#F26739] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* ── Right panel ── */}
        <div className="flex-1 min-w-0">
          {/* Right panel header */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div>
              <p className="text-[17px] font-bold text-[#18181B]">
                {rightHeading}
              </p>
              <p className="text-[13px] text-gray-400">
                {rightCards.length} bộ thẻ
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Right search */}
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 h-9 gap-2 w-[200px]">
                <Search size={13} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm flashcard..."
                  className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
                  value={rightSearch}
                  onChange={(e) => setRightSearch(e.target.value)}
                />
              </div>
              {/* Làm mới */}
              <button
                onClick={loadAll}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                <RefreshCw size={13} /> Làm mới
              </button>
              {/* Thêm */}
              <button
                onClick={() => navigate("/teacher/flashcards/add")}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#F26739] text-white text-[13px] font-bold hover:bg-orange-600 transition shadow-sm"
              >
                <Plus size={14} /> Thêm Flashcard
              </button>
            </div>
          </div>

          {/* Cards grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400">Đang tải...</p>
              </div>
            </div>
          ) : rightCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-dashed border-gray-200">
              <Library size={48} strokeWidth={1.2} className="text-gray-200" />
              <p className="text-sm text-gray-400">Không có bộ thẻ nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {rightCards.map((item) => (
                <div
                  key={`${item.source}-${item.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-[160px] bg-gray-100 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F26739] to-[#f9a87e]">
                        <span className="text-white text-[36px] font-black">
                          {item.title?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Source badge */}
                    {item.source === "ai" && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        <Sparkles size={9} strokeWidth={2.5} /> AI
                      </span>
                    )}
                    {item.source === "custom" && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        <PenLine size={9} strokeWidth={2.5} /> Tự tạo
                      </span>
                    )}

                    {/* Delete button */}
                    {item.source !== "default" && (
                      <button
                        onClick={(e) => handleDeleteClick(e, item)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="text-[14px] font-bold text-[#18181B] line-clamp-2 leading-snug mb-2 min-h-[40px]">
                      {item.title}
                    </h3>

                    <p className="text-[12px] font-bold text-[#1473E6] mb-4">
                      Số thẻ:{" "}
                      <span className="text-[#F26739]">
                        {item.cardCount ?? 0} thẻ
                      </span>
                    </p>

                    {/* Actions */}
                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        onClick={() =>
                          navigate(`/teacher/flashcards/${item.id}`, {
                            state: {
                              fromApi: item.source === "ai",
                              documentId: item.documentId,
                            },
                          })
                        }
                        className="w-full bg-[#F26739] text-white py-2 rounded-xl font-bold text-[13px] hover:bg-[#d9562d] transition-colors"
                      >
                        Học ngay
                      </button>
                      {item.source !== "default" && (
                        <button
                          onClick={() =>
                            navigate(`/teacher/flashcards/edit/${item.id}`, {
                              state: { item },
                            })
                          }
                          className="w-full py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5 font-medium"
                        >
                          <PenLine size={12} /> Chỉnh sửa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete modal */}
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
