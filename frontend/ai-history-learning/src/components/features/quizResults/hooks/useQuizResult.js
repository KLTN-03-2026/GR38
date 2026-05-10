import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { quizService } from "@/services/quizService";

export default function useQuizResult() {
  const { resultId } = useParams();

  const [loading,             setLoading]             = useState(true);
  const [attemptsList,        setAttemptsList]        = useState([]);
  const [activeAttemptId,     setActiveAttemptId]     = useState(null);
  const [apiDetail,           setApiDetail]           = useState(null);
  const [showDetailQuestions, setShowDetailQuestions] = useState(false);
  const [mounted,             setMounted]             = useState(false);

  // Helper: lấy _id từ quizId dù là string hay object
  const getQuizId = (h) => {
    if (!h.quizId) return null;
    if (typeof h.quizId === "string") return h.quizId;
    return h.quizId._id ?? null;
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);

    quizService.getMyHistory()
      .then(res => {
        const allHistory = res.data?.data || res.data || [];

        // Case A: resultId trùng với _id của 1 lần làm → lấy quizId từ đó
        const matchedAttempt = allHistory.find(h => h._id === resultId);

        let targetQuizId;
        if (matchedAttempt) {
          targetQuizId = getQuizId(matchedAttempt);
        } else {
          // Case B: resultId là quiz._id trực tiếp
          targetQuizId = resultId;
        }

        const filtered = allHistory
          .filter(h => getQuizId(h) === targetQuizId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(h => ({
            _id:            h._id,
            createdAt:      h.createdAt,
            score:          h.correctAnswersCount ?? h.score ?? 0,
            totalQuestions: h.totalQuestions
              ?? (typeof h.quizId === "object" ? h.quizId?.questionCount : null)
              ?? 0,
          }));

        setAttemptsList(filtered);
      })
      .catch(err => console.error("[useQuizResult]", err))
      .finally(() => setLoading(false));

    return () => clearTimeout(t);
  }, [resultId]);

  useEffect(() => {
    if (!activeAttemptId) return;
    setLoading(true);
    setShowDetailQuestions(false);

    quizService.getResultDetail(activeAttemptId)
      .then(res => {
        const raw           = res.data?.data ?? res.data;
        const fullQuestions = raw?.quizId?.questions || [];

        const qs = fullQuestions.map(q => {
          let correctIdx = q.options.findIndex(opt => opt === q.correctAnswer);
          if (correctIdx === -1) correctIdx = Number(q.correctAnswer ?? q.answer ?? 0);

          let userIdx = null;
          if (raw?.answers) {
            const ans = raw.answers.find(a => String(a.questionId) === String(q._id));
            if (ans?.selectedAnswer != null) {
              userIdx = q.options.findIndex(opt => opt === ans.selectedAnswer);
              if (userIdx === -1) userIdx = Number(ans.selectedAnswer);
            }
          }
          return { ...q, answer: correctIdx, userAnswer: userIdx };
        });

        const score    = raw?.correctAnswersCount ?? raw?.score ?? 0;
        const total    = raw?.totalQuestions ?? fullQuestions.length ?? 0;
        const answered = raw?.answers?.filter(a => a.selectedAnswer != null).length ?? score;

        setApiDetail({
          quizTitle: raw?.quizId?.title ?? "Bài Kiểm Tra",
          score, total, answered,
          questions: qs.length > 0 ? qs : null,
        });
      })
      .catch(err => console.error("[useQuizResult] detail error:", err))
      .finally(() => setLoading(false));
  }, [activeAttemptId]);

  const handleBack = () => {
    setActiveAttemptId(null);
    setApiDetail(null);
    setShowDetailQuestions(false);
  };

  return {
    loading, attemptsList, activeAttemptId, apiDetail,
    showDetailQuestions, mounted,
    setActiveAttemptId, setShowDetailQuestions, handleBack,
  };
}