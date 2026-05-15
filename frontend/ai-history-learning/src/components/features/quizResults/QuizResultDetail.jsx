import useQuizResult  from "./hooks/useQuizResult";
import LoadingScreen  from "./views/LoadingScreen";
import AttemptsList   from "./views/AttemptsList";
import ResultDetail   from "./views/ResultDetail";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";

export default function QuizResultDetail() {
  const navigate = useNavigate();
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
  if (!activeAttemptId) {
    // Có lịch sử → hiển thị danh sách
    if (attemptsList.length > 0) {
      return (
        <AttemptsList
          attemptsList={attemptsList}
          onSelectAttempt={setActiveAttemptId}
        />
      );
    }

    // Không có lịch sử (filter = 0) → empty state, KHÔNG trắng
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg,#F4F6FB 0%,#EEF2FF 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
      }}>
        <div style={{ textAlign: "center", padding: "0 20px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#FFF3EE", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Clock size={32} style={{ color: "#F26739" }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#1F2937", marginBottom: 8 }}>
            Chưa có lịch sử làm bài
          </p>
          <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>
            Hãy làm bài thi trước để xem lịch sử tại đây
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 12,
              background: "#F26739", color: "#fff",
              border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  // VIEW 2: Chi tiết kết quả
  if (loading && !apiDetail) return <LoadingScreen />;
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