import { Search } from "lucide-react";

export default function SearchBox({ value, onChange, placeholder = "Tìm kiếm..." }) {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-9 gap-2 shadow-sm">
      <Search size={12} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-xs w-32 text-gray-700"
      />
    </div>
  );
}