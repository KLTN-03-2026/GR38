import { useState } from "react";

export default function DocSelector({ documents, docsLoading, selectedDocId, setSelectedDocId }) {
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) => {
    const name = (doc.title ?? doc.fileName ?? "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const selectedDoc = documents.find((d) => (d._id ?? d.id) === selectedDocId);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
      <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        Tài liệu gắn với bộ thẻ <span className="text-gray-300 font-normal">(tuỳ chọn)</span>
      </label>

      {docsLoading ? (
        <div className="flex items-center gap-2 h-[46px] text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Đang tải danh sách tài liệu...
        </div>
      ) : (
        <div className="space-y-2">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tài liệu..."
              className="w-full h-[42px] pl-9 pr-4 rounded-xl border border-gray-200 text-[14px] text-gray-700 outline-none bg-[#FAFAFA] focus:border-[#F26739] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Select */}
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="w-full h-[46px] px-4 rounded-xl border border-gray-200 text-[15px] text-[#18181B] outline-none transition-colors bg-[#FAFAFA] focus:border-[#F26739]"
          >
            <option value="">-- Không gắn tài liệu --</option>
            {filtered.map((doc) => {
              const id   = doc._id ?? doc.id;
              const name = doc.title ?? doc.fileName ?? "Không có tên";
              return <option key={id} value={id}>{name}</option>;
            })}
          </select>

          {/* Hiển thị đang chọn */}
          {selectedDocId && selectedDoc && (
            <div className="flex items-center justify-between px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
              <span className="text-xs text-orange-700 font-medium truncate">
                📎 {selectedDoc.title ?? selectedDoc.fileName}
              </span>
              <button onClick={() => setSelectedDocId("")} className="text-orange-400 hover:text-orange-600 ml-2 shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Không tìm thấy */}
          {search && filtered.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Không tìm thấy tài liệu nào</p>
          )}
        </div>
      )}
    </div>
  );
}