import React, { useState, useEffect } from "react";
import { Search, Trash2, BookOpen, Sparkles, PenLine, Library, Plus, RefreshCw, AlertTriangle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { flashcardService } from "@/services/flashcardSevice";
import imagesList from "../../../images";

const ITEMS_PER_PAGE = 8;
const SIDEBAR_PER_PAGE = 4;

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
  return [1, "...", current-1, current, current+1, "...", total];
}

function ConfirmDeleteModal({ title, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-[320px] p-7 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
          <AlertTriangle size={20} className="text-red-400" strokeWidth={1.8} />
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1.5">Xoá bộ Flashcard?</p>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          Bạn có chắc muốn xoá <span className="font-medium text-gray-600">"{title}"</span>?<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Huỷ</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm text-red-500 font-medium bg-red-50 border border-red-200 hover:bg-red-100 transition">Xoá</button>
        </div>
      </div>
    </div>
  );
}

const Flashcards = () => {
  const navigate = useNavigate();
  const basePath = (() => {
    try { return (JSON.parse(localStorage.getItem("user") || "{}").role || "").toUpperCase() === "ADMIN" ? "/admin" : "/teacher"; }
    catch { return "/teacher"; }
  })();
  const [activeTab, setActiveTab] = useState("tat-ca");
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rightSearch, setRightSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { setSelectedDoc(null); setCurrentPage(1); setSidebarPage(1); }, [activeTab]);
  useEffect(() => { setCurrentPage(1); }, [rightSearch, selectedDoc]);
  useEffect(() => { setSidebarPage(1); }, [sidebarSearch]);

  const loadAll = async () => {
  try {
    setLoading(true);
    const res = await flashcardService.getAll();
    const raw = res?.data ?? res ?? [];
    const list = Array.isArray(raw) ? raw : [];

    setAllData(list.map((item) => {
      const docId = typeof item.documentId === "object" && item.documentId !== null
        ? item.documentId?._id : item.documentId;
      const cardArr = Array.isArray(item.cards) ? item.cards : [];
      return {
        id: item._id ?? item.id,
        title: item.title ?? item.documentTitle ?? "Flashcard AI",
        cards: cardArr,
        cardCount: cardArr.length || item.cardCount || item.totalCards || item.count || 0,
        progress: item.progress ?? 0,
        image: item.thumbnail ?? null,
        source: item.isAiGenerated ? "ai" : "custom",
        documentId: docId ?? null,
        documentTitle: item.documentTitle ?? item.title ?? "Tài liệu AI",
        createdAt: item.createdAt,
      };
    }));
  } finally {
    setLoading(false);
  }
};

  const handleDeleteClick = (e, item) => { e.stopPropagation(); setDeleteTarget(item); };

  const handleDeleteConfirm = async () => {
    const item = deleteTarget;
    try {
      await flashcardService.delete(item.id);
    } catch (err) {
      const status = err.response?.status;
      alert(status === 403 ? "Bạn không có quyền xóa bộ thẻ này."
        : status === 404 ? "Không tìm thấy bộ thẻ."
        : "Lỗi xóa, vui lòng thử lại.");
      setDeleteTarget(null);
      return;
    }
    setAllData((prev) => prev.filter((i) => String(i.id) !== String(item.id)));
    setDeleteTarget(null);
  };

  const tabPool = React.useMemo(() => {
    if (activeTab === "tai-lieu") return allData.filter((i) => i.source === "ai");
    if (activeTab === "thu-cong") return allData.filter((i) => i.source === "custom");
    return allData;
  }, [allData, activeTab]);

  const sidebarDocs = React.useMemo(() => {
    const map = new Map();
    tabPool.forEach((item) => {
      if (item.source === "ai") {
        const key = item.documentTitle ?? "Tài liệu AI";
        if (!map.has(key)) map.set(key, { title: key, documentId: item.documentId, count: 0, createdAt: item.createdAt });
        map.get(key).count += 1;
      }
    });
    return Array.from(map.values());
  }, [tabPool]);

  const filteredSidebarDocs = sidebarDocs.filter((d) =>
    d.title.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const totalSidebarPages = Math.max(1, Math.ceil(filteredSidebarDocs.length / SIDEBAR_PER_PAGE));
  const pagedSidebarDocs  = filteredSidebarDocs.slice((sidebarPage - 1) * SIDEBAR_PER_PAGE, sidebarPage * SIDEBAR_PER_PAGE);

  const rightCards = React.useMemo(() => {
    let cards = tabPool;
    if (selectedDoc) cards = tabPool.filter((i) => i.documentTitle === selectedDoc.title && i.source === "ai");
    if (rightSearch) cards = cards.filter((i) => i.title.toLowerCase().includes(rightSearch.toLowerCase()));
    return cards;
  }, [tabPool, selectedDoc, rightSearch]);

  const totalPages = Math.max(1, Math.ceil(rightCards.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageNums   = getPageNumbers(safePage, totalPages);
  const pagedCards = rightCards.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handlePageChange = (p) => {
    if (typeof p !== "number" || p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo(0, 0);
  };

  const rightHeading = selectedDoc ? selectedDoc.title
    : activeTab === "tai-lieu" ? "Theo tài liệu"
    : activeTab === "thu-cong" ? "Thủ công"
    : "Tất cả Flashcard";

  const showSidebar = activeTab === "tai-lieu";

  const TABS = [
    { key: "tat-ca",   icon: <Library size={15} />,  label: "Tất cả" },
    { key: "tai-lieu", icon: <FileText size={15} />, label: "Theo tài liệu" },
    { key: "thu-cong", icon: <PenLine size={15} />,  label: "Thủ công" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] p-8 font-['Inter']">
      <h1 className="text-[28px] font-black mb-5 uppercase tracking-tight text-[#18181B]">Thư Viện Flashcards</h1>

      {/* Tab bar */}
      <div className="flex items-center gap-2 mb-6">
        {TABS.map(({ key, icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
              activeTab === key ? "bg-[#F26739] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {icon}{label}
          </button>
        ))}
      </div>

      <div className="flex gap-5 flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-[260px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm h-fit sticky top-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Chọn tài liệu</p>
            <div className="flex items-center bg-[#F9F9F9] border border-gray-200 rounded-lg px-3 h-9 gap-2 mb-3">
              <Search size={13} className="text-gray-400" />
              <input type="text" placeholder="Tìm tài liệu..." value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700" />
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredSidebarDocs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có tài liệu</p>
            ) : (
              <>
                {pagedSidebarDocs.map((doc) => {
                  const isSelected = selectedDoc?.documentId === doc.documentId;
                  return (
                    <button key={doc.documentId} onClick={() => setSelectedDoc(isSelected ? null : doc)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${
                        isSelected ? "bg-orange-50 border border-orange-200" : "hover:bg-gray-50"
                      }`}>
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-[#F26739]" : "bg-gray-100"}`}>
                        <BookOpen size={13} className={isSelected ? "text-white" : "text-gray-400"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold truncate ${isSelected ? "text-[#F26739]" : "text-gray-700"}`}>{doc.title}</p>
                        {doc.createdAt && <p className="text-[11px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString("vi-VN")}</p>}
                      </div>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#F26739] shrink-0" />}
                    </button>
                  );
                })}

                {/* Sidebar pagination */}
                {totalSidebarPages > 1 && (
                  <div className="flex items-center justify-between px-1 pt-3 border-t border-gray-100 mt-2">
                    <button onClick={() => setSidebarPage(p => Math.max(1, p - 1))} disabled={sidebarPage === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-400 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                      <ChevronLeft size={14}/>
                    </button>
                    <span className="text-[11px] font-semibold text-gray-500">
                      <span className="text-[#F26739]">{sidebarPage}</span> / {totalSidebarPages}
                    </span>
                    <button onClick={() => setSidebarPage(p => Math.min(totalSidebarPages, p + 1))} disabled={sidebarPage === totalSidebarPages}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-400 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                      <ChevronRight size={14}/>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div>
              <p className="text-[17px] font-bold text-[#18181B]">{rightHeading}</p>
              <p className="text-[13px] text-gray-400">{rightCards.length} bộ thẻ</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 h-9 gap-2 w-[200px]">
                <Search size={13} className="text-gray-400" />
                <input type="text" placeholder="Tìm flashcard..." value={rightSearch}
                  onChange={(e) => setRightSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700" />
              </div>
              <button onClick={loadAll} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-600 hover:bg-gray-50 transition font-medium">
                <RefreshCw size={13} /> Làm mới
              </button>
              <button onClick={() => navigate(`${basePath}/flashcards/add`)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#F26739] text-white text-[13px] font-bold hover:bg-orange-600 transition shadow-sm">
                <Plus size={14} /> Thêm Flashcard
              </button>
            </div>
          </div>

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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pagedCards.map((item) => (
                  <div key={`${item.source}-${item.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                    <div className="relative w-full h-[160px] bg-gray-100 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F26739] to-[#f9a87e]">
                          <span className="text-white text-[36px] font-black">{item.title?.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
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
                      <button onClick={(e) => handleDeleteClick(e, item)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex flex-col flex-1 p-4">
                      <h3 className="text-[14px] font-bold text-[#18181B] line-clamp-2 leading-snug mb-2 min-h-[40px]">{item.title}</h3>
                      <p className="text-[12px] font-bold text-[#1473E6] mb-4">
                        Số thẻ: <span className="text-[#F26739]">{item.cardCount ?? 0} thẻ</span>
                      </p>
                      <div className="mt-auto flex flex-col gap-2">
                        <button onClick={() => navigate(`${basePath}/flashcards/${item.id}`, { state: { fromApi: item.source === "ai", documentId: item.documentId } })}
                          className="w-full bg-[#F26739] text-white py-2 rounded-xl font-bold text-[13px] hover:bg-[#d9562d] transition-colors">
                          Học ngay
                        </button>
                        <button onClick={() => navigate(`${basePath}/flashcards/edit/${item.id}`, { state: { item } })}
                          className="w-full py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5 font-medium">
                          <PenLine size={12} /> Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <span className="text-xs text-gray-500">
                    Hiển thị {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, rightCards.length)} / {rightCards.length} bộ thẻ
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handlePageChange(safePage - 1)} disabled={safePage === 1}
                      className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      <ChevronLeft size={14} />
                    </button>
                    {pageNums.map((p, i) =>
                      p === "..." ? (
                        <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                      ) : (
                        <button key={p} onClick={() => handlePageChange(p)}
                          className={`w-8 h-8 text-xs rounded-lg border font-medium transition ${
                            safePage === p ? "bg-[#F26739] text-white border-[#F26739] shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}>{p}</button>
                      )
                    )}
                    <button onClick={() => handlePageChange(safePage + 1)} disabled={safePage === totalPages}
                      className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {deleteTarget && <ConfirmDeleteModal title={deleteTarget.title} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
};
export default Flashcards;