import { useState, useEffect } from "react";
import { ITEMS_PER_PAGE } from "./constants";
import QuizCard from "./QuizCard";
import PaginationBar from "./PaginationBar";

export default function QuizGrid({
  quizzes, isTeacher, onStart, onEdit, onDelete, onHistory,
  docThumbnail, emptyMsg, emptyAction,
}) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [quizzes.length]);

  if (!quizzes.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
      <p className="text-sm font-medium text-gray-500">{emptyMsg}</p>
      {emptyAction}
    </div>
  );

  const total = Math.max(1, Math.ceil(quizzes.length / ITEMS_PER_PAGE));
  const safe  = Math.min(page, total);
  const paged = quizzes.slice((safe - 1) * ITEMS_PER_PAGE, safe * ITEMS_PER_PAGE);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
        {paged.map((quiz) => (
          <QuizCard
            key={quiz._id ?? quiz.id}
            quiz={quiz}
            isTeacher={isTeacher}
            onStart={onStart}
            onEdit={onEdit}
            onDelete={onDelete}
            onHistory={onHistory}
            docThumbnail={docThumbnail}
          />
        ))}
      </div>
      <PaginationBar
        page={safe}
        total={total}
        onChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
      />
    </>
  );
}