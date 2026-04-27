// QuizPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizService } from "../../../services/quizService";
import { documentService } from "../../../services/documentService";
import { GlobalStyles } from "./GlobalStyles";
import QuizView from "./QuizView";
import AddQuizModal from "./AddQuizModal";
import { ConfirmDeleteModal, QuizSkeleton } from "./QuizComponents";

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
    explanation: question.explanation,
  };
}

function getUserRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return (user.role || "").toUpperCase();
  } catch {
    return "";
  }
}

// ── Quiz Card ────────────────────────────────────────────────────────────────
function QuizCard({
  quiz,
  isTeacher,
  onStart,
  onEdit,
  onDelete,
  docThumbnail,
}) {
  const questionCount =
    quiz.questionCount ??
    (Array.isArray(quiz.questions) ? quiz.questions.length : 0);
  const coverSrc = quiz.coverImage || docThumbnail || null;
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div className="relative overflow-hidden">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={quiz.title}
            className="w-full h-40 object-cover bg-[#fdf3ec]"
          />
        ) : (
          <div
            className="w-full h-40 flex items-center justify-center"
            style={{ background: "#fdf3ec" }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F26739"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        )}
        {quiz.difficulty && (
          <span
            className={`absolute top-2.5 left-2.5 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm ${
              quiz.difficulty === "EASY"
                ? "bg-green-500"
                : quiz.difficulty === "MEDIUM"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          >
            {quiz.difficulty === "EASY"
              ? "Dễ"
              : quiz.difficulty === "MEDIUM"
                ? "Trung bình"
                : "Khó"}
          </span>
        )}
        {isTeacher && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(quiz);
            }}
            className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
          >
            <svg
              className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="font-bold text-gray-800 text-[15px] mb-1 leading-snug line-clamp-2 uppercase tracking-wide">
          {quiz.title}
        </p>
        <div className="mb-4">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            Số câu hỏi{" "}
          </span>
          <span className="text-sm font-bold text-[#F26739]">
            {questionCount} câu
          </span>
        </div>
        <button
          onClick={() => onStart(quiz)}
          className="w-full py-2.5 rounded-xl text-sm text-white font-semibold transition"
          style={{ background: "#F26739" }}
        >
          Làm bài ngay
        </button>
        {isTeacher && (
          <button
            onClick={() => onEdit(quiz)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blue-200 text-xs text-blue-600 hover:bg-blue-50 transition"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tab: Theo tài liệu ───────────────────────────────────────────────────────
function ByDocumentTab({
  isTeacher,
  onStartQuiz,
  onOpenAddModal,
  onOpenEditModal,
}) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [selectedDocTitle, setSelectedDocTitle] = useState("");
  const [selectedDocThumb, setSelectedDocThumb] = useState(""); // ✅ FIX: thêm state
  const [docSearch, setDocSearch] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [quizSearch, setQuizSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      setDocsLoading(true);
      try {
        const res = await documentService.getAll();
        const list = res?.data ?? res ?? [];
        setDocuments(Array.isArray(list) ? list : []);
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
      const res = await quizService.getByDocument(docId);
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? raw.items ?? []);
      setQuizzes(
        list.map((q) => ({
          id: q._id ?? q.id,
          _id: q._id ?? q.id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          time_limit: q.time_limit,
          questionCount:
            q.questionCount ??
            (Array.isArray(q.questions) ? q.questions.length : 0),
          questions: q.questions ?? [],
          coverImage: q.coverImage ?? null,
        })),
      );
    } catch {
      setQuizError("Không thể tải danh sách quiz. Vui lòng thử lại.");
    } finally {
      setQuizLoading(false);
    }
  }, []);

  // ✅ FIX: lưu thumbnail khi chọn tài liệu
  const handleSelectDoc = (id, title, thumbnail) => {
    setSelectedDocId(id);
    setSelectedDocTitle(title);
    setSelectedDocThumb(thumbnail ?? "");
    setQuizzes([]);
    fetchQuizzes(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      setQuizzes((p) =>
        p.filter(
          (q) => (q.id ?? q._id) !== (deleteTarget.id ?? deleteTarget._id),
        ),
      );
      setDeleteTarget(null);
    } catch {
      alert("Xoá quiz thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    (d.title ?? d.fileName ?? "")
      .toLowerCase()
      .includes(docSearch.toLowerCase()),
  );
  const filteredQuizzes = quizzes.filter((q) =>
    (q.title ?? "").toLowerCase().includes(quizSearch.toLowerCase()),
  );

  return (
    <div className="flex gap-5">
      {/* Panel trái: danh sách tài liệu */}
      <div
        className="w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Chọn tài liệu
          </p>
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-2.5 h-8 gap-2">
            <svg
              width="12"
              height="12"
              className="text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
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
            filteredDocs.map((doc) => {
              const id = doc._id ?? doc.id;
              const title = doc.title ?? doc.fileName ?? "Không có tên";
              const isSel = selectedDocId === id;
              return (
                <button
                  key={id}
                  onClick={() =>
                    handleSelectDoc(id, title, doc.thumbnail ?? "")
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left mb-1 transition ${
                    isSel
                      ? "bg-orange-50 border border-orange-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSel ? "bg-orange-100" : "bg-gray-100"}`}
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke={isSel ? "#F26739" : "#9ca3af"}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${isSel ? "text-orange-600" : "text-gray-700"}`}
                    >
                      {title}
                    </p>
                    {doc.createdAt && (
                      <p className="text-[10px] text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                  {isSel && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Panel phải: danh sách quiz */}
      <div className="flex-1 min-w-0">
        {!selectedDocId ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <p className="text-sm text-gray-400">
              Chọn tài liệu bên trái để xem Quiz
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-gray-800 truncate max-w-xs">
                  {selectedDocTitle}
                </p>
                <p className="text-xs text-gray-400">{quizzes.length} quiz</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm">
                  <svg
                    width="12"
                    height="12"
                    className="text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm quiz..."
                    value={quizSearch}
                    onChange={(e) => setQuizSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-32 text-gray-700"
                  />
                </div>
                <button
                  onClick={() => fetchQuizzes(selectedDocId)}
                  disabled={quizLoading}
                  className="h-9 px-3 border border-gray-200 bg-white rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition flex items-center gap-1.5 shadow-sm"
                >
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className={quizLoading ? "animate-spin" : ""}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Làm mới
                </button>
                {isTeacher && (
                  <button
                    onClick={() => onOpenAddModal(selectedDocId)}
                    className="h-9 px-4 text-white text-xs font-semibold rounded-xl transition"
                    style={{ background: "#F26739" }}
                  >
                    + Thêm Quiz
                  </button>
                )}
              </div>
            </div>

            {quizError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 flex items-center gap-2">
                {quizError}
                <button
                  onClick={() => fetchQuizzes(selectedDocId)}
                  className="ml-auto underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {quizLoading && <QuizSkeleton />}

            {!quizLoading && quizzes.length === 0 && !quizError && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-sm font-medium text-gray-500">
                  Tài liệu này chưa có quiz nào
                </p>
                {isTeacher && (
                  <button
                    onClick={() => onOpenAddModal(selectedDocId)}
                    className="text-sm px-4 py-2 rounded-lg text-white"
                    style={{ background: "#F26739" }}
                  >
                    + Tạo quiz đầu tiên
                  </button>
                )}
              </div>
            )}

            {!quizLoading && filteredQuizzes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz._id ?? quiz.id}
                    quiz={quiz}
                    isTeacher={isTeacher}
                    onStart={onStartQuiz}
                    onEdit={onOpenEditModal}
                    onDelete={(q) => setDeleteTarget(q)}
                    docThumbnail={selectedDocThumb} // ✅ FIX: truyền thumbnail xuống card
                  />
                ))}
              </div>
            )}

            {!quizLoading &&
              quizzes.length > 0 &&
              filteredQuizzes.length === 0 && (
                <div className="text-center py-20 text-gray-400 text-sm">
                  Không tìm thấy quiz nào
                </div>
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

// ── Tab: Thủ công ────────────────────────────────────────────────────────────
function ManualTab({
  isTeacher,
  onStartQuiz,
  onOpenAddModal,
  onOpenEditModal,
  quizzes,
  onDeleteQuiz,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      onDeleteQuiz(deleteTarget.id ?? deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      alert("Xoá quiz thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = quizzes.filter((q) =>
    (q.title ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-bold text-gray-800">Quiz thủ công</p>
          <p className="text-xs text-gray-400">
            Không gắn với tài liệu · {quizzes.length} quiz
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quizzes.length > 0 && (
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm">
              <svg
                width="12"
                height="12"
                className="text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm quiz..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-32 text-gray-700"
              />
            </div>
          )}
          {isTeacher && (
            <button
              onClick={() => onOpenAddModal(null)}
              className="h-9 px-4 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              style={{ background: "#F26739" }}
            >
              ✏️ Tạo Quiz thủ công
            </button>
          )}
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="#F26739"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Chưa có quiz thủ công nào
          </p>
          {isTeacher && (
            <button
              onClick={() => onOpenAddModal(null)}
              className="text-sm px-5 py-2.5 rounded-xl text-white"
              style={{ background: "#F26739" }}
            >
              ✏️ Tạo Quiz đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quiz) => (
            <QuizCard
              key={quiz._id ?? quiz.id}
              quiz={quiz}
              isTeacher={isTeacher}
              onStart={onStartQuiz}
              onEdit={onOpenEditModal}
              onDelete={(q) => setDeleteTarget(q)}
            />
          ))}
        </div>
      )}

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

// ── Main Page ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();

  const role = getUserRole();
  const isTeacher = role === "TEACHER";

  const [activeTab, setActiveTab] = useState("document");
  const [quizView, setQuizView] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDocumentId, setAddDocumentId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const [manualQuizzes, setManualQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem("manualQuizzes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("manualQuizzes", JSON.stringify(manualQuizzes));
  }, [manualQuizzes]);

  const handleStartQuiz = async (quiz) => {
    try {
      const id = quiz._id ?? quiz.id;
      if (!id) {
        alert("Không tìm thấy ID quiz!");
        return;
      }

      if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        const normalized = quiz.questions.map((q) => ({
          _id: q._id ?? q.id,
          question: q.question ?? q.q,
          options: Array.isArray(q.options)
            ? q.options
            : [q.optionA, q.optionB, q.optionC, q.optionD],
          answer:
            q.correctAnswerIndex ??
            (typeof q.correctAnswer === "number"
              ? q.correctAnswer
              : q.options?.indexOf(q.correctAnswer)) ??
            q.answer ??
            0,
          explanation: q.explanation ?? q.explain ?? "",
        }));
        setQuizView({
          quiz,
          questions: shuffleArray(normalized).map(shuffleOptions),
        });
        return;
      }

      const res = await quizService.getById(id);
      const detail = res.data?.data ?? res.data ?? res;
      const rawQs = detail.questions ?? [];
      if (rawQs.length === 0) {
        alert("Quiz này chưa có câu hỏi!");
        return;
      }
      const normalized = rawQs.map((q) => ({
        _id: q._id ?? q.id,
        question: q.question ?? q.q,
        options: q.options,
        answer: q.correctAnswerIndex ?? q.correctAnswer ?? q.answer,
      }));
      setQuizView({
        quiz: detail,
        questions: shuffleArray(normalized).map(shuffleOptions),
      });
    } catch (err) {
      console.error("Start quiz error:", err);
      alert("Không tải được câu hỏi. Vui lòng thử lại.");
    }
  };

  const handleFinish = ({
    quiz,
    answers,
    score,
    total,
    questions,
    answered,
    resultId,
  }) => {
    setQuizView(null);
    navigate("/teacher/quiz-result", {
      state: { quiz, answers, score, total, questions, answered, resultId },
    });
  };

  const handleOpenAddModal = (docId) => {
    setAddDocumentId(docId ?? null);
    setShowAddModal(true);
  };

  const handleSaveQuiz = (result, isEdit, localQuestions = []) => {
    const data = result?.data?.data ?? result?.data ?? result;
    const finalQuestions =
      localQuestions.length > 0 ? localQuestions : (data.questions ?? []);
    const normalized = {
      id: data._id ?? data.id,
      _id: data._id ?? data.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      time_limit: data.time_limit,
      questionCount: finalQuestions.length,
      questions: finalQuestions,
    };

    if (isEdit) {
      setManualQuizzes((prev) =>
        prev.map((q) =>
          q._id === normalized._id || q.id === normalized.id ? normalized : q,
        ),
      );
      setEditTarget(null);
    } else {
      if (!addDocumentId) {
        setManualQuizzes((prev) => [normalized, ...prev]);
        setActiveTab("manual");
      }
      setShowAddModal(false);
    }
  };

  if (quizView)
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

  return (
    <>
      <GlobalStyles />
      <div className="h-full overflow-y-auto bg-gray-50 px-8 py-6">
        {/* Header + Tabs */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">
            Hệ thống trắc nghiệm
          </h1>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1 w-fit shadow-sm">
            <button
              onClick={() => setActiveTab("document")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "document"
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === "document" ? { background: "#F26739" } : {}}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Theo tài liệu
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "manual"
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === "manual" ? { background: "#F26739" } : {}}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Thủ công
              {manualQuizzes.length > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === "manual"
                      ? "bg-white/30 text-white"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {manualQuizzes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "document" && (
          <ByDocumentTab
            isTeacher={isTeacher}
            onStartQuiz={handleStartQuiz}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={setEditTarget}
          />
        )}
        {activeTab === "manual" && (
          <ManualTab
            isTeacher={isTeacher}
            onStartQuiz={handleStartQuiz}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={setEditTarget}
            quizzes={manualQuizzes}
            onDeleteQuiz={(id) =>
              setManualQuizzes((p) => p.filter((q) => (q.id ?? q._id) !== id))
            }
          />
        )}

        {showAddModal && (
          <AddQuizModal
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveQuiz}
            documentId={addDocumentId}
          />
        )}
        {editTarget && (
          <AddQuizModal
            onClose={() => setEditTarget(null)}
            onSave={handleSaveQuiz}
            documentId={editTarget.documentId ?? null}
            editQuiz={editTarget}
          />
        )}
      </div>
    </>
  );
}
