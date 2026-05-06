import { Plus, Trash2 } from "lucide-react";

export default function CardTable({ cards, errors, updateCard, removeCard, addCard }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">
      <div className="grid grid-cols-2 gap-4 px-6 py-3 border-b border-gray-100">
        <span className="text-[11px] font-bold text-[#1473E6] uppercase tracking-wider">Câu hỏi (mặt trước)</span>
        <span className="text-[11px] font-bold text-[#36BA58] uppercase tracking-wider">Đáp án (mặt sau)</span>
      </div>

      <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
        {cards.map((card, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 px-6 py-4 items-start hover:bg-[#FAFAFA] transition-colors group">
            <div className="col-span-2 flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Thẻ {index + 1}</span>
              <button
                onClick={() => removeCard(index)}
                disabled={cards.length === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-20 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div>
              <textarea
                rows={2}
                value={card.front}
                onChange={(e) => updateCard(index, "front", e.target.value)}
                placeholder="Nhập câu hỏi..."
                className={`w-full px-3 py-2.5 rounded-xl border text-[14px] text-[#18181B] outline-none resize-none transition-colors ${
                  errors[`card_${index}_front`] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-[#1473E6]"
                }`}
              />
              {errors[`card_${index}_front`] && <p className="text-red-500 text-[11px] mt-1">{errors[`card_${index}_front`]}</p>}
            </div>
            <div>
              <textarea
                rows={2}
                value={card.back}
                onChange={(e) => updateCard(index, "back", e.target.value)}
                placeholder="Nhập đáp án..."
                className={`w-full px-3 py-2.5 rounded-xl border text-[14px] text-[#18181B] outline-none resize-none transition-colors ${
                  errors[`card_${index}_back`] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-[#36BA58]"
                }`}
              />
              {errors[`card_${index}_back`] && <p className="text-red-500 text-[11px] mt-1">{errors[`card_${index}_back`]}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-gray-100">
        <button
          onClick={addCard}
          className="w-full h-[44px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-400 hover:border-[#F26739] hover:text-[#F26739] hover:bg-[#FFF4EF] transition-all"
        >
          <Plus size={16} /> Thêm thẻ mới
        </button>
      </div>
    </div>
  );
}