import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, RefreshCw, Plus } from "lucide-react";
import { quizService } from "../../../services/quizService";
import { documentService } from "../../../services/documentService";
import { QuizSkeleton, ConfirmDeleteModal } from "./QuizComponents";
import QuizGrid from "./QuizGrid";
import SearchBox from "./SearchBox";
import { normalizeQuiz } from "./constants";

const DOCS_PER_PAGE = 4;

export default function ByDocumentTab({ isTeacher, onStartQuiz, onHistory, onOpenAddModal, onOpenEditModal }) {
  const navigate = useNavigate();

  const [documents,    setDocuments]    = useState([]);
  const [docsLoading,  setDocsLoading]  = useState(true);
  const [selectedDoc,  setSelectedDoc]  = useState({ id: "", title: "", thumb: "" });
  const [docSearch,    setDocSearch]    = useState("");
  const [quizzes,      setQuizzes]      = useState([]);
  const [quizLoading,  setQuizLoading]  = useState(false);
  const [quizError,    setQuizError]    = useState("");
  const [quizSearch,   setQuizSearch]   = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [docPage,      setDocPage]      = useState(1);

  useEffect(() => setDocPage(1), [docSearch]);

  useEffect(() => {
    (async () => {
      setDocsLoading(true);
      try {
        const res = await documentService.getAll();
        setDocuments(Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []);
      } catch (e) {
        console.error(e);
      } finally {
        setDocsLoading(false);
      }
    })();
  }, []);

  const fetchQuizzes = useCallback(async (docId) => {
    if (!docId) return;
    setQuizLoading(true);
    setQuizError("");
    try {
      const res  = await quizService.getByDocument(docId);
      const raw  = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? raw.items ?? []);
      setQuizzes(list.map(normalizeQuiz));
    } catch {
      setQuizError("Không thể tải danh sách quiz.");
    } finally {
      setQuizLoading(false);
    }
  }, []);

  const handleSelectDoc = (id, title, thumbnail) => {
    setSelectedDoc({ id, title, thumb: thumbnail ?? "" });
    setQuizzes([]);
    fetchQuizzes(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      setQuizzes((p) => p.filter((q) => (q.id ?? q._id) !== (deleteTarget.id ?? deleteTarget._id)));
      setDeleteTarget(null);
    } catch {
      alert("Xoá quiz thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredDocs    = documents.filter((d) =>
    (d.title ?? d.fileName ?? "").toLowerCase().includes(docSearch.toLowerCase())
  );
  const filteredQuizzes = quizzes.filter((q) =>
    (q.title ?? "").toLowerCase().includes(quizSearch.toLowerCase())
  );
  const totalDocPages   = Math.ceil(filteredDocs.length / DOCS_PER_PAGE);
  const pagedDocs       = filteredDocs.slice((docPage - 1) * DOCS_PER_PAGE, docPage * DOCS_PER_PAGE);

  return (
    <div className="flex gap-5 items-start">
      {/* ── Sidebar ── */}
      <div
        className="w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sticky top-6 overflow-hidden"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Chọn tài liệu</p>
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-2.5 h-8 gap-2">
            <Search size={12} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm tài liệu..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-gray-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {docsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Đang tải...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">Chưa có tài liệu</p>
              <button
                onClick={() => navigate("/teacher/documents")}
                className="mt-2 text-xs text-orange-500 underline"
              >
                Tạo tài liệu →
              </button>
            </div>
          ) : (
            <>
              {pagedDocs.map((doc) => {
                const id    = doc._id ?? doc.id;
                const title = doc.title ?? doc.fileName ?? "Không có tên";
                const isSel = selectedDoc.id === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectDoc(id, title, doc.thumbnail ?? "")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left mb-1 transition ${
                      isSel ? "bg-orange-50 border border-orange-200" : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSel ? "bg-orange-100" : "bg-gray-100"}`}>
                      <svg width="13" height="13" fill="none" stroke={isSel ? "#F26739" : "#9ca3af"} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isSel ? "text-orange-600" : "text-gray-700"}`}>{title}</p>
                      {doc.createdAt && (
                        <p className="text-[10px] text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                    {isSel && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                  </button>
                );
              })}

              {totalDocPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2 pb-1 border-t border-gray-100 mt-1">
                  <button
                    onClick={() => setDocPage((p) => Math.max(1, p - 1))}
                    disabled={docPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-400 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[11px] font-semibold text-gray-500">
                    <span className="text-[#F26739]">{docPage}</span> / {totalDocPages}
                  </span>
                  <button
                    onClick={() => setDocPage((p) => Math.min(totalDocPages, p + 1))}
                    disabled={docPage === totalDocPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-400 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Panel phải ── */}
      <div className="flex-1 min-w-0">
        {!selectedDoc.id ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <ChevronLeft size={32} className="text-gray-300" />
            <p className="text-sm">Chọn tài liệu bên trái để xem Quiz</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{selectedDoc.title}</p>
                <p className="text-xs text-gray-400">{quizzes.length} quiz</p>
              </div>
              <div className="flex items-center gap-2">
                <SearchBox value={quizSearch} onChange={setQuizSearch} placeholder="Tìm quiz..." />
                <button
                  onClick={() => fetchQuizzes(selectedDoc.id)}
                  disabled={quizLoading}
                  className="h-9 px-3 border border-gray-200 bg-white rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={12} className={quizLoading ? "animate-spin" : ""} /> Làm mới
                </button>
                {isTeacher && (
                  <button
                    onClick={() => onOpenAddModal(selectedDoc.id)}
                    className="h-9 px-4 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                    style={{ background: "#F26739" }}
                  >
                    <Plus size={13} /> Thêm Quiz
                  </button>
                )}
              </div>
            </div>

            {quizError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 flex items-center gap-2">
                {quizError}
                <button onClick={() => fetchQuizzes(selectedDoc.id)} className="ml-auto underline">Thử lại</button>
              </div>
            )}

            {quizLoading ? (
              <QuizSkeleton />
            ) : (
              <QuizGrid
                quizzes={filteredQuizzes}
                isTeacher={isTeacher}
                onStart={onStartQuiz}
                onEdit={onOpenEditModal}
                onDelete={(q) => setDeleteTarget(q)}
                onHistory={onHistory}
                docThumbnail={selectedDoc.thumb}
                emptyMsg="Tài liệu này chưa có quiz nào"
                emptyAction={
                  isTeacher && (
                    <button
                      onClick={() => onOpenAddModal(selectedDoc.id)}
                      className="text-sm px-4 py-2 rounded-lg text-white"
                      style={{ background: "#F26739" }}
                    >
                      + Tạo quiz đầu tiên
                    </button>
                  )
                }
              />
            )}
          </>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}