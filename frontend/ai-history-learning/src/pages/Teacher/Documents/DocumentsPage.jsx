// DocumentsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../../../services/DocumentService";

const banners = ["/anh6.jpg", "/anh1.jpg", "/anh2.jpg", "/anh3.jpg"];

const STYLES = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bannerSlideIn {
  from { opacity: 0; transform: scale(1.04); }
  to   { opacity: 1; transform: scale(1); }
}
.doc-card { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.doc-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.10); }
.doc-card { transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease; }
.doc-card .card-img { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); }
.doc-card:hover .card-img { transform: scale(1.05); }
.doc-card .delete-btn { opacity: 0; transform: scale(0.8); transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.15s; }
.doc-card:hover .delete-btn { opacity: 1; transform: scale(1); }
.banner-img { animation: bannerSlideIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }
.modal-overlay { animation: fadeIn 0.2s ease both; }
.modal-box { animation: scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
.tag-chip { transition: background 0.15s, color 0.15s, transform 0.15s; }
.tag-chip:hover { transform: scale(1.06); }
.search-bar { transition: box-shadow 0.2s, border-color 0.2s; }
.search-bar:focus-within { box-shadow: 0 0 0 3px rgba(242,103,57,0.12); border-color: #F26739 !important; }
.btn-primary { transition: background 0.18s, transform 0.15s, box-shadow 0.18s; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(242,103,57,0.35); }
.btn-primary:active { transform: translateY(0); }
.pagination-btn { transition: background 0.15s, transform 0.12s, border-color 0.15s; }
.pagination-btn:hover:not(:disabled) { transform: scale(1.08); }
.dot-btn { transition: width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s; }
.page-header { animation: slideDown 0.4s cubic-bezier(0.22,1,0.36,1) both; }
`;

if (typeof document !== "undefined" && !document.getElementById("docs-anim")) {
  const el = document.createElement("style");
  el.id = "docs-anim";
  el.textContent = STYLES;
  document.head.appendChild(el);
}

const DEFAULT_COVERS = ["/anh1.jpg", "/anh2.jpg", "/anh3.jpg", "/anh6.jpg"];
const getCover = (doc, idx) => doc.coverImage || DEFAULT_COVERS[idx % DEFAULT_COVERS.length];

const ConfirmDeleteModal = ({ title, onConfirm, onCancel }) => (
  <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
    <div className="modal-box bg-white rounded-2xl shadow-xl w-[300px] p-7 text-center" onClick={(e) => e.stopPropagation()}>
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-800 mb-1">Xoá tài liệu?</p>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed line-clamp-2">
        Bạn có chắc muốn xoá <span className="font-medium text-gray-600">"{title}"</span>? Hành động này không thể hoàn tác.
      </p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Huỷ</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-500 font-medium hover:bg-red-100 transition-colors">Xoá</button>
      </div>
    </div>
  </div>
);

function DocCard({ doc, idx, onDelete, onCardClick, onTagClick }) {
  return (
    <div
      className="doc-card bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer"
      onClick={() => onCardClick(doc)}
    >
      <div className="relative overflow-hidden">
        <img
          src={getCover(doc, idx)}
          alt={doc.title}
          className="card-img w-full h-36 object-cover bg-gray-100"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
          className="delete-btn absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow"
        >
          <svg className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <span className={`absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          doc.status === "ready"      ? "bg-green-100 text-green-700" :
          doc.status === "processing" ? "bg-orange-100 text-orange-600" :
                                        "bg-red-100 text-red-500"
        }`}>
          {doc.status === "ready" ? "Đã xử lý" : doc.status === "processing" ? "Đang xử lý..." : "Lỗi"}
        </span>
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 mb-1.5 line-clamp-2">{doc.title}</p>
        <p className="text-xs text-gray-400 mb-2 truncate">📄 {doc.fileName}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">
            {doc.flashcardCount ?? 0} flashcard · {doc.quizCount ?? 0} quiz
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Bài giảng", "Bài kiểm tra"].map((tag) => (
            <span
              key={tag}
              onClick={(e) => { e.stopPropagation(); onTagClick(doc, tag); }}
              className={`tag-chip text-xs px-2.5 py-0.5 rounded-full font-medium cursor-pointer ${
                tag === "Bài giảng"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerKey, setBannerKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", file: null });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [gridKey, setGridKey] = useState(0);

  const ITEMS_PER_PAGE = 6;

  // ✅ Dùng documentService thay vì axios trực tiếp
  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await documentService.getAll();
      setDocs(res.data ?? []);
    } catch (err) {
      console.error("Lỗi tải tài liệu:", err.response?.data ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
      setBannerKey((k) => k + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const changeBanner = (i) => { setBannerIndex(i); setBannerKey((k) => k + 1); };

  // ✅ Dùng documentService.delete
  const handleDeleteConfirm = async () => {
    try {
      await documentService.delete(deleteTarget.id);
      setDocs((prev) => prev.filter((d) => d._id.toString() !== deleteTarget.id.toString()));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Lỗi xoá:", err);
      alert(err.response?.data?.error ?? "Lỗi khi xoá tài liệu");
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Dùng documentService.upload
  const handleAddSubmit = async () => {
    const err = {};
    if (!addForm.title.trim()) err.title = "Vui lòng nhập tên tài liệu";
    if (!addForm.file) err.file = "Vui lòng chọn file PDF";
    if (Object.keys(err).length) { setAddErrors(err); return; }

    setAddLoading(true);
    try {
      await documentService.upload(addForm.file, { title: addForm.title });
      await fetchDocs();
      closeModal();
      setGridKey((k) => k + 1);
    } catch (err) {
      console.error("Lỗi upload:", err);
      setAddErrors({ file: err.response?.data?.error ?? "Lỗi khi upload tài liệu" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleFileChange = (file) => {
    if (file && file.type === "application/pdf") {
      setAddForm((prev) => ({ ...prev, file }));
      if (addErrors.file) setAddErrors((prev) => ({ ...prev, file: "" }));
    } else if (file) {
      setAddErrors((prev) => ({ ...prev, file: "Chỉ chấp nhận file PDF" }));
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setAddForm({ title: "", file: null });
    setAddErrors({});
    setDragOver(false);
  };

  const filtered = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); setGridKey((k) => k + 1); };
  const handlePageChange = (p) => { setCurrentPage(p); setGridKey((k) => k + 1); window.scrollTo(0, 0); };

  const handleCardClick = (doc) => {
    navigate(`/teacher/documents/${doc._id}`, { state: { doc, activeTab: "Thông tin" } });
  };

  const handleTagClick = (doc, tag) => {
    if (tag === "Bài giảng") {
      navigate(`/teacher/baigiang/${doc._id}`, { state: { doc } });
    } else if (tag === "Bài kiểm tra") {
      navigate(`/teacher/baikiemtra/${doc._id}`, { state: { doc } });
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">

      {/* Search + Thêm */}
      <div className="page-header px-6 pt-5 pb-3 flex items-center gap-3">
        <div className="search-bar flex flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center px-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            type="text" placeholder="Tìm kiếm tài liệu"
            value={search} onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="px-3 text-gray-400 hover:text-gray-600">×</button>
          )}
        </div>
        <button className="btn-primary bg-[#F26739] text-white text-sm px-5 py-2 rounded-lg">Tìm</button>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary bg-[#F26739] text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap"
        >
          + Thêm tài liệu
        </button>
      </div>

      {/* Banner */}
      <div className="px-6 mb-2">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm" style={{ aspectRatio: "16/7" }}>
          <img key={bannerKey} src={banners[bannerIndex]} alt="banner"
            className="banner-img w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => changeBanner(i)}
                className={`dot-btn h-1.5 rounded-full ${i === bannerIndex ? "bg-blue-500 w-8" : "bg-gray-300 w-4"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách */}
      <div className="px-6 pb-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Tài liệu của tôi
            {filtered.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-36 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search
              ? `Không tìm thấy tài liệu nào cho "${search}"`
              : "Chưa có tài liệu nào. Hãy thêm tài liệu đầu tiên!"}
          </div>
        ) : (
          <div key={gridKey} className="grid grid-cols-3 gap-5">
            {paginated.map((doc, idx) => (
              <div key={doc._id} style={{ animationDelay: `${idx * 0.07}s` }}>
                <DocCard
                  doc={doc}
                  idx={(currentPage - 1) * ITEMS_PER_PAGE + idx}
                  onDelete={(d) => setDeleteTarget({ id: d._id, title: d.title })}
                  onCardClick={handleCardClick}
                  onTagClick={handleTagClick}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-gray-500">Trang {currentPage} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-btn px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                &lt; Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => handlePageChange(p)}
                  className={`pagination-btn w-7 h-7 text-xs rounded-md border ${
                    currentPage === p
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Sau &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal xoá */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Modal thêm */}
      {showAddModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="modal-box bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-start justify-between px-6 pt-5 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Thêm tài liệu</h2>
                <p className="text-xs text-gray-400 mt-0.5">Upload file PDF để AI xử lý</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
            </div>

            <div className="px-6 pb-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Tên tài liệu</label>
                <input
                  type="text" name="title"
                  placeholder="VD: Chiến tranh chống Mỹ cứu nước"
                  value={addForm.title} onChange={handleAddChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all duration-200 ${
                    addErrors.title
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  }`}
                />
                {addErrors.title && <p className="text-xs text-red-500 mt-1">{addErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">File PDF</label>
                <label className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
                  </svg>
                  Chọn file
                  <input type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0])} />
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
                  className={`w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                    dragOver ? "border-orange-400 bg-orange-50 scale-[1.01]" : "border-gray-200 bg-white"
                  }`}
                >
                  {addForm.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 font-medium max-w-xs truncate">{addForm.file.name}</p>
                      <p className="text-xs text-gray-400">{(addForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        onClick={() => setAddForm((prev) => ({ ...prev, file: null }))}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Xoá file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium">Kéo thả file PDF vào đây</p>
                      <p className="text-xs">hoặc bấm "Chọn file" bên trên</p>
                    </div>
                  )}
                </div>
                {addErrors.file && <p className="text-xs text-red-500 mt-1">{addErrors.file}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-5 mt-1">
              <button onClick={closeModal}
                className="px-5 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Huỷ
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={addLoading}
                className="btn-primary px-5 py-2 text-sm bg-[#F26739] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {addLoading ? "Đang upload..." : "Thêm tài liệu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}