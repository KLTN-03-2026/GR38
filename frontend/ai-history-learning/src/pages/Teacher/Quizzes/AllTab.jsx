import { useState } from "react";
import { quizService } from "../../../services/quizService";
import { QuizSkeleton, ConfirmDeleteModal } from "./QuizComponents";
import QuizGrid from "./QuizGrid";
import SearchBox from "./SearchBox";

export default function AllTab({ isTeacher, onStartQuiz, onHistory, onOpenEditModal, allQuizzes, loading, onDeleteQuiz }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [search,       setSearch]       = useState("");

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await quizService.delete(deleteTarget.id ?? deleteTarget._id);
      onDeleteQuiz(deleteTarget.id ?? deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      alert("Xoá quiz thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = allQuizzes.filter((q) =>
    (q.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <p className="text-sm font-bold text-gray-800">Tất cả Quiz</p>
          <p className="text-xs text-gray-400">{allQuizzes.length} quiz</p>
        </div>
        {allQuizzes.length > 0 && (
          <SearchBox value={search} onChange={setSearch} placeholder="Tìm quiz..." />
        )}
      </div>

      {loading ? (
        <QuizSkeleton />
      ) : (
        <QuizGrid
          quizzes={filtered}
          isTeacher={isTeacher}
          onStart={onStartQuiz}
          onEdit={onOpenEditModal}
          onDelete={(q) => setDeleteTarget(q)}
          onHistory={onHistory}
          emptyMsg="Chưa có quiz nào"
        />
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