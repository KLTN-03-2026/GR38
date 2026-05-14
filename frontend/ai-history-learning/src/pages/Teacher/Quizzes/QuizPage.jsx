import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Library, FileText, PenLine } from "lucide-react";
import { quizService } from "../../../services/quizService";
import { GlobalStyles } from "./GlobalStyles";
import QuizView from "./QuizView";
import AddQuizModal from "./AddQuizModal";
import { getUserRole, normalizeQuiz, shuffle, shuffleOptions } from "./constants";
import QuizResultDetail from "./QuizResultDetail";
import AllTab from "./AllTab";
import ByDocumentTab from "./ByDocumentTab";
import ManualTab from "./ManualTab";

export default function QuizPage() {
  const navigate  = useNavigate();

  // ✅ FIX 1: useMemo để role không tạo giá trị mới mỗi render
  const isTeacher = useMemo(() => getUserRole() === "TEACHER", []);
  const canManage = useMemo(() => {
    const role = getUserRole();
    return role === "TEACHER" || role === "ADMIN";
  }, []);

  const [activeTab,     setActiveTab]     = useState("all");
  const [quizView,      setQuizView]      = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [addDocumentId, setAddDocumentId] = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);
  const [historyQuiz,   setHistoryQuiz]   = useState(null);

  const [allQuizzes,    setAllQuizzes]    = useState([]);
  const [allLoading,    setAllLoading]    = useState(false);
  const [manualQuizzes, setManualQuizzes] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);

  const fetchAllQuizzes = useCallback(async () => {
    setAllLoading(true);
    try {
      const res  = isTeacher
        ? await quizService.getTeacherQuizzes()
        : await quizService.getAllQuizzesAdmin();
      const raw  = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? []);
      setAllQuizzes(list.map(normalizeQuiz));
    } catch (err) {
      console.error(err);
    } finally {
      setAllLoading(false);
    }
  }, [isTeacher]);

  const fetchManualQuizzes = useCallback(async () => {
    setManualLoading(true);
    try {
      const res  = isTeacher
        ? await quizService.getTeacherQuizzes()
        : await quizService.getAllQuizzesAdmin();
      const raw  = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.quizzes ?? []);
      setManualQuizzes(list.filter((q) => !q.documentId).map(normalizeQuiz));
    } catch (err) {
      console.error(err);
    } finally {
      setManualLoading(false);
    }
  }, [isTeacher]);

  // ✅ FIX 2: dependency rỗng, chỉ fetch 1 lần khi mount
  useEffect(() => {
    fetchAllQuizzes();
    fetchManualQuizzes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartQuiz = async (quiz) => {
    try {
      const id = quiz._id ?? quiz.id;
      if (!id) { alert("Không tìm thấy ID quiz!"); return; }
      if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        const normalized = quiz.questions.map((q) => ({
          _id:         q._id ?? q.id,
          question:    q.question ?? q.q,
          options:     Array.isArray(q.options) ? q.options : [q.optionA, q.optionB, q.optionC, q.optionD],
          answer:      q.correctAnswerIndex ?? (typeof q.correctAnswer === "number" ? q.correctAnswer : q.options?.indexOf(q.correctAnswer)) ?? q.answer ?? 0,
          explanation: q.explanation ?? q.explain ?? "",
        }));
        setQuizView({ quiz, questions: shuffle(normalized).map(shuffleOptions) });
        return;
      }
      const res    = await quizService.getQuizForPlay(id);
      const detail = res.data?.data ?? res.data ?? res;
      const rawQs  = detail.questions ?? [];
      if (!rawQs.length) { alert("Quiz này chưa có câu hỏi!"); return; }
      setQuizView({
        quiz,
        questions: shuffle(rawQs.map((q) => ({
          _id:      q._id ?? q.id,
          question: q.question ?? q.q,
          options:  q.options,
          answer:   q.correctAnswerIndex ?? q.answer ?? null,
        }))).map(shuffleOptions),
      });
    } catch (err) {
      console.error(err);
      alert("Không tải được câu hỏi. Vui lòng thử lại.");
    }
  };

  const handleFinish = (result) => {
    setQuizView(null);
    navigate(isTeacher ? "/teacher/quiz-result" : "/admin/quiz-result", { state: result });
  };

  const handleSaveQuiz = () => {
    setShowAddModal(false);
    setEditTarget(null);
    fetchAllQuizzes();
    fetchManualQuizzes();
  };

  const handleDeleteFromAll = (id) => {
    setAllQuizzes((p)    => p.filter((q) => (q.id ?? q._id) !== id));
    setManualQuizzes((p) => p.filter((q) => (q.id ?? q._id) !== id));
  };

  const openAddModal = (id) => {
    setAddDocumentId(id ?? null);
    setShowAddModal(true);
  };

  const TABS = [
    { key: "all",      icon: <Library size={14} />,  label: "Tất cả",       badge: allQuizzes.length || null },
    { key: "document", icon: <FileText size={14} />, label: "Theo tài liệu"                                  },
    { key: "manual",   icon: <PenLine size={14} />,  label: "Thủ công",     badge: manualQuizzes.length || null },
  ];

  const commonProps = {
    isTeacher:      canManage,
    onStartQuiz:    handleStartQuiz,
    onHistory:      setHistoryQuiz,
    onOpenEditModal: setEditTarget,
  };

  // ── Quiz đang chơi ──
  if (quizView) return (
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
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Hệ thống trắc nghiệm</h1>
          {isTeacher && (
            <button
              onClick={() => openAddModal(null)}
              className="h-10 px-5 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition"
              style={{ background: "#F26739" }}
            >
              <PenLine size={14} /> Tạo Quiz thủ công
            </button>
          )}
        </div>

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TABS.map(({ key, icon, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
                activeTab === key
                  ? "bg-[#F26739] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {icon}{label}
              {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? "bg-white/30 text-white" : "bg-orange-100 text-orange-600"
                }`}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "all" && (
          <AllTab {...commonProps} allQuizzes={allQuizzes} loading={allLoading} onDeleteQuiz={handleDeleteFromAll} />
        )}
        {activeTab === "document" && (
          <ByDocumentTab {...commonProps} onOpenAddModal={openAddModal} />
        )}
        {activeTab === "manual" && (
          <ManualTab
            {...commonProps}
            onOpenAddModal={openAddModal}
            quizzes={manualQuizzes}
            loading={manualLoading}
            onDeleteQuiz={(id) => setManualQuizzes((p) => p.filter((q) => (q.id ?? q._id) !== id))}
          />
        )}

        {/* ── Modals ── */}
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
        {historyQuiz && (
          <QuizResultDetail
            quiz={historyQuiz}
            onClose={() => setHistoryQuiz(null)}
            onStartQuiz={handleStartQuiz}
          />
        )}
      </div>
    </>
  );
}