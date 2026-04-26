import { useNavigate } from "react-router-dom";
import { IconArrowRight } from "./icons";

const DEFAULT_COVERS = ["/anh1.jpg", "/anh2.jpg", "/anh3.jpg", "/anh6.jpg"];

export default function TabThongTin({ doc, id, setActiveTab }) {
  const navigate = useNavigate();

  const coverImg = (() => {
    if (doc?.thumbnail && doc.thumbnail.trim() !== "" && doc.thumbnail !== "null") return doc.thumbnail;
    const hash = (doc?._id?.toString() ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return DEFAULT_COVERS[hash % DEFAULT_COVERS.length];
  })();

  const statusColor = doc.status === "ready" ? "text-green-600" : doc.status === "processing" ? "text-orange-500" : "text-red-500";

  return (
    <div className="space-y-4">
      {/* Cover card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <img src={coverImg} alt={doc.title} className="w-full h-72 object-cover object-center bg-gray-100" />
        <div className="p-4">
          {doc.description && <p className="text-sm text-gray-500 mb-3">{doc.description}</p>}
          <div className="flex gap-4 text-sm flex-wrap">
            {/* Status */}
            <span className={`flex items-center gap-1.5 font-medium ${statusColor}`}>
              {doc.status === "ready" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                </svg>
              ) : doc.status === "processing" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              )}
              {doc.status === "ready" ? "Đã xử lý" : doc.status === "processing" ? "Đang xử lý..." : "Lỗi xử lý"}
            </span>

            <span className="flex items-center gap-1.5 text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="16" height="13" rx="2"/><path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/>
              </svg>
              {doc.flashcardCount ?? 0} flashcard
            </span>

            <span className="flex items-center gap-1.5 text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              {doc.quizCount ?? 0} quiz
            </span>
          </div>

          {doc.fileName && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 truncate">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              {doc.fileName}
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate(`/teacher/baigiang/${id}`, { state: { doc } })}
          className="group relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg rounded-xl p-5 text-left transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span className="text-blue-400 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"><IconArrowRight /></span>
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">Bài giảng</p>
          <p className="text-xs text-gray-400 truncate">{doc.fileName ?? "Xem tài liệu"}</p>
        </button>

        <button onClick={() => setActiveTab("Quizz")}
          className="group relative bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg rounded-xl p-5 text-left transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#F26739] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F26739" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span className="text-orange-400 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"><IconArrowRight /></span>
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">Bài kiểm tra</p>
          <p className="text-xs text-gray-400">{doc.quizCount ?? 0} bài kiểm tra</p>
        </button>
      </div>

      {/* Info table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Thông tin tài liệu</p>
        </div>
        <div className="px-4 py-3 space-y-2.5 text-sm text-gray-600">
          {[
            ["Tên file",   doc.fileName ?? "—"],
            ["Dung lượng", doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : "—"],
            ["Flashcard",  doc.flashcardCount ?? 0],
            ["Quiz",       doc.quizCount ?? 0],
            ["Ngày tạo",   doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("vi-VN") : "—"],
            ["Cập nhật",   doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("vi-VN") : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400">{label}</span>
              <span className="font-medium truncate max-w-[60%] text-right">{value}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-gray-400">Trạng thái</span>
            <span className={`font-medium ${statusColor}`}>
              {doc.status === "ready" ? "Đã xử lý" : doc.status === "processing" ? "Đang xử lý..." : "Lỗi"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}