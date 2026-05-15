import { useState } from "react";
import { quizService } from "../../../services/quizService";
import { QuizSkeleton, ConfirmDeleteModal } from "./QuizComponents";
import QuizGrid from "./QuizGrid";
import SearchBox from "./SearchBox";

export default function ManualTab({
  isTeacher, onStartQuiz, onHistory, onOpenAddModal, onOpenEditModal,
  quizzes, loading, onDeleteQuiz,
}) {
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

  const filtered = quizzes.filter((q) =>
    (q.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <p className="text-sm font-bold text-gray-800">Quiz thủ công</p>
          <p className="text-xs text-gray-400">Không gắn với tài liệu · {quizzes.length} quiz</p>
        </div>
        <div className="flex items-center gap-2">
          {quizzes.length > 0 && (
            <SearchBox value={search} onChange={setSearch} placeholder="Tìm quiz..." />
          )}
        </div>
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
          emptyMsg="Chưa có quiz thủ công nào"
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