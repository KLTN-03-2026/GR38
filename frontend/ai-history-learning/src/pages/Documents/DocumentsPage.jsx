import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialDocs = [
  { id: 1, title: "Chiến tranh điện biên phủ", duration: "158h50p", img: "/anh6.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 2, title: "Kháng chiến chống mỹ", duration: "158h50p", img: "/anh1.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 3, title: "Lịch sử Việt Nam thời tiền sử", duration: "158h50p", img: "/anh2.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 4, title: "Thời kỳ quân chủ (939 – 1945)", duration: "158h50p", img: "/anh3.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 5, title: "Thời Bắc thuộc (180 TCN – 938)", duration: "158h50p", img: "/anh4.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
  { id: 6, title: "Thời kỳ hiện đại (1858 – nay)", duration: "158h50p", img: "/anh5.jpg", tags: ["Bài giảng", "Bài kiểm tra"] },
];

const TOTAL_PAGES = 3;

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", file: null }); // ← đổi
  const [addErrors, setAddErrors] = useState({});
  const [dragOver, setDragOver] = useState(false); // ← thêm

  const banners = ["/anh6.jpg", "/anh1.jpg", "/anh2.jpg", "/anh3.jpg", "/anh4.jpg", "/anh5.jpg", "/anh6.jpg", "/anh1.jpg"];

  const filtered = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => setDocs((prev) => prev.filter((d) => d.id !== id));

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ← đổi: bỏ validation duration, thêm file
  const handleAddSubmit = () => {
    const err = {};
    if (!addForm.title.trim()) err.title = "Vui lòng nhập tên tài liệu";
    if (Object.keys(err).length) { setAddErrors(err); return; }
    const newId = Math.max(...docs.map((d) => d.id), 0) + 1;
    setDocs((prev) => [...prev, {
      id: newId,
      title: addForm.title,
      duration: "0h0p",
      img: "/anh1.jpg",
      tags: ["Bài giảng", "Bài kiểm tra"],
    }]);
    setAddForm({ title: "", file: null });
    setAddErrors({});
    setShowAddModal(false);
  };

  // ← thêm: xử lý file PDF
  const handleFileChange = (file) => {
    if (file && file.type === "application/pdf") {
      setAddForm((prev) => ({ ...prev, file }));
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setAddForm({ title: "", file: null });
    setAddErrors({});
    setDragOver(false);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">

      {/* Search + Thêm tài liệu */}
      <div className="px-6 pt-5 pb-3 flex items-center gap-3">
        <div className="flex flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center px-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        <button className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-5 py-2 rounded-lg transition-colors">
          Tìm
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#F26739] hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          Thêm tài liệu
        </button>
      </div>

      {/* Banner */}
      <div className="px-6 mb-2">
        <div className="w-full h-52 rounded-xl overflow-hidden">
          <img src={banners[bannerIndex]} alt="banner" className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-2 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? "bg-blue-500 w-8" : "bg-gray-300 w-8"}`}
            />
          ))}
        </div>
      </div>

      {/* Danh sách tài liệu */}
      <div className="px-6 pb-6 mt-4">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Tài liệu của tôi</h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy tài liệu nào</div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/teacher/documents/${doc.id}`, { state: { doc } })}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative">
                  <img src={doc.img} alt={doc.title} className="w-full h-36 object-cover bg-gray-100" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 mb-1.5 line-clamp-2">{doc.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{doc.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          tag === "Bài giảng" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
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
          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-gray-500">{currentPage} trang</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                &lt; Previous
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 text-xs rounded-md border transition-colors ${
                    currentPage === p ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <span className="text-gray-400 text-xs px-1">···</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                disabled={currentPage === TOTAL_PAGES}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Thêm tài liệu (MỚI) ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl">

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Thêm tài liệu</h2>
                <p className="text-xs text-gray-400 mt-0.5">Nhập thông tin</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
              >×</button>
            </div>

            {/* Tab-like "Thông tin" banner */}
            <div className="mx-6 mb-4 bg-gray-100 rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
              </svg>
              Thông tin
            </div>

            <div className="px-6 pb-4 space-y-4">

              {/* Tên tài liệu */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Tên tài liệu</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Chiến tranh chống mỹ cứu nước"
                  value={addForm.title}
                  onChange={handleAddChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${
                    addErrors.title
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  }`}
                />
                {addErrors.title && <p className="text-xs text-red-500 mt-1">{addErrors.title}</p>}
              </div>

              {/* Upload file */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">UploadFile</label>

                {/* Nút Tải file */}
                <label className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
                  </svg>
                  Tải file
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />
                </label>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileChange(e.dataTransfer.files?.[0]);
                  }}
                  className={`w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
                    dragOver
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {addForm.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 font-medium max-w-xs truncate">{addForm.file.name}</p>
                      <button
                        onClick={() => setAddForm((prev) => ({ ...prev, file: null }))}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Xoá file
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 font-medium">File PDF</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 pb-5 mt-1">
              <button
                onClick={closeModal}
                className="px-5 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-5 py-2 text-sm bg-[#F26739] hover:bg-orange-600 text-white rounded-lg transition"
              >
                Thêm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}