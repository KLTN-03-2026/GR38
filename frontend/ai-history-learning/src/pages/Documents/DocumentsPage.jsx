import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialDocs = [
  { id: 1, title: "Chiến tranh Điện Biên Phủ", duration: "158h50p", img: "/anh6.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 2, title: "Kháng chiến chống Mỹ",       duration: "158h50p", img: "/anh1.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 3, title: "Lịch sử Việt Nam thời tiền sử", duration: "158h50p", img: "/anh2.jpg", tags: ["Bài giảng"] },
  { id: 4, title: "Thời kỳ quân chủ (939–1945)", duration: "158h50p", img: "/anh3.jpg", tags: ["Bài kiểm tra"] },
  { id: 5, title: "Thời Bắc thuộc (180 TCN–938)", duration: "158h50p", img: "/anh4.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 6, title: "Thời kỳ hiện đại (1858–nay)", duration: "158h50p", img: "/anh5.jpg", tags: ["Bài giảng"] },
];

const TOTAL_PAGES = 3;

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", file: null });
  const [addErrors, setAddErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const banners = ["/anh6.jpg", "/anh1.jpg", "/anh2.jpg", "/anh3.jpg"];
  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id) => setDocs(prev => prev.filter(d => d.id !== id));

  const handleAddSubmit = () => {
    const err = {};
    if (!addForm.title.trim()) err.title = "Vui lòng nhập tên tài liệu";
    if (Object.keys(err).length) { setAddErrors(err); return; }
    const newId = Math.max(...docs.map(d => d.id), 0) + 1;
    setDocs(prev => [...prev, { id: newId, title: addForm.title, duration: "0h0p", img: "/anh1.jpg", tags: ["Bài giảng"] }]);
    closeModal();
  };

  const handleFileChange = (file) => {
    if (file && file.type === "application/pdf")
      setAddForm(prev => ({ ...prev, file }));
  };

  const closeModal = () => {
    setShowAddModal(false);
    setAddForm({ title: "", file: null });
    setAddErrors({});
    setDragOver(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài liệu</h1>
          <p className="text-sm text-gray-400 mt-0.5">{docs.length} tài liệu đang có</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Thêm tài liệu
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex flex-1 items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#F26739] focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>
        <button className="bg-[#F26739] hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Tìm kiếm
        </button>
      </div>

      {/* Banner */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-sm">
        <img src={banners[bannerIndex]} alt="banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? "bg-white w-8" : "bg-white/50 w-4"}`}
            />
          ))}
        </div>
      </div>

      {/* Danh sách */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Tài liệu của tôi</h2>
          <span className="text-xs text-gray-400">{filtered.length} tài liệu</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Không tìm thấy tài liệu nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate(`/teacher/documents/${doc.id}`, { state: { doc } })}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="relative">
                  <img src={doc.img} alt={doc.title} className="w-full h-40 object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}
                    className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">{doc.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{doc.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map(tag => (
                      <span key={tag} className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        tag === "Bài giảng" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Trang {currentPage} / {TOTAL_PAGES}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                ← Trước
              </button>
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg border font-medium transition-all ${
                    currentPage === p ? "bg-[#F26739] text-white border-[#F26739]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
                disabled={currentPage === TOTAL_PAGES}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm tài liệu */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Thêm tài liệu mới</h2>
                <p className="text-xs text-gray-400 mt-0.5">Điền thông tin và upload file PDF</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên tài liệu</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Nhập tên tài liệu..."
                  value={addForm.title}
                  onChange={e => {
                    setAddForm(p => ({ ...p, title: e.target.value }));
                    if (addErrors.title) setAddErrors(p => ({ ...p, title: "" }));
                  }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                    addErrors.title
                      ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
                  }`}
                />
                {addErrors.title && <p className="text-xs text-red-500 mt-1.5">{addErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File PDF</label>
                <label className="inline-flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
                  </svg>
                  Chọn file
                  <input type="file" accept="application/pdf" className="hidden" onChange={e => handleFileChange(e.target.files?.[0])} />
                </label>

                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files?.[0]); }}
                  className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
                    dragOver ? "border-[#F26739] bg-orange-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {addForm.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700 max-w-xs truncate">{addForm.file.name}</p>
                      <button onClick={() => setAddForm(p => ({ ...p, file: null }))} className="text-xs text-red-400 hover:text-red-600 transition-colors">Xoá file</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-400">Kéo thả file PDF vào đây</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                Huỷ bỏ
              </button>
              <button onClick={handleAddSubmit} className="flex-1 py-2.5 text-sm bg-[#F26739] hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors">
                Thêm tài liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}