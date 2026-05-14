import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNums } from "./constants";

export default function PaginationBar({ page, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={14} />
      </button>
      {getPageNums(page, total).map((p, i) =>
        p === "..." ? (
          <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 text-xs rounded-lg border font-medium transition ${
              page === p
                ? "bg-[#F26739] text-white border-[#F26739] shadow-sm"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}