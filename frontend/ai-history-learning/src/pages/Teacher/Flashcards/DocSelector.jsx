import React from "react";
import Select from "react-select";
import { FileText } from "lucide-react";

const DocSelector = ({ documents, selectedDocId, setSelectedDocId, loading }) => {
  const options = [
    { value: "", label: "-- Không gắn tài liệu --" },
    ...documents.map((doc) => ({
      value: doc._id ?? doc.id ?? "",
      label: doc.title ?? doc.name ?? "Không có tiêu đề",
    })),
  ];

  const selectedOption =
    options.find((opt) => opt.value === selectedDocId) ?? options[0];

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "46px",
      borderRadius: "12px",
      borderColor: state.isFocused ? "#F26739" : "#E5E7EB",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(242,103,57,0.15)" : "none",
      backgroundColor: "#FAFAFA",
      fontSize: "15px",
      color: "#18181B",
      cursor: "pointer",
      transition: "border-color 0.15s",
      "&:hover": { borderColor: "#F26739" },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      overflow: "hidden",
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
      maxHeight: "260px",
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: state.data.value === "" ? 600 : 400,
      color: state.data.value === "" ? "#9CA3AF" : "#18181B",
      backgroundColor: state.isSelected
        ? "#FFF4EF"
        : state.isFocused
        ? "#F9FAFB"
        : "transparent",
      cursor: "pointer",
      padding: "10px 12px",
      "&:active": { backgroundColor: "#FFF4EF" },
    }),
    singleValue: (base, state) => ({
      ...base,
      color: state.data.value === "" ? "#9CA3AF" : "#18181B",
      fontWeight: state.data.value === "" ? 500 : 400,
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
      fontSize: "15px",
    }),
    input: (base) => ({
      ...base,
      color: "#18181B",
      fontSize: "15px",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? "#F26739" : "#9CA3AF",
      transition: "color 0.15s, transform 0.2s",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
      "&:hover": { color: "#F26739" },
    }),
    loadingMessage: (base) => ({
      ...base,
      fontSize: "14px",
      color: "#9CA3AF",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: "14px",
      color: "#9CA3AF",
    }),
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
      <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        <span className="flex items-center gap-1.5">
          <FileText size={13} className="text-gray-400" />
          Gắn với tài liệu
        </span>
      </label>

      <Select
        options={options}
        value={selectedOption}
        onChange={(opt) => setSelectedDocId(opt?.value ?? "")}
        isLoading={loading}
        isSearchable
        placeholder="-- Không gắn tài liệu --"
        loadingMessage={() => "Đang tải tài liệu..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `Không tìm thấy "${inputValue}"` : "Không có tài liệu"
        }
        styles={customStyles}
        classNamePrefix="doc-select"
      />

      {selectedDocId && (
        <p className="text-[11px] text-[#F26739] mt-1.5 font-medium">
          ✓ Đã chọn tài liệu
        </p>
      )}
    </div>
  );
};

export default DocSelector;