// ─── Constants & Helpers ──────────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 8;

export const DIFF = {
  EASY:   { label: "Dễ",         cls: "bg-green-500"  },
  MEDIUM: { label: "Trung bình", cls: "bg-yellow-500" },
  HARD:   { label: "Khó",        cls: "bg-red-500"    },
};

export const DIFF_LABEL = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const shuffleOptions = (q) => {
  const indexed = q.options.map((opt, i) => ({ text: opt, isAnswer: i === q.answer }));
  const s = shuffle(indexed);
  return { ...q, options: s.map(o => o.text), answer: s.findIndex(o => o.isAnswer) };
};

export const getUserRole = () => {
  try { return (JSON.parse(localStorage.getItem("user") || "{}").role || "").toUpperCase(); }
  catch { return ""; }
};

export const getPageNums = (cur, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (cur >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", cur - 1, cur, cur + 1, "...", total];
};

export const normalizeQuiz = (q) => ({
  id: q._id ?? q.id,
  _id: q._id ?? q.id,
  title: q.title,
  description: q.description,
  difficulty: q.difficulty,
  timeLimit: q.timeLimit ?? q.time_limit,
  questionCount: q.questionCount ?? (Array.isArray(q.questions) ? q.questions.length : 0),
  questions: q.questions ?? [],
  coverImage: q.thumbnail ?? q.coverImage ?? null,
  documentId: q.documentId?._id ?? q.documentId?.id ?? q.documentId ?? null,
});

export const scoreColor = (pct) =>
  pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";