// DocumentsDetailPage.jsx
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { documentService } from "../../../services/documentService";
import api from "../../../lib/api";
import QuizPageInline from "./QuizPageInline";
import FlashcardPageInline from "./FlashcardPageInline";


const tabs = ["Thông tin", "Chat", "Quizz", "FlashCard"];
const DEFAULT_COVERS = ["/anh1.jpg", "/anh2.jpg", "/anh3.jpg", "/anh6.jpg"];

/* ── Icons ── */
const IconBack = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconQuiz = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const IconCards = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="16" height="13" rx="2" />
    <path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
  </svg>
);
const IconChat = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

/* ── Confirm Generate Modal ── */
const ConfirmGenerateModal = ({ type, onConfirm, onCancel, loading }) => {
  const [numQuestions, setNumQuestions] = useState(10);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[340px] p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full ${
            type === "quiz"
              ? "bg-orange-50 border border-orange-100"
              : "bg-purple-50 border border-purple-100"
          }`}
        >
          {type === "quiz" ? <IconQuiz /> : <IconCards />}
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1.5">
          Tạo {type === "quiz" ? "bài kiểm tra" : "bộ Flashcard"} bằng AI?
        </p>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          AI sẽ tự động phân tích nội dung tài liệu và tạo{" "}
          {type === "quiz" ? "câu hỏi kiểm tra" : "bộ thẻ học"} phù hợp.
        </p>
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 mb-2 text-left">
            Số câu hỏi
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNumQuestions((n) => Math.max(1, n - 1))}
              disabled={loading}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-bold disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={numQuestions}
              onChange={(e) =>
                setNumQuestions(
                  Math.min(50, Math.max(1, Number(e.target.value))),
                )
              }
              disabled={loading}
              className="flex-1 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold text-gray-800 outline-none focus:border-orange-400 disabled:opacity-40"
            />
            <button
              onClick={() => setNumQuestions((n) => Math.min(50, n + 1))}
              disabled={loading}
              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-left">
            Tối đa 50 câu
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => onConfirm(numQuestions)}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition flex items-center justify-center gap-2 ${
              type === "quiz"
                ? "bg-[#F26739] hover:bg-orange-600"
                : "bg-purple-500 hover:bg-purple-600"
            } disabled:opacity-60`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                Đang tạo...
              </>
            ) : (
              "✨ Tạo ngay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, message, sub }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-500">{message}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */

export default function DocumentsDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [doc, setDoc] = useState(location.state?.doc ?? null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab ?? "Thông tin",
  );

  const getCoverDetail = (d) => {
    if (
      d?.coverImage &&
      d.coverImage.trim() !== "" &&
      d.coverImage !== "null"
    ) {
      return d.coverImage;
    }
    const docId = d?._id?.toString() ?? "";
    const hash = docId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return DEFAULT_COVERS[hash % DEFAULT_COVERS.length];
  };

  const coverImg = getCoverDetail(doc);

  // Quiz
  const [quizList, setQuizList] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Flashcard
  const [flashList, setFlashList] = useState([]);
  const [flashLoading, setFlashLoading] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [generatingFlash, setGeneratingFlash] = useState(false);
  const [selectedFlash, setSelectedFlash] = useState(null);

  // Load tài liệu
  useEffect(() => {
    documentService
      .getById(id)
      .then((res) => setDoc(res.data))
      .catch((err) =>
        console.error("Lỗi tải tài liệu:", err.response?.data ?? err.message),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.key]);

  useEffect(() => {
    if (activeTab === "Quizz") loadQuizList();
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === "FlashCard") loadFlashList();
  }, [activeTab]);
  useEffect(() => {
    if (activeTab !== "Quizz") setSelectedQuiz(null);
  }, [activeTab]);
  useEffect(() => {
    if (activeTab !== "FlashCard") setSelectedFlash(null);
  }, [activeTab]);

  const loadQuizList = async () => {
    try {
      setQuizLoading(true);
      const res = await api.get(`/quizzes/${id}`);
      const raw = res.data.data ?? res.data ?? [];
      setQuizList(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn("Lỗi tải quiz:", err.message);
      setQuizList([]);
    } finally {
      setQuizLoading(false);
    }
  };

  const loadFlashList = async () => {
    try {
      setFlashLoading(true);
      const res = await api.get(`/flashcards?documentId=${id}`);
      const raw = res.data.data ?? res.data ?? [];
      setFlashList(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn("Lỗi tải flashcard:", err.message);
      setFlashList([]);
    } finally {
      setFlashLoading(false);
    }
  };

  const handleGenerateQuiz = async (numQuestions) => {
    try {
      setGeneratingQuiz(true);
      await api.post("/ai/generate-quiz", { documentId: id, numQuestions });
      setShowQuizModal(false);
      await loadQuizList();
    } catch (err) {
      alert(err.response?.data?.error ?? "Lỗi tạo quiz, vui lòng thử lại.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleGenerateFlash = async (numQuestions) => {
    try {
      setGeneratingFlash(true);
      await api.post("/ai/generate-flashcards", {
        documentId: id,
        numQuestions,
      });
      setShowFlashModal(false);
      await loadFlashList();
    } catch (err) {
      alert(
        err.response?.data?.error ?? "Lỗi tạo flashcard, vui lòng thử lại.",
      );
    } finally {
      setGeneratingFlash(false);
    }
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Đang tải tài liệu...</p>
        </div>
      </div>
    );

  if (!doc)
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
        <p className="text-sm">Không tìm thấy tài liệu</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-orange-500 hover:underline"
        >
          ← Quay lại
        </button>
      </div>
    );

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition"
        >
          <IconBack /> Trở về
        </button>
        <button className="flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm transition">
          <IconEdit /> Chỉnh sửa
        </button>
      </div>

      <div className="px-6 pb-6 w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-4">{doc.title}</h1>

        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#F26739] text-[#F26739] font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ═════════════════ THÔNG TIN ═════════════════ */}
        {activeTab === "Thông tin" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <img
                src={coverImg}
                alt={doc.title}
                className="w-full h-72 object-cover object-top bg-gray-100"
              />
              <div className="p-4">
                {doc.description && (
                  <p className="text-sm text-gray-500 mb-3">
                    {doc.description}
                  </p>
                )}
                <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                  <span
                    className={`font-medium ${doc.status === "ready" ? "text-green-600" : doc.status === "processing" ? "text-orange-500" : "text-red-500"}`}
                  >
                    {doc.status === "ready"
                      ? "✓ Đã xử lý"
                      : doc.status === "processing"
                        ? "⏳ Đang xử lý..."
                        : "✗ Lỗi xử lý"}
                  </span>
                  <span>📚 {doc.flashcardCount ?? 0} flashcard</span>
                  <span>📝 {doc.quizCount ?? 0} quiz</span>
                </div>
                {doc.fileName && (
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    📄 {doc.fileName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  navigate(`/teacher/baigiang/${id}`, { state: { doc } })
                }
                className="group relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg rounded-xl p-5 text-left transition-all duration-200 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <span className="text-blue-400 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    <IconArrowRight />
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  Bài giảng
                </p>
                <p className="text-xs text-gray-400 truncate">
                  📄 {doc.fileName ?? "Xem tài liệu"}
                </p>
              </button>

              <button
                onClick={() => setActiveTab("Quizz")}
                className="group relative bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg rounded-xl p-5 text-left transition-all duration-200 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#F26739] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F26739"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <span className="text-orange-400 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    <IconArrowRight />
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  Bài kiểm tra
                </p>
                <p className="text-xs text-gray-400">
                  {doc.quizCount ?? 0} bài kiểm tra
                </p>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  Thông tin tài liệu
                </p>
              </div>
              <div className="px-4 py-3 space-y-2.5 text-sm text-gray-600">
                {[
                  ["Tên file", doc.fileName ?? "—"],
                  [
                    "Dung lượng",
                    doc.fileSize
                      ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`
                      : "—",
                  ],
                  ["Flashcard", doc.flashcardCount ?? 0],
                  ["Quiz", doc.quizCount ?? 0],
                  [
                    "Ngày tạo",
                    doc.createdAt
                      ? new Date(doc.createdAt).toLocaleDateString("vi-VN")
                      : "—",
                  ],
                  [
                    "Cập nhật",
                    doc.updatedAt
                      ? new Date(doc.updatedAt).toLocaleDateString("vi-VN")
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium truncate max-w-[60%] text-right">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-400">Trạng thái</span>
                  <span
                    className={`font-medium ${doc.status === "ready" ? "text-green-500" : doc.status === "processing" ? "text-orange-500" : "text-red-500"}`}
                  >
                    {doc.status === "ready"
                      ? "Đã xử lý"
                      : doc.status === "processing"
                        ? "Đang xử lý..."
                        : "Lỗi"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════ CHAT ═════════════════ */}
        {activeTab === "Chat" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <IconChat />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Chat với tài liệu
                </p>
                <p className="text-xs text-gray-400">
                  Hỏi đáp nội dung tài liệu bằng AI
                </p>
              </div>
            </div>
            <EmptyState
              icon={<IconChat />}
              message="Tính năng Chat đang phát triển"
              sub="Sắp ra mắt trong phiên bản tiếp theo"
            />
          </div>
        )}

        {/* ═════════════════ QUIZZ ═════════════════ */}
        {activeTab === "Quizz" &&
          (selectedQuiz ? (
            <QuizPageInline
              quiz={selectedQuiz}
              documentId={id}
              onBack={() => setSelectedQuiz(null)}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F26739]">
                    <IconQuiz />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Danh sách bài kiểm tra
                    </p>
                    <p className="text-xs text-gray-400">
                      {quizList.length > 0
                        ? `${quizList.length} bài kiểm tra`
                        : "Chưa có bài kiểm tra nào"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="flex items-center gap-1.5 bg-[#F26739] hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm"
                >
                  <IconPlus /> Tạo bằng AI
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {quizLoading ? (
                  <div className="flex items-center justify-center py-14 gap-3">
                    <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Đang tải...</p>
                  </div>
                ) : quizList.length === 0 ? (
                  <EmptyState
                    icon={<IconQuiz />}
                    message="Chưa có bài kiểm tra nào"
                    sub='Nhấn "Tạo bằng AI" để tự động tạo từ nội dung tài liệu'
                  />
                ) : (
                  quizList.map((quiz, idx) => (
                    <div
                      key={quiz._id ?? idx}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer group"
                      onClick={() => setSelectedQuiz(quiz)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F26739] shrink-0 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {quiz.title ?? `Bài kiểm tra ${idx + 1}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {quiz.questionCount ?? quiz.questions?.length ?? 0}{" "}
                            câu hỏi
                            {quiz.createdAt &&
                              ` · ${new Date(quiz.createdAt).toLocaleDateString("vi-VN")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {quiz.status && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              quiz.status === "published"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {quiz.status === "published"
                              ? "Đã xuất bản"
                              : "Nháp"}
                          </span>
                        )}
                        <span className="text-gray-300 group-hover:text-orange-400 transition">
                          <IconArrowRight />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

        {/* ═════════════════ FLASHCARD ═════════════════ */}
        {activeTab === "FlashCard" &&
          (selectedFlash ? (
            <FlashcardPageInline
              flash={selectedFlash}
              onBack={() => setSelectedFlash(null)}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                    <IconCards />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Danh sách bộ Flashcard
                    </p>
                    <p className="text-xs text-gray-400">
                      {flashList.length > 0
                        ? `${flashList.length} bộ thẻ`
                        : "Chưa có bộ thẻ nào"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFlashModal(true)}
                  className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm"
                >
                  <IconPlus /> Tạo bằng AI
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {flashLoading ? (
                  <div className="flex items-center justify-center py-14 gap-3">
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Đang tải...</p>
                  </div>
                ) : flashList.length === 0 ? (
                  <EmptyState
                    icon={<IconCards />}
                    message="Chưa có bộ thẻ nào"
                    sub='Nhấn "Tạo bằng AI" để tự động tạo từ nội dung tài liệu'
                  />
                ) : (
                  flashList.map((flash, idx) => (
                    <div
                      key={flash._id ?? idx}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer group"
                      onClick={() => {
                        console.log(">>> flash:", JSON.stringify(flash));
                        setSelectedFlash(flash);
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 shrink-0 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {flash.title ?? `Bộ thẻ ${idx + 1}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {Array.isArray(flash.cards)
                              ? flash.cards.length
                              : (flash.count ?? 0)}{" "}
                            thẻ học
                            {flash.createdAt &&
                              ` · ${new Date(flash.createdAt).toLocaleDateString("vi-VN")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {flash.progress !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-400 rounded-full"
                                style={{ width: `${flash.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {flash.progress}%
                            </span>
                          </div>
                        )}
                        <span className="text-gray-300 group-hover:text-purple-400 transition">
                          <IconArrowRight />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
      </div>

      {showQuizModal && (
        <ConfirmGenerateModal
          type="quiz"
          loading={generatingQuiz}
          onConfirm={handleGenerateQuiz}
          onCancel={() => !generatingQuiz && setShowQuizModal(false)}
        />
      )}
      {showFlashModal && (
        <ConfirmGenerateModal
          type="flash"
          loading={generatingFlash}
          onConfirm={handleGenerateFlash}
          onCancel={() => !generatingFlash && setShowFlashModal(false)}
        />
      )}
    </div>
  );
}
