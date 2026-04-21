import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft, Clock, Check, AlertTriangle, ArrowRight,
  Plus, ClipboardList, CreditCard, Sparkles, Loader2,
  BookOpen, PanelLeftClose, PanelLeftOpen, X, SlidersHorizontal,
} from "lucide-react";

const API = "http://localhost:8000/api/v1";
const TABS = ["Bài giảng", "Quizz", "FlashCard"];

/* ══════════════ SHARED COMPONENTS ══════════════ */
function RenderChunkContent({ text }) {
  if (!text) return null;
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return (
    <>
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        const isHeading = trimmed.length < 80 && !trimmed.endsWith(".");
        if (isHeading && i === 0)
          return <h3 key={i} className="text-base font-bold text-gray-800 mt-6 mb-2">{trimmed}</h3>;
        return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3">{trimmed}</p>;
      })}
    </>
  );
}

function LoadingScreen({ message = "Đang tải bài giảng..." }) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onBack }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-1">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{message}</p>
      <button onClick={onBack} className="mt-2 text-sm text-[#F26739] hover:underline font-medium">
        ← Quay lại
      </button>
    </div>
  );
}

function CompletionModal({ title, onBack, onGoToQuiz }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[340px] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
          <Check className="w-8 h-8 text-green-500" strokeWidth={2.5} />
        </div>
        <p className="text-lg font-bold text-gray-800 mb-1">Hoàn thành!</p>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Bạn đã hoàn thành bài giảng<br />
          <span className="font-medium text-gray-600">"{title}"</span>
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onGoToQuiz}
            className="w-full py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2">
            <ClipboardList size={15} /> Làm bài kiểm tra
          </button>
          <button onClick={onBack}
            className="w-full py-2.5 rounded-xl bg-[#F26739] text-white text-sm font-semibold hover:bg-orange-600 transition">
            Quay về danh sách tài liệu
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Quiz Generate Modal — giống style FlashCard, nhập tay số câu ── */
function QuizGenerateModal({ onConfirm, onCancel, loading }) {
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "") { setNumQuestions(""); return; }
    const n = parseInt(val, 10);
    if (!isNaN(n)) setNumQuestions(Math.min(10, Math.max(1, n)));
  };

  const isValid = numQuestions !== "" && numQuestions >= 1 && numQuestions <= 10;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
      onClick={() => !loading && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-[340px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full bg-orange-50 border border-orange-100">
          <ClipboardList size={20} className="text-[#F26739]" />
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1.5">Tạo bài kiểm tra bằng AI?</p>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          AI sẽ tự động phân tích nội dung tài liệu và tạo câu hỏi phù hợp.
        </p>

        {/* Tiêu đề */}
        <div className="mb-3 text-left">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Tiêu đề bài kiểm tra
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Kiểm tra chương 1..."
            disabled={loading}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#F26739] bg-gray-50 focus:bg-white transition disabled:opacity-50"
          />
        </div>

        {/* Số câu hỏi — nhập tay */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Số câu hỏi <span className="normal-case font-normal text-gray-400">(tối đa 10)</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={numQuestions}
            onChange={handleChange}
            disabled={loading}
            placeholder="1 – 10"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#F26739] bg-gray-50 focus:bg-white transition disabled:opacity-50 text-center font-semibold text-gray-700"
          />
          {numQuestions !== "" && (numQuestions < 1 || numQuestions > 10) && (
            <p className="text-xs text-red-400 mt-1.5 text-center">Vui lòng nhập từ 1 đến 10 câu</p>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
            Huỷ
          </button>
          <button
            onClick={() => isValid && onConfirm({ title: title.trim(), numQuestions: Number(numQuestions) })}
            disabled={loading || !isValid}
            className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium bg-[#F26739] hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Đang tạo...</>
              : <><Sparkles size={15} /> Tạo ngay</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Flashcard Generate Modal ── */
function FlashGenerateModal({ onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
      onClick={() => !loading && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-[340px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-full bg-purple-50 border border-purple-100">
          <CreditCard size={20} className="text-purple-500" />
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1.5">Tạo bộ Flashcard bằng AI?</p>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          AI sẽ tự động phân tích nội dung tài liệu và tạo bộ thẻ học phù hợp.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
            Huỷ
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium bg-purple-500 hover:bg-purple-600 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Đang tạo...</>
              : <><Sparkles size={15} /> Tạo ngay</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ icon, message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {sub && <p className="text-xs text-gray-400 text-center max-w-xs">{sub}</p>}
    </div>
  );
}

/* ── List Item ── */
function ListItem({ index, title, sub, badge, badgeColor, accent, onClick, rightSlot }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition cursor-pointer group border-b border-gray-50 last:border-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${accent}`}>
          {index + 1}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
        )}
        {rightSlot}
        <ArrowRight size={15} className="text-gray-300 group-hover:text-gray-500 transition" />
      </div>
    </div>
  );
}

/* ══════════════ DATA HELPERS ══════════════ */
function buildChapters(chunks = []) {
  if (!chunks.length) return [];
  return [{ id: 0, title: "Nội dung bài giảng", content: chunks.map((c) => c.content).join("\n\n") }];
}
function buildChaptersFromText(text) {
  if (!text?.trim()) return [];
  return [{ id: 0, title: "Nội dung bài giảng", content: text }];
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function BaiGiangPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [doc, setDoc] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Bài giảng");

  const [quizList, setQuizList] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const [flashList, setFlashList] = useState([]);
  const [flashLoading, setFlashLoading] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [generatingFlash, setGeneratingFlash] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API}/documents/${id}`, { headers });
        const fetchedDoc = res.data.data;
        setDoc(fetchedDoc);
        const status = fetchedDoc.status;
        if (status === "failed") { setError("Tài liệu bị lỗi xử lý. Vui lòng xóa và tải lên lại."); return; }
        if (status === "processing") { setError("Tài liệu đang được xử lý. Vui lòng thử lại sau."); return; }
        if (status !== "ready") { setError(`Trạng thái không hợp lệ: "${status}"`); return; }
        if (fetchedDoc.chunks?.length) setChapters(buildChapters(fetchedDoc.chunks));
        else if (fetchedDoc.extractedText?.trim()) setChapters(buildChaptersFromText(fetchedDoc.extractedText));
        else setError("Tài liệu chưa có nội dung. Vui lòng xóa và tải lên lại.");
      } catch (err) {
        if (err.response?.status === 404) setError("Không tìm thấy tài liệu.");
        else if (err.response?.status === 401) setError("Phiên đăng nhập hết hạn.");
        else setError("Không thể tải nội dung bài giảng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => { if (activeTab === "Quizz") loadQuizList(); }, [activeTab]);
  useEffect(() => { if (activeTab === "FlashCard") loadFlashList(); }, [activeTab]);

  const loadQuizList = async () => {
    try {
      setQuizLoading(true);
      const res = await axios.get(`${API}/quizzes?documentId=${id}`, { headers });
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
      const res = await axios.get(`${API}/flashcards?documentId=${id}`, { headers });
      const raw = res.data.data ?? res.data ?? [];
      setFlashList(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn("Lỗi tải flashcard:", err.message);
      setFlashList([]);
    } finally {
      setFlashLoading(false);
    }
  };

  const handleGenerateQuiz = async ({ title, numQuestions }) => {
    try {
      setGeneratingQuiz(true);
      await axios.post(
        `${API}/ai/generate-quiz`,
        { documentId: id, numQuestions, title: title || undefined },
        { headers }
      );
      setShowQuizModal(false);
      await loadQuizList();
    } catch (err) {
      alert(err.response?.data?.error ?? "Lỗi tạo quiz, vui lòng thử lại.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleGenerateFlash = async () => {
    try {
      setGeneratingFlash(true);
      await axios.post(`${API}/ai/generate-flashcards`, { documentId: id, count: 10 }, { headers });
      setShowFlashModal(false);
      await loadFlashList();
    } catch (err) {
      alert(err.response?.data?.error ?? "Lỗi tạo flashcard, vui lòng thử lại.");
    } finally {
      setGeneratingFlash(false);
    }
  };

  const currentChapter = chapters[0] ?? null;
  const progress = completed ? 100 : 0;
  const handleComplete = () => { setCompleted(true); setShowCompletionModal(true); };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onBack={() => navigate(-1)} />;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
            <ChevronLeft size={18} /> Trở về
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => navigate(`/teacher/documents/${id}`, { state: { doc, activeTab: "Thông tin" } })}
            className="text-sm text-gray-400 hover:text-[#F26739] hover:underline transition-colors">
            Bài Giảng
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700 line-clamp-1 max-w-xs">
            {doc?.title ?? "Đang tải..."}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "Bài giảng" && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#F26739] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-500 font-medium">{progress}%</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-700 transition p-1.5 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        {sidebarOpen && (
          <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <img src={doc?.coverImage ?? "/anh1.jpg"} alt={doc?.title}
                className="w-full h-28 object-cover rounded-xl mb-3"
                onError={(e) => { e.target.style.display = "none"; }} />
              <p className="text-sm font-semibold text-gray-800 line-clamp-2">{doc?.title}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Clock size={12} /> 1 phần
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="w-full text-left px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2.5">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  completed ? "bg-green-500 text-white" : "bg-[#F26739] text-white"
                }`}>
                  {completed
                    ? <Check size={11} strokeWidth={3} />
                    : <span className="text-xs font-bold">1</span>}
                </div>
                <p className="text-xs font-medium text-[#F26739]">Nội dung bài giảng</p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {/* TAB BAR */}
          <div className="bg-white border-b border-gray-100 px-6">
            <div className="flex">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm transition border-b-2 -mb-px flex items-center gap-2 ${
                    activeTab === tab
                      ? tab === "Quizz"
                        ? "border-blue-500 text-blue-600 font-medium"
                        : tab === "FlashCard"
                        ? "border-purple-500 text-purple-600 font-medium"
                        : "border-[#F26739] text-[#F26739] font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {tab === "Bài giảng" && <BookOpen size={14} />}
                  {tab === "Quizz" && <ClipboardList size={14} />}
                  {tab === "FlashCard" && <CreditCard size={14} />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ════ BÀI GIẢNG ════ */}
          {activeTab === "Bài giảng" && (
            <div className="max-w-3xl mx-auto px-8 py-8">
              {currentChapter ? (
                <>
                  <div className="mb-6">
                    <span className="text-xs font-medium text-[#F26739] bg-orange-50 px-2.5 py-1 rounded-full">
                      Phần 1 / 1
                    </span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">{doc?.title}</h2>
                  </div>
                  <div className="border-t border-gray-100 mb-6" />
                  <RenderChunkContent text={currentChapter.content} />
                  <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Sau khi đọc xong, bấm hoàn thành để tiếp tục.</p>
                    <button onClick={handleComplete} disabled={completed}
                      className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                        completed
                          ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
                          : "bg-[#F26739] text-white hover:bg-orange-600"
                      }`}>
                      {completed
                        ? <><Check size={14} strokeWidth={3} /> Đã hoàn thành</>
                        : "Hoàn thành bài giảng ✓"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  Không có nội dung để hiển thị.
                </div>
              )}
            </div>
          )}

          {/* ════ QUIZZ ════ */}
          {activeTab === "Quizz" && (
            <div className="max-w-3xl mx-auto px-6 py-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <ClipboardList size={16} className="text-[#F26739]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Danh sách bài kiểm tra</p>
                      <p className="text-xs text-gray-400">
                        {quizList.length > 0 ? `${quizList.length} bài kiểm tra` : "Chưa có bài kiểm tra nào"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowQuizModal(true)}
                    className="flex items-center gap-1.5 bg-[#F26739] hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm">
                    <Plus size={14} /> Tạo bằng AI
                  </button>
                </div>
                {quizLoading ? (
                  <div className="flex items-center justify-center py-14 gap-3">
                    <Loader2 size={18} className="text-orange-400 animate-spin" />
                    <p className="text-sm text-gray-400">Đang tải...</p>
                  </div>
                ) : quizList.length === 0 ? (
                  <EmptyState
                    icon={<ClipboardList size={22} />}
                    message="Chưa có bài kiểm tra nào"
                    sub='Nhấn "Tạo bằng AI" để tự động tạo từ nội dung tài liệu'
                  />
                ) : (
                  quizList.map((quiz, idx) => (
                    <ListItem
                      key={quiz._id ?? idx}
                      index={idx}
                      title={quiz.title ?? `Bài kiểm tra ${idx + 1}`}
                      sub={`${quiz.questionCount ?? quiz.questions?.length ?? 0} câu hỏi${quiz.createdAt ? ` · ${new Date(quiz.createdAt).toLocaleDateString("vi-VN")}` : ""}`}
                      badge={quiz.status === "published" ? "Đã xuất bản" : quiz.status ? "Nháp" : null}
                      badgeColor={quiz.status === "published" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}
                      accent="bg-orange-50 text-[#F26739]"
                      onClick={() => navigate(`/teacher/quiz/${quiz._id}`, { state: { doc } })}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ════ FLASHCARD ════ */}
          {activeTab === "FlashCard" && (
            <div className="max-w-3xl mx-auto px-6 py-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <CreditCard size={16} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Danh sách bộ Flashcard</p>
                      <p className="text-xs text-gray-400">
                        {flashList.length > 0 ? `${flashList.length} bộ thẻ` : "Chưa có bộ thẻ nào"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowFlashModal(true)}
                    className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm">
                    <Plus size={14} /> Tạo bằng AI
                  </button>
                </div>
                {flashLoading ? (
                  <div className="flex items-center justify-center py-14 gap-3">
                    <Loader2 size={18} className="text-purple-400 animate-spin" />
                    <p className="text-sm text-gray-400">Đang tải...</p>
                  </div>
                ) : flashList.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard size={22} />}
                    message="Chưa có bộ thẻ nào"
                    sub='Nhấn "Tạo bằng AI" để tự động tạo từ nội dung tài liệu'
                  />
                ) : (
                  flashList.map((flash, idx) => (
                    <ListItem
                      key={flash._id ?? idx}
                      index={idx}
                      title={flash.title ?? `Bộ thẻ ${idx + 1}`}
                      sub={`${Array.isArray(flash.cards) ? flash.cards.length : (flash.count ?? 0)} thẻ học${flash.createdAt ? ` · ${new Date(flash.createdAt).toLocaleDateString("vi-VN")}` : ""}`}
                      accent="bg-purple-50 text-purple-500"
                      rightSlot={
                        flash.progress !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-400 rounded-full"
                                style={{ width: `${flash.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400">{flash.progress}%</span>
                          </div>
                        ) : null
                      }
                      onClick={() => navigate(`/teacher/flashcards/${flash._id}`, {
                        state: { fromApi: true, documentId: id }
                      })}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showCompletionModal && (
        <CompletionModal
          title={doc?.title ?? ""}
          onBack={() => navigate("/teacher/documents")}
          onGoToQuiz={() => { setShowCompletionModal(false); setActiveTab("Quizz"); }}
        />
      )}
      {showQuizModal && (
        <QuizGenerateModal
          loading={generatingQuiz}
          onConfirm={handleGenerateQuiz}
          onCancel={() => !generatingQuiz && setShowQuizModal(false)}
        />
      )}
      {showFlashModal && (
        <FlashGenerateModal
          loading={generatingFlash}
          onConfirm={handleGenerateFlash}
          onCancel={() => !generatingFlash && setShowFlashModal(false)}
        />
      )}
    </div>
  );
}