// QuizComponents.jsx
// Gồm: ConfirmDeleteModal, DocumentSelector, QuizSkeleton
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../../../services/documentService";

// ─── CONFIRM DELETE MODAL ───────────────────────────────────────────────────
export const ConfirmDeleteModal = ({ title, onConfirm, onCancel, deleting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
    style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
    onClick={!deleting ? onCancel : undefined}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-[320px] p-7 text-center modal-box"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1.5">Xoá bộ câu hỏi?</p>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        Bạn có chắc muốn xoá <span className="font-medium text-gray-600">"{title}"</span>?<br />
        Hành động này không thể hoàn tác.
      </p>
      <div className="flex gap-2">
        <button onClick={onCancel} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 ghost-btn disabled:opacity-50">
          Huỷ
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl text-sm text-red-500 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "#fff1f1", border: "1px solid #fecaca" }}>
          {deleting
            ? <><div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full spinner" /> Đang xoá...</>
            : "Xoá"}
        </button>
      </div>
    </div>
  </div>
);

// ─── DOCUMENT SELECTOR ──────────────────────────────────────────────────────
export function DocumentSelector() {
  const [documents, setDocuments]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch]         = useState("");
  const navigate                    = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res  = await documentService.getAll();
        const list = res?.data ?? res ?? [];
        setDocuments(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Fetch documents error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filtered = documents.filter((d) =>
    (d.title ?? d.fileName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleGo = () => {
    if (!selectedId) return;
    navigate(`/teacher/documents/${selectedId}`, {
      state: { activeTab: "Quizz" },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 anim-fade-in-up">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" fill="none" stroke="#F26739" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-700 mb-1">Chọn tài liệu để xem Quiz</p>
      <p className="text-xs text-gray-400 mb-6 text-center">
        Quiz được gắn với từng tài liệu. Chọn tài liệu bên dưới để xem và quản lý quiz.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-8">
          <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full spinner" />
          Đang tải tài liệu...
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-gray-400">Bạn chưa có tài liệu nào.</p>
          <button
            onClick={() => navigate("/teacher/documents")}
            className="text-sm px-5 py-2.5 rounded-xl bg-[#F26739] text-white hover:bg-orange-600 transition"
          >
            Đi đến Tài liệu →
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-[40px] gap-2 mb-3">
            <svg width="15" height="15" className="text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm tài liệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 mb-4">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">Không tìm thấy tài liệu</p>
            ) : (
              filtered.map((doc) => {
                const id    = doc._id ?? doc.id;
                const title = doc.title ?? doc.fileName ?? "Không có tên";
                const isSelected = selectedId === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={`doc-select-card w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left ${isSelected ? "selected" : "border-gray-200 bg-white"}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-orange-100" : "bg-gray-100"}`}>
                      <svg width="16" height="16" fill="none" stroke={isSelected ? "#F26739" : "#9ca3af"} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? "text-orange-600" : "text-gray-700"}`}>
                        {title}
                      </p>
                      {doc.createdAt && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                        <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={handleGo}
            disabled={!selectedId}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed primary-btn"
            style={{ background: "#F26739" }}
          >
            Xem Quiz của tài liệu này →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── QUIZ SKELETON ──────────────────────────────────────────────────────────
export function QuizSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="w-full h-44 bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-2.5">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}