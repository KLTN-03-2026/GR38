import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { quizService } from "@/services/quizService";

// ==========================================
// useQuizResult - Custom Hook
// Chứa toàn bộ state + logic fetch cho QuizResultDetail
// ==========================================
export default function useQuizResult() {
  const { resultId } = useParams();

  const [loading,             setLoading]             = useState(true);
  const [attemptsList,        setAttemptsList]        = useState([]);   // Tất cả lần làm của quiz đó
  const [activeAttemptId,     setActiveAttemptId]     = useState(null); // Lần đang xem chi tiết
  const [apiDetail,           setApiDetail]           = useState(null); // Dữ liệu chi tiết 1 bài
  const [showDetailQuestions, setShowDetailQuestions] = useState(false);
  const [mounted,             setMounted]             = useState(false);

  // ----------------------------------------
  // Logic 1: Lấy danh sách lịch sử khi mount
  // ----------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);

    quizService.getMyHistory()
      .then(res => {
        const allHistory = res.data?.data || res.data || [];

        // Xác định resultId là ID của 1 lần làm cụ thể hay ID của quiz
        const isResultId = allHistory.find(h => h._id === resultId);

        let filteredAttempts = [];
        if (isResultId) {
          // Lọc tất cả lần thi của cùng quiz đó
          filteredAttempts = allHistory.filter(h => h.quizId?._id === isResultId.quizId?._id);
        } else {
          filteredAttempts = allHistory.filter(h => h.quizId?._id === resultId || h.quizId === resultId);
        }

        // Mới nhất lên đầu
        filteredAttempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setAttemptsList(filteredAttempts);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    return () => clearTimeout(t);
  }, [resultId]);

  // ----------------------------------------
  // Logic 2: Fetch chi tiết khi user chọn 1 lần
  // ----------------------------------------
  useEffect(() => {
    if (!activeAttemptId) return;
    setLoading(true);

    quizService.getResultDetail(activeAttemptId)
      .then(res => {
        const raw           = res.data?.data ?? res.data;
        const fullQuestions = raw?.quizId?.questions || [];

        // Ánh xạ đáp án đúng và đáp án user chọn
        const qs = fullQuestions.map(q => {
          let correctIdx = q.options.findIndex(opt => opt === q.correctAnswer);
          if (correctIdx === -1) correctIdx = Number(q.correctAnswer || q.answer);

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

        setApiDetail({
          quizTitle: raw?.quizId?.title || "Bài Kiểm Tra",
          score:     raw?.correctAnswersCount ?? raw?.score ?? 0,
          total:     raw?.totalQuestions ?? 10,
          answered:  raw?.answers?.length ?? 0,
          questions: qs.length > 0 ? qs : null,
        });
      })
      .finally(() => setLoading(false));
  }, [activeAttemptId]);

  // ----------------------------------------
  // Handler: quay lại danh sách
  // ----------------------------------------
  const handleBack = () => {
    setActiveAttemptId(null);
    setApiDetail(null);
    setShowDetailQuestions(false);
  };

  return {
    // States
    loading,
    attemptsList,
    activeAttemptId,
    apiDetail,
    showDetailQuestions,
    mounted,
    // Setters / Handlers
    setActiveAttemptId,
    setShowDetailQuestions,
    handleBack,
  };
}