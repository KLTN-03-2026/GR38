import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, FileText, PenLine, Library,
  Search, RefreshCw, Plus, Clock, CheckCircle, XCircle, RotateCcw,
} from "lucide-react";
import { quizService } from "../../../services/quizService";
import { documentService } from "../../../services/documentService";
import { GlobalStyles } from "./GlobalStyles";
import QuizView from "./QuizView";
import AddQuizModal from "./AddQuizModal";
import { ConfirmDeleteModal, QuizSkeleton } from "./QuizComponents";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q) {
  const indexed = q.options.map((opt, i) => ({ text: opt, isAnswer: i === q.answer }));
  const shuffled = shuffleArray(indexed);
  return { ...q, options: shuffled.map(o => o.text), answer: shuffled.findIndex(o => o.isAnswer) };
}

function getUserRole() {
  try { return (JSON.parse(localStorage.getItem("user") || "{}").role || "").toUpperCase(); }
  catch { return ""; }
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function normalizeQuiz(q) {
  return {
    id: q._id ?? q.id,
    _id: q._id ?? q.id,
    title: q.title,
    description: q.description,
    difficulty: q.difficulty,
    timeLimit: q.timeLimit ?? q.time_limit,
    questionCount: q.questionCount ?? (Array.isArray(q.questions) ? q.questions.length : 0),
    questions: q.questions ?? [],
    coverImage: q.thumbnail ?? q.coverImage ?? null,
    documentId: q.documentId ?? null,
  };
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────
function PaginationBar({ page, total, onChange }) {
  if (total <= 1) return null;
  const nums = getPageNumbers(page, total);
  return (
    <div className="flex items-center justify-end gap-1 mt-6">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
        <ChevronLeft size={14} />
      </button>
      {nums.map((p, i) => p === "..." ? (
        <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
      ) : (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 text-xs rounded-lg border font-medium transition ${
            page === p ? "bg-[#F26739] text-white border-[#F26739] shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}>{p}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === total}
        className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Quiz Card ────────────────────────────────────────────────────────────────
function QuizCard({ quiz, isTeacher, onStart, onEdit, onDelete, docThumbnail }) {
  const cover = quiz.coverImage || docThumbnail || null;
  const DIFF = {
    EASY:   { label: "Dễ",         cls: "bg-green-500"  },
    MEDIUM: { label: "Trung bình", cls: "bg-yellow-500" },
    HARD:   { label: "Khó",        cls: "bg-red-500"    },
  };
  const diff = DIFF[quiz.difficulty];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div className="relative overflow-hidden">
        {cover ? (
          <img src={cover} alt={quiz.title} className="w-full h-40 object-cover bg-[#fdf3ec]" />
        ) : (
          <div className="w-full h-40 flex items-center justify-center" style={{ background: "#fdf3ec" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#F26739" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
        )}
        {diff && <span className={`absolute top-2.5 left-2.5 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm ${diff.cls}`}>{diff.label}</span>}
        {isTeacher && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(quiz); }}
            className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
            <svg className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="font-bold text-gray-800 text-[15px] mb-1 leading-snug line-clamp-2 uppercase tracking-wide">{quiz.title}</p>
        <p className="text-xs text-gray-400 mb-4">Số câu hỏi <span className="font-bold text-[#F26739]">{quiz.questionCount ?? 0} câu</span></p>
        <button onClick={() => onStart(quiz)} className="w-full py-2.5 rounded-xl text-sm text-white font-semibold transition" style={{ background: "#F26739" }}>
          Làm bài ngay
        </button>
        {isTeacher && (
          <button onClick={() => onEdit(quiz)} className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blue-200 text-xs text-blue-600 hover:bg-blue-50 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Quiz Grid với pagination ─────────────────────────────────────────────────
function QuizGrid({ quizzes, isTeacher, onStart, onEdit, onDelete, docThumbnail, emptyMsg, emptyAction }) {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [quizzes.length]);

  if (!quizzes.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
      <p className="text-sm font-medium text-gray-500">{emptyMsg}</p>
      {emptyAction}
    </div>
  );

  const total = Math.max(1, Math.ceil(quizzes.length / ITEMS_PER_PAGE));
  const safe  = Math.min(page, total);
  const paged = quizzes.slice((safe - 1) * ITEMS_PER_PAGE, safe * ITEMS_PER_PAGE);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paged.map((quiz) => (
          <QuizCard key={quiz._id ?? quiz.id} quiz={quiz} isTeacher={isTeacher}
            onStart={onStart} onEdit={onEdit} onDelete={onDelete} docThumbnail={docThumbnail} />
        ))}
      </div>
      <PaginationBar page={safe} total={total} onChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
    </>
  );
}

// ─── Tab: Tất cả ──────────────────────────────────────────────────────────────
function AllTab({ isTeacher, onStartQuiz, onOpenEditModal, allQuizzes, loading, onDeleteQuiz }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [search,       setSearch]       = useState("");

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      onDeleteQuiz(deleteTarget.id ?? deleteTarget._id);
      setDeleteTarget(null);
    } catch { alert("Xoá quiz thất bại."); }
    finally { setDeleting(false); }
  };

  const filtered = allQuizzes.filter(q => (q.title ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <p className="text-sm font-bold text-gray-800">Tất cả Quiz</p>
          <p className="text-xs text-gray-400">{allQuizzes.length} quiz</p>
        </div>
        {allQuizzes.length > 0 && (
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm">
            <Search size={12} className="text-gray-400 shrink-0"/>
            <input type="text" placeholder="Tìm quiz..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-32 text-gray-700"/>
          </div>
        )}
      </div>

      {loading ? <QuizSkeleton/> : (
        <QuizGrid quizzes={filtered} isTeacher={isTeacher}
          onStart={onStartQuiz} onEdit={onOpenEditModal} onDelete={q => setDeleteTarget(q)}
          emptyMsg="Chưa có quiz nào"
          emptyAction={null}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal title={deleteTarget.title} onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setDeleteTarget(null)} deleting={deleting}/>
      )}
    </div>
  );
}

// ─── Tab: Theo tài liệu ───────────────────────────────────────────────────────
function ByDocumentTab({ isTeacher, onStartQuiz, onOpenAddModal, onOpenEditModal }) {
  const navigate = useNavigate();
  const [documents,        setDocuments]        = useState([]);
  const [docsLoading,      setDocsLoading]      = useState(true);
  const [selectedDocId,    setSelectedDocId]    = useState("");
  const [selectedDocTitle, setSelectedDocTitle] = useState("");
  const [selectedDocThumb, setSelectedDocThumb] = useState("");
  const [docSearch,        setDocSearch]        = useState("");
  const [quizzes,          setQuizzes]          = useState([]);
  const [quizLoading,      setQuizLoading]      = useState(false);
  const [quizError,        setQuizError]        = useState("");
  const [quizSearch,       setQuizSearch]       = useState("");
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [deleting,         setDeleting]         = useState(false);
  const [docPage,          setDocPage]          = useState(1);
  const DOCS_PER_PAGE = 4;

  useEffect(() => { setDocPage(1); }, [docSearch]);

  useEffect(() => {
    (async () => {
      setDocsLoading(true);
      try {
        const res = await documentService.getAll();
        setDocuments(Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []);
      } catch(e) { console.error(e); }
      finally { setDocsLoading(false); }
    })();
  }, []);

  const fetchQuizzes = useCallback(async (docId) => {
    if (!docId) return;
    setQuizLoading(true); setQuizError("");
    try {
      const res = await quizService.getByDocument(docId);
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? raw.items ?? []);
      setQuizzes(list.map(normalizeQuiz));
    } catch { setQuizError("Không thể tải danh sách quiz."); }
    finally { setQuizLoading(false); }
  }, []);

  const handleSelectDoc = (id, title, thumbnail) => {
    setSelectedDocId(id); setSelectedDocTitle(title); setSelectedDocThumb(thumbnail ?? "");
    setQuizzes([]); fetchQuizzes(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      setQuizzes(p => p.filter(q => (q.id ?? q._id) !== (deleteTarget.id ?? deleteTarget._id)));
      setDeleteTarget(null);
    } catch { alert("Xoá quiz thất bại."); }
    finally { setDeleting(false); }
  };

  const filteredDocs    = documents.filter(d => (d.title ?? d.fileName ?? "").toLowerCase().includes(docSearch.toLowerCase()));
  const filteredQuizzes = quizzes.filter(q => (q.title ?? "").toLowerCase().includes(quizSearch.toLowerCase()));
  const totalDocPages   = Math.ceil(filteredDocs.length / DOCS_PER_PAGE);
  const pagedDocs       = filteredDocs.slice((docPage - 1) * DOCS_PER_PAGE, docPage * DOCS_PER_PAGE);

  return (
    <div className="flex gap-5 items-start">
      {/* Sidebar tài liệu */}
      <div className="w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sticky top-6 overflow-hidden" style={{ maxHeight: "calc(100vh - 160px)" }}>
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Chọn tài liệu</p>
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-2.5 h-8 gap-2">
            <Search size={12} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Tìm tài liệu..." value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-gray-700" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {docsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"/> Đang tải...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">Chưa có tài liệu</p>
              <button onClick={() => navigate("/teacher/documents")} className="mt-2 text-xs text-orange-500 underline">Tạo tài liệu →</button>
            </div>
          ) : (
            <>
              {pagedDocs.map(doc => {
                const id    = doc._id ?? doc.id;
                const title = doc.title ?? doc.fileName ?? "Không có tên";
                const isSel = selectedDocId === id;
                return (
                  <button key={id} onClick={() => handleSelectDoc(id, title, doc.thumbnail ?? "")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left mb-1 transition ${isSel ? "bg-orange-50 border border-orange-200" : "hover:bg-gray-50 border border-transparent"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSel ? "bg-orange-100" : "bg-gray-100"}`}>
                      <svg width="13" height="13" fill="none" stroke={isSel ? "#F26739" : "#9ca3af"} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isSel ? "text-orange-600" : "text-gray-700"}`}>{title}</p>
                      {doc.createdAt && <p className="text-[10px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString("vi-VN")}</p>}
                    </div>
                    {isSel && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"/>}
                  </button>
                );
              })}

              {totalDocPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2 pb-1 border-t border-gray-100 mt-1">
                  <button onClick={() => setDocPage(p => Math.max(1, p - 1))} disabled={docPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-400 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={14}/>
                  </button>
                  <span className="text-[11px] font-semibold text-gray-500">
                    <span className="text-[#F26739]">{docPage}</span> / {totalDocPages}
                  </span>
                  <button onClick={() => setDocPage(p => Math.min(totalDocPages, p + 1))} disabled={docPage === totalDocPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-400 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronRight size={14}/>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Panel phải */}
      <div className="flex-1 min-w-0">
        {!selectedDocId ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <ChevronLeft size={32} className="text-gray-300"/>
            <p className="text-sm">Chọn tài liệu bên trái để xem Quiz</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{selectedDocTitle}</p>
                <p className="text-xs text-gray-400">{quizzes.length} quiz</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm">
                  <Search size={12} className="text-gray-400 shrink-0"/>
                  <input type="text" placeholder="Tìm quiz..." value={quizSearch}
                    onChange={e => setQuizSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-32 text-gray-700"/>
                </div>
                <button onClick={() => fetchQuizzes(selectedDocId)} disabled={quizLoading}
                  className="h-9 px-3 border border-gray-200 bg-white rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition flex items-center gap-1.5 shadow-sm">
                  <RefreshCw size={12} className={quizLoading ? "animate-spin" : ""}/> Làm mới
                </button>
                {isTeacher && (
                  <button onClick={() => onOpenAddModal(selectedDocId)}
                    className="h-9 px-4 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5" style={{ background: "#F26739" }}>
                    <Plus size={13}/> Thêm Quiz
                  </button>
                )}
              </div>
            </div>
            {quizError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 flex items-center gap-2">
                {quizError}
                <button onClick={() => fetchQuizzes(selectedDocId)} className="ml-auto underline">Thử lại</button>
              </div>
            )}
            {quizLoading ? <QuizSkeleton/> : (
              <QuizGrid quizzes={filteredQuizzes} isTeacher={isTeacher}
                onStart={onStartQuiz} onEdit={onOpenEditModal} onDelete={q => setDeleteTarget(q)}
                docThumbnail={selectedDocThumb}
                emptyMsg="Tài liệu này chưa có quiz nào"
                emptyAction={isTeacher && (
                  <button onClick={() => onOpenAddModal(selectedDocId)} className="text-sm px-4 py-2 rounded-lg text-white" style={{ background: "#F26739" }}>
                    + Tạo quiz đầu tiên
                  </button>
                )}
              />
            )}
          </>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal title={deleteTarget.title} onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setDeleteTarget(null)} deleting={deleting}/>
      )}
    </div>
  );
}

// ─── Tab: Thủ công ────────────────────────────────────────────────────────────
function ManualTab({ isTeacher, onStartQuiz, onOpenAddModal, onOpenEditModal, quizzes, loading, onDeleteQuiz }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [search,       setSearch]       = useState("");

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      onDeleteQuiz(deleteTarget.id ?? deleteTarget._id);
      setDeleteTarget(null);
    } catch { alert("Xoá quiz thất bại."); }
    finally { setDeleting(false); }
  };

  const filtered = quizzes.filter(q => (q.title ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <p className="text-sm font-bold text-gray-800">Quiz thủ công</p>
          <p className="text-xs text-gray-400">Không gắn với tài liệu · {quizzes.length} quiz</p>
        </div>
        <div className="flex items-center gap-2">
          {quizzes.length > 0 && (
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm">
              <Search size={12} className="text-gray-400 shrink-0"/>
              <input type="text" placeholder="Tìm quiz..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-32 text-gray-700"/>
            </div>
          )}
          {isTeacher && (
            <button onClick={() => onOpenAddModal(null)}
              className="h-9 px-4 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5" style={{ background: "#F26739" }}>
              ✏️ Tạo Quiz thủ công
            </button>
          )}
        </div>
      </div>

      {loading ? <QuizSkeleton/> : (
        <QuizGrid quizzes={filtered} isTeacher={isTeacher}
          onStart={onStartQuiz} onEdit={onOpenEditModal} onDelete={q => setDeleteTarget(q)}
          emptyMsg="Chưa có quiz thủ công nào"
          emptyAction={isTeacher && (
            <button onClick={() => onOpenAddModal(null)} className="text-sm px-5 py-2.5 rounded-xl text-white" style={{ background: "#F26739" }}>
              ✏️ Tạo Quiz đầu tiên
            </button>
          )}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal title={deleteTarget.title} onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setDeleteTarget(null)} deleting={deleting}/>
      )}
    </div>
  );
}

// ─── Tab: Lịch sử làm bài ─────────────────────────────────────────────────────
function HistoryTab({ onStartQuiz, allQuizzes }) {
  const [history,       setHistory]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [detail,        setDetail]        = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search,        setSearch]        = useState("");

useEffect(() => {
  setLoading(true);
  quizService.getMyHistory()
    .then(res => {
      const raw = res.data?.data ?? res.data ?? [];
      const sorted = [...raw].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(sorted);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);

  const handleViewDetail = async (attempt) => {
    setActiveAttempt(attempt);
    setDetailLoading(true);
    try {
      const res = await quizService.getResultDetail(attempt._id);
      const raw = res.data?.data ?? res.data;
      const fullQuestions = raw?.quizId?.questions || [];

      const qs = fullQuestions.map(q => {
        let correctIdx = q.options.findIndex(opt => opt === q.correctAnswer);
        if (correctIdx === -1) correctIdx = Number(q.correctAnswer ?? q.answer);
        let userIdx = null;
        if (raw?.answers) {
          const ansInfo = raw.answers.find(a => String(a.questionId) === String(q._id));
          if (ansInfo && ansInfo.selectedAnswer !== null) {
            userIdx = q.options.findIndex(opt => opt === ansInfo.selectedAnswer);
            if (userIdx === -1) userIdx = Number(ansInfo.selectedAnswer);
          }
        }
        return { ...q, answer: correctIdx, userAnswer: userIdx };
      });

      setDetail({
        quizTitle: raw?.quizId?.title || "Bài Kiểm Tra",
        score:     raw?.correctAnswersCount ?? raw?.score ?? 0,
        total:     raw?.totalQuestions ?? fullQuestions.length ?? 10,
        answered:  raw?.answers?.length ?? 0,
        questions: qs,
        createdAt: raw?.createdAt ?? attempt.createdAt,
      });
    } catch (err) {
      console.error(err);
      alert("Không thể tải chi tiết bài làm.");
      setActiveAttempt(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBack = () => { setActiveAttempt(null); setDetail(null); };

  // ── Màn hình chi tiết ──
  if (activeAttempt) {
    if (detailLoading || !detail) return (
      <div className="flex items-center justify-center py-24 gap-2 text-sm text-gray-400">
        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"/>
        Đang tải chi tiết...
      </div>
    );

    const pct        = detail.total > 0 ? Math.round((detail.score / detail.total) * 100) : 0;
    const scoreColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

    // Tìm quiz tương ứng để nút "Làm lại"
    const quizToRetry = allQuizzes.find(q =>
      (q.title ?? "").toLowerCase() === (detail.quizTitle ?? "").toLowerCase()
    );

    return (
      <div>
        {/* Nút quay lại */}
        <button onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 mb-5 transition">
          <ChevronLeft size={14}/> Quay lại lịch sử
        </button>

        {/* Score card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex items-center gap-6"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* Vòng tròn điểm */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black" style={{ color: scoreColor }}>{pct}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-gray-800 mb-1 truncate">{detail.quizTitle}</p>
            <p className="text-xs text-gray-400 mb-3">
              {new Date(detail.createdAt).toLocaleString("vi-VN")}
            </p>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle size={12}/> Đúng: {detail.score}
              </span>
              <span className="flex items-center gap-1 text-red-500 font-semibold">
                <XCircle size={12}/> Sai: {detail.total - detail.score}
              </span>
              <span className="text-gray-400">Tổng: {detail.total} câu</span>
            </div>
          </div>

          {/* Nút làm lại */}
          {quizToRetry && (
            <button
              onClick={() => { handleBack(); onStartQuiz(quizToRetry); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold transition shrink-0"
              style={{ background: "#F26739" }}>
              <RotateCcw size={13}/> Làm lại
            </button>
          )}
        </div>

        {/* Chi tiết từng câu */}
        {detail.questions?.length > 0 ? (
          <div className="space-y-3">
            {detail.questions.map((q, idx) => {
              const isCorrect = q.userAnswer === q.answer;
              const isSkipped = q.userAnswer === null || q.userAnswer === undefined;
              return (
                <div key={q._id ?? idx}
                  className={`bg-white rounded-2xl border p-4 ${
                    isSkipped ? "border-gray-200"
                      : isCorrect ? "border-green-200"
                      : "border-red-200"
                  }`} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isSkipped ? "bg-gray-100 text-gray-400"
                        : isCorrect ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}>Câu {idx + 1}</span>
                    <p className="text-sm font-medium text-gray-800 flex-1">{q.question}</p>
                    {isSkipped
                      ? <span className="text-[11px] text-gray-400 shrink-0">Bỏ qua</span>
                      : isCorrect
                        ? <CheckCircle size={16} className="text-green-500 shrink-0"/>
                        : <XCircle size={16} className="text-red-400 shrink-0"/>
                    }
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {q.options?.map((opt, oIdx) => {
                      const isAnswer = oIdx === q.answer;
                      const isUser   = oIdx === q.userAnswer;
                      let cls = "border-gray-100 text-gray-600 bg-gray-50";
                      if (isAnswer) cls = "border-green-300 bg-green-50 text-green-700 font-semibold";
                      else if (isUser && !isCorrect) cls = "border-red-300 bg-red-50 text-red-600";
                      return (
                        <div key={oIdx}
                          className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-2 ${cls}`}>
                          <span className="shrink-0 text-[10px] font-bold opacity-60">
                            {["A", "B", "C", "D"][oIdx]}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isAnswer && <CheckCircle size={11} className="text-green-500 shrink-0"/>}
                          {isUser && !isCorrect && <XCircle size={11} className="text-red-400 shrink-0"/>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-2 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-sm text-gray-400">Không có dữ liệu chi tiết câu hỏi</p>
          </div>
        )}
      </div>
    );
  }

  // ── Màn hình danh sách ──
  const DIFF_LABEL = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };
  const filtered = history.filter(h =>
    (h.quizId?.title ?? h.quizTitle ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <p className="text-sm font-bold text-gray-800">Lịch sử làm bài</p>
          <p className="text-xs text-gray-400">{history.length} lần làm bài</p>
        </div>
        {history.length > 0 && (
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm">
            <Search size={12} className="text-gray-400 shrink-0"/>
            <input type="text" placeholder="Tìm theo tên quiz..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-40 text-gray-700"/>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"/> Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
          <Clock size={32} className="text-gray-300"/>
          <p className="text-sm font-medium text-gray-500">
            {history.length === 0 ? "Chưa có lịch sử làm bài" : "Không tìm thấy kết quả"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((attempt, idx) => {
            const title      = attempt.quizId?.title ?? attempt.quizTitle ?? "Bài kiểm tra";
            const score      = attempt.correctAnswersCount ?? attempt.score ?? 0;
            const total      = attempt.totalQuestions ?? 0;
            const pct        = total > 0 ? Math.round((score / total) * 100) : 0;
            const scoreColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
            const date       = attempt.createdAt ? new Date(attempt.createdAt).toLocaleString("vi-VN") : "";
            const diff       = attempt.quizId?.difficulty;

            return (
              <div key={attempt._id ?? idx}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-orange-200 hover:shadow-sm transition cursor-pointer"
                onClick={() => handleViewDetail(attempt)}>

                {/* Vòng tròn điểm */}
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
                    <circle cx="24" cy="24" r="20" fill="none" stroke={scoreColor} strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                      strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black" style={{ color: scoreColor }}>{pct}%</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-bold text-gray-800 truncate">{title}</p>
                    {diff && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        diff === "EASY"   ? "bg-green-100 text-green-600"
                          : diff === "MEDIUM" ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-500"
                      }`}>{DIFF_LABEL[diff] ?? diff}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{date}</p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color: scoreColor }}>{score}/{total}</p>
                  <p className="text-[10px] text-gray-400">câu đúng</p>
                </div>

                <ChevronRight size={14} className="text-gray-300 shrink-0"/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate  = useNavigate();
  const isTeacher = getUserRole() === "TEACHER";

  const [activeTab,     setActiveTab]     = useState("all");
  const [quizView,      setQuizView]      = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [addDocumentId, setAddDocumentId] = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);

  // ── All quizzes ──
  const [allQuizzes,    setAllQuizzes]    = useState([]);
  const [allLoading,    setAllLoading]    = useState(false);

  // ── Manual quizzes ──
  const [manualQuizzes, setManualQuizzes] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);

  const fetchAllQuizzes = useCallback(async () => {
    setAllLoading(true);
    try {
      const res = await quizService.getTeacherQuizzes();
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? []);
      setAllQuizzes(list.map(normalizeQuiz));
    } catch(err) { console.error("fetchAllQuizzes error:", err); }
    finally { setAllLoading(false); }
  }, []);

  const fetchManualQuizzes = useCallback(async () => {
    setManualLoading(true);
    try {
      const res = await quizService.getTeacherQuizzes();
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? []);
      setManualQuizzes(list.filter(q => !q.documentId).map(normalizeQuiz));
    } catch(err) { console.error("fetchManualQuizzes error:", err); }
    finally { setManualLoading(false); }
  }, []);

  useEffect(() => {
    fetchAllQuizzes();
    fetchManualQuizzes();
  }, [fetchAllQuizzes, fetchManualQuizzes]);

  const handleStartQuiz = async (quiz) => {
    try {
      const id = quiz._id ?? quiz.id;
      if (!id) { alert("Không tìm thấy ID quiz!"); return; }

      if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        const normalized = quiz.questions.map(q => ({
          _id: q._id ?? q.id,
          question: q.question ?? q.q,
          options: Array.isArray(q.options) ? q.options : [q.optionA, q.optionB, q.optionC, q.optionD],
          answer: q.correctAnswerIndex ?? (typeof q.correctAnswer === "number" ? q.correctAnswer : q.options?.indexOf(q.correctAnswer)) ?? q.answer ?? 0,
          explanation: q.explanation ?? q.explain ?? "",
        }));
        setQuizView({ quiz, questions: shuffleArray(normalized).map(shuffleOptions) });
        return;
      }

      const res    = await quizService.getQuizForPlay(id);
      const detail = res.data?.data ?? res.data ?? res;
      const rawQs  = detail.questions ?? [];
      if (!rawQs.length) { alert("Quiz này chưa có câu hỏi!"); return; }
      setQuizView({
        quiz: detail,
        questions: shuffleArray(rawQs.map(q => ({
          _id: q._id ?? q.id,
          question: q.question ?? q.q,
          options: q.options,
          answer: q.correctAnswerIndex ?? q.answer ?? null,
        }))).map(shuffleOptions),
      });
    } catch(err) {
      console.error("Start quiz error:", err);
      alert("Không tải được câu hỏi. Vui lòng thử lại.");
    }
  };

  const handleFinish = (result) => {
    setQuizView(null);
    navigate("/teacher/quiz-result", { state: result });
  };

  const handleSaveQuiz = () => {
    setShowAddModal(false); setEditTarget(null);
    fetchAllQuizzes();
    fetchManualQuizzes();
    if (!addDocumentId) setActiveTab("manual");
  };

  const handleDeleteFromAll = (id) => {
    setAllQuizzes(p => p.filter(q => (q.id ?? q._id) !== id));
    setManualQuizzes(p => p.filter(q => (q.id ?? q._id) !== id));
  };

 const TABS = [
  { key: "all",      icon: <Library size={14}/>,  label: "Tất cả",
    badge: allQuizzes.length > 0 ? allQuizzes.length : null },
  { key: "document", icon: <FileText size={14}/>, label: "Theo tài liệu" },
  { key: "manual",   icon: <PenLine size={14}/>,  label: "Thủ công",
    badge: manualQuizzes.length > 0 ? manualQuizzes.length : null },
  { key: "history",  icon: <Clock size={14}/>,    label: "Lịch sử làm bài" },
];

  if (quizView) return (
    <>
      <GlobalStyles/>
      <QuizView quiz={quizView.quiz} questions={quizView.questions} onBack={() => setQuizView(null)} onFinish={handleFinish}/>
    </>
  );

  return (
    <>
      <GlobalStyles/>
      <div className="h-full overflow-y-auto bg-gray-50 px-8 py-6">
        {/* Header */}
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Hệ thống trắc nghiệm</h1>

        {/* Tab bar */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TABS.map(({ key, icon, label, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
                activeTab === key ? "bg-[#F26739] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {icon}{label}
              {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? "bg-white/30 text-white" : "bg-orange-100 text-orange-600"
                }`}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "all" && (
          <AllTab isTeacher={isTeacher} onStartQuiz={handleStartQuiz}
            onOpenEditModal={setEditTarget}
            allQuizzes={allQuizzes} loading={allLoading}
            onDeleteQuiz={handleDeleteFromAll}/>
        )}
        {activeTab === "document" && (
          <ByDocumentTab isTeacher={isTeacher} onStartQuiz={handleStartQuiz}
            onOpenAddModal={(id) => { setAddDocumentId(id ?? null); setShowAddModal(true); }}
            onOpenEditModal={setEditTarget}/>
        )}
        {activeTab === "manual" && (
          <ManualTab isTeacher={isTeacher} onStartQuiz={handleStartQuiz}
            onOpenAddModal={(id) => { setAddDocumentId(id ?? null); setShowAddModal(true); }}
            onOpenEditModal={setEditTarget}
            quizzes={manualQuizzes} loading={manualLoading}
            onDeleteQuiz={id => setManualQuizzes(p => p.filter(q => (q.id ?? q._id) !== id))}/>
        )}
        {activeTab === "history" && (
          <HistoryTab onStartQuiz={handleStartQuiz} allQuizzes={allQuizzes}/>
        )}

        {showAddModal && (
          <AddQuizModal onClose={() => setShowAddModal(false)} onSave={handleSaveQuiz} documentId={addDocumentId}/>
        )}
        {editTarget && (
          <AddQuizModal onClose={() => setEditTarget(null)} onSave={handleSaveQuiz}
            documentId={editTarget.documentId ?? null} editQuiz={editTarget}/>
        )}
      </div>
    </>
  );
}