import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { documentService } from "../../../services/documentService";
import api from "../../../lib/api";
import QuizPageInline      from "./QuizPageInline";
import FlashcardPageInline from "./FlashcardPageInline";
import EditDocumentModal   from "./EditDocumentModal";
import ConfirmGenerateModal from "./ConfirmGenerateModal";
import TabThongTin         from "./TabThongTin";
import ChatAI              from "./ChatAI";  
import { IconBack, IconEdit, IconQuiz, IconCards, IconChat, IconPlus, IconArrowRight, EmptyState } from "./icons";

const tabs = ["Thông tin", "Chat", "Quizz", "FlashCard"];

export default function DocumentsDetailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams();

  const [doc, setDoc]           = useState(location.state?.doc ?? null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab ?? "Thông tin");
  const [showEditModal, setShowEditModal] = useState(false);

  const [quizList, setQuizList]         = useState([]);
  const [quizLoading, setQuizLoading]   = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [flashList, setFlashList]           = useState([]);
  const [flashLoading, setFlashLoading]     = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [generatingFlash, setGeneratingFlash] = useState(false);
  const [selectedFlash, setSelectedFlash]   = useState(null);

  const loadDoc = () => {
    documentService.getById(id)
      .then(res => setDoc(res.data))
      .catch(err => console.error("Lỗi tải tài liệu:", err.response?.data ?? err.message))
      .finally(() => setLoading(false));
  };

  const loadQuizList = async () => {
    try { setQuizLoading(true); const res = await api.get(`/quizzes/document/${id}`); setQuizList(Array.isArray(res.data.data ?? res.data) ? (res.data.data ?? res.data) : []); }
    catch { setQuizList([]); } finally { setQuizLoading(false); }
  };

  const loadFlashList = async () => {
  try {
    setFlashLoading(true);
    const res = await api.get("/flashcards");
    const all = Array.isArray(res.data.data ?? res.data) ? (res.data.data ?? res.data) : [];
    // Filter chỉ lấy flashcard thuộc tài liệu hiện tại
    const filtered = all.filter(f => {
      const docId = f.documentId?._id ?? f.documentId;
      return docId === id;
    });
    setFlashList(filtered);
  } catch {
    setFlashList([]);
  } finally {
    setFlashLoading(false);
  }
}; 

 const handleGenerateQuiz = async (n) => {
  try {
    setGeneratingQuiz(true);
    // Đếm số quiz đã có để đặt tên version
    const existingCount = quizList.length;
    const baseName = `${doc.title} - Quiz`;
    const title = existingCount === 0 ? baseName : `${baseName} v${existingCount + 1}.0`;

    await api.post("/ai/generate-quiz", { documentId: id, numQuestions: n, title });
    setShowQuizModal(false);
    await loadQuizList();
  } catch (err) {
    alert(err.response?.data?.error ?? "Lỗi tạo quiz");
  } finally {
    setGeneratingQuiz(false);
  }
};

  const handleGenerateFlash = async (n) => {
    try { setGeneratingFlash(true); await api.post("/ai/generate-flashcards", { documentId: id, numQuestions: n }); setShowFlashModal(false); await loadFlashList(); }
    catch (err) { alert(err.response?.data?.error ?? "Lỗi tạo flashcard"); } finally { setGeneratingFlash(false); }
  };

  useEffect(() => { loadDoc(); }, [id]);
  useEffect(() => { if (location.state?.activeTab) setActiveTab(location.state.activeTab); }, [location.key]);
  useEffect(() => { if (activeTab === "Quizz")     loadQuizList(); },  [activeTab]);
  useEffect(() => { if (activeTab === "FlashCard") loadFlashList(); }, [activeTab]);
  useEffect(() => { if (activeTab !== "Quizz")     setSelectedQuiz(null); },  [activeTab]);
  useEffect(() => { if (activeTab !== "FlashCard") setSelectedFlash(null); }, [activeTab]);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Đang tải tài liệu...</p>
      </div>
    </div>
  );

  if (!doc) return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
      <p className="text-sm">Không tìm thấy tài liệu</p>
      <button onClick={() => navigate(-1)} className="text-sm text-orange-500 hover:underline">← Quay lại</button>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 flex items-center justify-between px-6 pt-5 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 shadow-sm transition-all active:scale-95"
        >
          <IconBack /> Trở về
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 bg-[#F26739] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm transition"
        >
          <IconEdit /> Chỉnh sửa
        </button>
      </div>

      <div className="px-6 pb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">{doc.title}</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm transition border-b-2 -mb-px ${activeTab === tab ? "border-[#F26739] text-[#F26739] font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Thông tin" && <TabThongTin doc={doc} id={id} setActiveTab={setActiveTab} />}

        {/* ── TAB CHAT ─────────────────────────────────────────── */}
        {activeTab === "Chat" && (
          <ChatAI documentId={id} />
        )}

        {activeTab === "Quizz" && (selectedQuiz ? (
          <QuizPageInline quiz={selectedQuiz} documentId={id} onBack={() => setSelectedQuiz(null)} />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F26739]"><IconQuiz /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Danh sách bài kiểm tra</p>
                  <p className="text-xs text-gray-400">{quizList.length > 0 ? `${quizList.length} bài kiểm tra` : "Chưa có bài kiểm tra nào"}</p>
                </div>
              </div>
              <button onClick={() => setShowQuizModal(true)} className="flex items-center gap-1.5 bg-[#F26739] hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
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
                <EmptyState icon={<IconQuiz />} message="Chưa có bài kiểm tra nào" sub='Nhấn "Tạo bằng AI" để tự động tạo' />
              ) : quizList.map((quiz, idx) => (
                <div key={quiz._id ?? idx} onClick={() => setSelectedQuiz(quiz)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F26739] shrink-0 text-xs font-bold">{idx + 1}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{quiz.title ?? `Bài kiểm tra ${idx + 1}`}</p>
                      <p className="text-xs text-gray-400">{quiz.questionCount ?? quiz.questions?.length ?? 0} câu hỏi{quiz.createdAt && ` · ${new Date(quiz.createdAt).toLocaleDateString("vi-VN")}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {quiz.status && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${quiz.status === "published" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {quiz.status === "published" ? "Đã xuất bản" : "Nháp"}
                      </span>
                    )}
                    <span className="text-gray-300 group-hover:text-orange-400 transition"><IconArrowRight /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {activeTab === "FlashCard" && (selectedFlash ? (
          <FlashcardPageInline flash={selectedFlash} onBack={() => setSelectedFlash(null)} />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500"><IconCards /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Danh sách bộ Flashcard</p>
                  <p className="text-xs text-gray-400">{flashList.length > 0 ? `${flashList.length} bộ thẻ` : "Chưa có bộ thẻ nào"}</p>
                </div>
              </div>
              <button onClick={() => setShowFlashModal(true)} className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
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
                <EmptyState icon={<IconCards />} message="Chưa có bộ thẻ nào" sub='Nhấn "Tạo bằng AI" để tự động tạo' />
              ) : flashList.map((flash, idx) => (
                <div key={flash._id ?? idx} onClick={() => setSelectedFlash(flash)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 shrink-0 text-xs font-bold">{idx + 1}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{flash.title ?? `Bộ thẻ ${idx + 1}`}</p>
                      <p className="text-xs text-gray-400">{Array.isArray(flash.cards) ? flash.cards.length : (flash.count ?? 0)} thẻ học{flash.createdAt && ` · ${new Date(flash.createdAt).toLocaleDateString("vi-VN")}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {flash.progress !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: `${flash.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{flash.progress}%</span>
                      </div>
                    )}
                    <span className="text-gray-300 group-hover:text-purple-400 transition"><IconArrowRight /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showEditModal && <EditDocumentModal doc={doc} onClose={() => setShowEditModal(false)} onSaved={() => { setLoading(true); loadDoc(); }} />}
      {showQuizModal && <ConfirmGenerateModal type="quiz" loading={generatingQuiz} onConfirm={handleGenerateQuiz} onCancel={() => !generatingQuiz && setShowQuizModal(false)} />}
      {showFlashModal && <ConfirmGenerateModal type="flash" loading={generatingFlash} onConfirm={handleGenerateFlash} onCancel={() => !generatingFlash && setShowFlashModal(false)} />}
    </div>
  );
}