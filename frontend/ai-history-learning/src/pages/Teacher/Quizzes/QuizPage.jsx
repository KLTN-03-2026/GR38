// QuizPage.jsx
// src/pages/Teacher/Quizzes/QuizPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizService } from "../../../services/quizService";
import { documentService } from "../../../services/documentService";
import { GlobalStyles } from "./GlobalStyles";
import QuizView from "./QuizView";
import AddQuizModal from "./AddQuizModal";
import { ConfirmDeleteModal, QuizSkeleton } from "./QuizComponents";

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleOptions(question) {
  const indexed = question.options.map((opt, i) => ({
    text: opt,
    isAnswer: i === question.answer,
  }));
  const shuffled = shuffleArray(indexed);
  return {
    ...question,
    options: shuffled.map((o) => o.text),
    answer: shuffled.findIndex((o) => o.isAnswer),
  };
}

// ── Lấy role từ localStorage ──────────────────────────────────────────────────
function getUserRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return (user.role || "").toUpperCase();
  } catch {
    return "";
  }
}

// ── Document Selector ─────────────────────────────────────────────────────────
function DocumentSelector({ onSelectDocument }) {
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
    const doc = documents.find((d) => (d._id ?? d.id) === selectedId);
    onSelectDocument(selectedId, doc?.title ?? doc?.fileName ?? "");
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
          <button onClick={() => navigate("/teacher/documents")}
            className="text-sm px-5 py-2.5 rounded-xl bg-[#F26739] text-white hover:bg-orange-600 transition">
            Đi đến Tài liệu →
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          {/* Search */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-[40px] gap-2 mb-3 shadow-sm">
            <svg width="15" height="15" className="text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Tìm tài liệu..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700" />
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 mb-4">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">Không tìm thấy tài liệu</p>
            ) : filtered.map((doc) => {
              const id    = doc._id ?? doc.id;
              const title = doc.title ?? doc.fileName ?? "Không có tên";
              const isSel = selectedId === id;
              return (
                <button key={id} onClick={() => setSelectedId(id)}
                  className={`doc-select-card w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left ${isSel ? "selected" : "border-gray-200 bg-white"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSel ? "bg-orange-100" : "bg-gray-100"}`}>
                    <svg width="16" height="16" fill="none" stroke={isSel ? "#F26739" : "#9ca3af"} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSel ? "text-orange-600" : "text-gray-700"}`}>{title}</p>
                    {doc.createdAt && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                  {isSel && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={handleGo} disabled={!selectedId}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed primary-btn"
            style={{ background: "#F26739" }}>
            Xem Quiz của tài liệu này →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Quiz Card ─────────────────────────────────────────────────────────────────
function QuizCard({ quiz, idx, isTeacher, onStart, onEdit, onDelete }) {
  const questionCount = quiz.questionCount ?? (Array.isArray(quiz.questions) ? quiz.questions.length : 0);

  return (
    <div
      className="quiz-card bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ animation: `fadeInUp 0.28s ${idx * 0.05}s both`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        {quiz.coverImage ? (
          <img src={quiz.coverImage} alt={quiz.title}
            className="card-thumb w-full h-44 object-cover bg-[#fdf3ec]" />
        ) : (
          <div className="card-thumb w-full h-44 flex items-center justify-center" style={{ background: "#fdf3ec" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="#F26739" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        )}

        {/* Difficulty badge */}
        {quiz.difficulty && (
          <span className={`absolute top-2.5 left-2.5 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm ${
            quiz.difficulty === "EASY"   ? "bg-green-500"  :
            quiz.difficulty === "MEDIUM" ? "bg-yellow-500" : "bg-red-500"
          }`}>
            {quiz.difficulty === "EASY" ? "Dễ" : quiz.difficulty === "MEDIUM" ? "Trung bình" : "Khó"}
          </span>
        )}

        {/* Nút xóa hover — chỉ teacher */}
        {isTeacher && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(quiz); }}
            className="delete-overlay absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
          >
            <svg className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-bold text-gray-800 text-[15px] mb-1 leading-snug line-clamp-2 uppercase tracking-wide">
          {quiz.title}
        </p>
        <div className="mb-4">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Số câu hỏi </span>
          <span className="text-sm font-bold text-[#F26739]">{questionCount} câu</span>
        </div>

        <button onClick={() => onStart(quiz)}
          className="w-full py-2.5 rounded-xl text-sm text-white font-semibold primary-btn"
          style={{ background: "#F26739" }}>
          Làm bài ngay
        </button>

        {/* Nút sửa — chỉ teacher */}
        {isTeacher && (
          <button onClick={() => onEdit(quiz)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blue-200 text-xs text-blue-600 hover:bg-blue-50 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Lấy role trực tiếp từ localStorage — không cần truyền qua state
  const role      = getUserRole();         // "TEACHER" | "LEARNER" | "ADMIN"
  const isTeacher = role === "TEACHER";

  // documentId có thể đến từ location.state (navigate từ DocumentsDetailPage)
  // hoặc được set khi user chọn tài liệu ngay tại đây
  const [documentId, setDocumentId] = useState(location.state?.documentId ?? null);
  const [docTitle, setDocTitle]     = useState(location.state?.docTitle ?? "");

  const [quizzes, setQuizzes]           = useState(location.state?.quizList ?? []);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [quizView, setQuizView]         = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [searchTerm, setSearchTerm]     = useState("");

  // ── Fetch quiz theo documentId ────────────────────────────────────────────
  const fetchQuizzes = useCallback(async () => {
    if (!documentId) return;
    setLoading(true); setError("");
    try {
      const res  = await quizService.getByDocument(documentId);
      const raw  = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? raw.items ?? []);
      setQuizzes(list.map((q) => ({
        id:            q._id ?? q.id,
        _id:           q._id ?? q.id,
        title:         q.title,
        description:   q.description,
        difficulty:    q.difficulty,
        time_limit:    q.time_limit,
        questionCount: q.questionCount ?? (Array.isArray(q.questions) ? q.questions.length : 0),
        questions:     q.questions ?? [],
        coverImage:    q.coverImage ?? null,
      })));
    } catch (err) {
      setError("Không thể tải danh sách quiz. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  // ── Chọn tài liệu từ DocumentSelector ────────────────────────────────────
  const handleSelectDocument = (id, title) => {
    setDocumentId(id);
    setDocTitle(title);
    setQuizzes([]);
  };

  // ── Start quiz ────────────────────────────────────────────────────────────
  const handleStartQuiz = async (quiz) => {
  try {
    const id = quiz._id ?? quiz.id;  // ← đổi thứ tự, ưu tiên _id
    
    if (!id) {
      alert("Không tìm thấy ID quiz!");
      return;
    }

    const res    = await quizService.getById(id);
    const detail = res.data?.data ?? res.data ?? res;
    const rawQs  = detail.questions ?? [];
    if (rawQs.length === 0) { alert("Quiz này chưa có câu hỏi!"); return; }
    const normalized = rawQs.map((q) => ({
      _id:      q._id ?? q.id,
      question: q.question ?? q.q,
      options:  q.options,
      answer:   q.correctAnswerIndex ?? q.correctAnswer ?? q.answer,
    }));
    setQuizView({ quiz: detail, questions: shuffleArray(normalized).map(shuffleOptions) });
  } catch (err) {
    console.error("Start quiz error:", err); // ← thêm để debug
    alert("Không tải được câu hỏi. Vui lòng thử lại.");
  }
};

  // ── Finish quiz ───────────────────────────────────────────────────────────
 const handleFinish = ({ quiz, answers, score, total, questions, answered, resultId }) => {
  setQuizView(null);
  navigate("/teacher/quiz-result", {
    state: { quiz, answers, score, total, questions, answered, resultId, documentId }, // documentId đã có sẵn trong state
  });
};

  // ── Save (tạo / cập nhật) ─────────────────────────────────────────────────
const handleSaveQuiz = (result, isEdit) => {
  const data = result?.data?.data ?? result?.data ?? result; // ← thêm .data.data
  
  const normalized = {
    id:            data._id ?? data.id,
    _id:           data._id ?? data.id,
    title:         data.title,
    description:   data.description,
    difficulty:    data.difficulty,
    time_limit:    data.time_limit,
    questionCount: data.totalQuestions ?? (data.questions ?? []).length, // ← dùng totalQuestions
    questions:     data.questions ?? [],
  };

  if (isEdit) {
    setQuizzes((prev) => prev.map((q) =>
      (q._id === normalized._id || q.id === normalized.id) ? normalized : q
    ));
    setEditTarget(null);
  } else {
    setQuizzes((prev) => [normalized, ...prev]);
    setShowAddModal(false);
  }
};

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      setQuizzes((p) => p.filter((q) =>
        (q.id ?? q._id) !== (deleteTarget.id ?? deleteTarget._id)
      ));
      setDeleteTarget(null);
    } catch (err) {
      alert("Xoá quiz thất bại, vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    (q.title ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Quiz View mode ────────────────────────────────────────────────────────
  if (quizView) {
    return (
      <>
        <GlobalStyles />
        <QuizView
          quiz={quizView.quiz}
          questions={quizView.questions}
          onBack={() => setQuizView(null)}
          onFinish={handleFinish}
        />
      </>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyles />
      <div className="h-full overflow-y-auto bg-gray-50 px-8 py-6">

        {/* Chưa chọn tài liệu → DocumentSelector */}
        {!documentId && (
          <DocumentSelector onSelectDocument={handleSelectDocument} />
        )}

        {/* Đã chọn tài liệu → hiện grid quiz */}
        {documentId && (
          <>
            {/* Header */}
            <div className="mb-8 anim-fade-in-up">
              <button
                onClick={() => { setDocumentId(null); setQuizzes([]); setDocTitle(""); }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 back-btn"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Chọn tài liệu khác
              </button>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    Hệ thống trắc nghiệm
                  </h1>
                  {docTitle && (
                    <p className="text-sm text-gray-400 mt-1">
                      Tài liệu: <span className="text-gray-600 font-medium">{docTitle}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3.5 h-[42px] gap-2 min-w-[240px] shadow-sm">
                    <svg width="15" height="15" className="text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input type="text" placeholder="Tìm kiếm bài thi..."
                      className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>

                  {/* Chỉ teacher mới thấy Làm mới + Thêm Quiz */}
                  {isTeacher && (
                    <>
                      <button onClick={fetchQuizzes} disabled={loading}
                        className="h-[42px] px-4 border border-gray-200 bg-white rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50 shadow-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          className={loading ? "spinner" : ""}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? "Đang tải..." : "Làm mới"}
                      </button>
                      <button onClick={() => setShowAddModal(true)}
                        className="bg-[#F26739] text-white text-sm font-semibold rounded-xl px-5 h-[42px] primary-btn">
                        + Thêm Quiz
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
                <button onClick={fetchQuizzes} className="ml-auto underline font-medium">Thử lại</button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && <QuizSkeleton />}

            {/* Empty */}
            {!loading && quizzes.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">Tài liệu này chưa có quiz nào</p>
                {isTeacher && (
                  <button onClick={() => setShowAddModal(true)}
                    className="text-sm px-4 py-2 rounded-lg bg-[#F26739] text-white hover:bg-orange-600 transition">
                    + Tạo quiz đầu tiên
                  </button>
                )}
              </div>
            )}

            {/* Grid quiz */}
            {!loading && filteredQuizzes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredQuizzes.map((quiz, idx) => (
                  <QuizCard
                    key={quiz._id ?? quiz.id ?? `quiz-${idx}`}
                    quiz={quiz} idx={idx} isTeacher={isTeacher}
                    onStart={handleStartQuiz}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}

            {/* Không tìm thấy */}
            {!loading && quizzes.length > 0 && filteredQuizzes.length === 0 && (
              <div className="text-center py-20 text-gray-400 text-sm">
                Không tìm thấy bộ câu hỏi nào
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {deleteTarget && (
          <ConfirmDeleteModal
            title={deleteTarget.title}
            onConfirm={handleDeleteConfirm}
            onCancel={() => !deleting && setDeleteTarget(null)}
            deleting={deleting}
          />
        )}
        {showAddModal && (
          <AddQuizModal
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveQuiz}
            documentId={documentId}
          />
        )}
        {editTarget && (
          <AddQuizModal
            onClose={() => setEditTarget(null)}
            onSave={handleSaveQuiz}
            documentId={documentId}
            editQuiz={editTarget}
          />
        )}
      </div>
    </>
  );
}