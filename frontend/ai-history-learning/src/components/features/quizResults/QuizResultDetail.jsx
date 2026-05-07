import useQuizResult  from "./hooks/useQuizResult";
import LoadingScreen  from "./views/LoadingScreen";
import AttemptsList   from "./views/AttemptsList";
import ResultDetail   from "./views/ResultDetail";

// ==========================================
// QUIZ RESULT DETAIL - Main Component
// Chỉ điều phối 3 view, toàn bộ logic nằm trong useQuizResult
// ==========================================
export default function QuizResultDetail() {
  const {
    loading,
    attemptsList,
    activeAttemptId,
    apiDetail,
    showDetailQuestions,
    mounted,
    setActiveAttemptId,
    setShowDetailQuestions,
    handleBack,
  } = useQuizResult();

  // VIEW 0: Loading ban đầu
  if (loading && !attemptsList.length && !apiDetail) {
    return <LoadingScreen />;
  }

  // VIEW 1: Danh sách các lần làm bài
  if (!activeAttemptId && attemptsList.length > 0) {
    return (
      <AttemptsList
        attemptsList={attemptsList}
        onSelectAttempt={setActiveAttemptId}
      />
    );
  }

  // VIEW 2: Chi tiết kết quả đúng / sai
  if (!apiDetail) return null;

  return (
    <ResultDetail
      apiDetail={apiDetail}
      loading={loading}
      mounted={mounted}
      showDetailQuestions={showDetailQuestions}
      setShowDetailQuestions={setShowDetailQuestions}
      onBack={handleBack}
    />
  );
}