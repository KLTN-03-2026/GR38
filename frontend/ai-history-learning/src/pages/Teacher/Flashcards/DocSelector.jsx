export default function DocSelector({ documents, docsLoading, selectedDocId, setSelectedDocId }) {
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
        <select
          value={selectedDocId}
          onChange={(e) => setSelectedDocId(e.target.value)}
          className="w-full h-[46px] px-4 rounded-xl border border-gray-200 text-[15px] text-[#18181B] outline-none transition-colors bg-[#FAFAFA] focus:border-[#F26739]"
        >
          <option value="">-- Không gắn tài liệu --</option>
          {documents.map((doc) => {
            const id   = doc._id ?? doc.id;
            const name = doc.title ?? doc.fileName ?? "Không có tên";
            return <option key={id} value={id}>{name}</option>;
          })}
        </select>
      )}
    </div>
  );
}