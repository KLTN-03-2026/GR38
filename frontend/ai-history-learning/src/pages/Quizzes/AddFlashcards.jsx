import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ChevronLeft, BookOpen, ImageIcon, X } from "lucide-react";

const AddFlashcard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [imagePreview, setImagePreview] = useState(""); // base64
  const [cards, setCards] = useState([{ front: "", back: "" }]);
  const [errors, setErrors] = useState({});

  /* ── Xử lý chọn file ảnh ── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra đúng định dạng ảnh
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "Vui lòng chọn file ảnh (jpg, png, webp...)" }));
      return;
    }

    // Kiểm tra dung lượng < 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB" }));
      return;
    }

    setErrors((p) => { const n = { ...p }; delete n.image; return n; });

    // Đọc file thành base64 để lưu & preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Thêm thẻ mới ── */
  const addCard = () => {
    setCards((prev) => [...prev, { front: "", back: "" }]);
  };

  /* ── Xoá thẻ ── */
  const removeCard = (index) => {
    if (cards.length === 1) return;
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Cập nhật nội dung thẻ ── */
  const updateCard = (index, field, value) => {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`card_${index}_${field}`];
      return next;
    });
  };

  /* ── Validate ── */
  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Vui lòng nhập tên bộ thẻ";
    cards.forEach((card, i) => {
      if (!card.front.trim()) errs[`card_${i}_front`] = "Chưa nhập câu hỏi";
      if (!card.back.trim())  errs[`card_${i}_back`]  = "Chưa nhập đáp án";
    });
    return errs;
  };

  /* ── Lưu vào localStorage ── */
  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const existing = JSON.parse(localStorage.getItem("flashcards") || "[]");

    const newSet = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      cards: cards.map((c) => ({ front: c.front.trim(), back: c.back.trim() })),
      total: cards.length,
      progress: 0,
      image: imagePreview || null, // base64 hoặc null
    };

    localStorage.setItem("flashcards", JSON.stringify([newSet, ...existing]));
    navigate("/teacher/flashcards");
  };

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen flex flex-col items-center p-8 font-['Inter']">
      <div className="w-full max-w-[860px]">

        {/* ── Thanh trên ── */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-8 flex items-center px-5 shadow-sm">
          <button
            onClick={() => navigate("/teacher/flashcards")}
            className="flex items-center gap-2 text-[14px] font-semibold text-gray-600 hover:text-[#F26739] transition-colors"
          >
            <ChevronLeft size={18} />
            Quay lại danh sách
          </button>
        </div>

        {/* ── Tiêu đề trang ── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FFF4EF] flex items-center justify-center">
            <BookOpen size={20} className="text-[#F26739]" />
          </div>
          <h1 className="text-[24px] font-black text-[#18181B] uppercase tracking-tight">
            Tạo bộ Flashcard mới
          </h1>
        </div>

        {/* ── Card: Tên bộ thẻ ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Tên bộ thẻ *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((p) => { const n = { ...p }; delete n.title; return n; });
            }}
            placeholder="VD: Kháng chiến chống Mỹ..."
            className={`w-full h-[46px] px-4 rounded-xl border text-[15px] text-[#18181B] outline-none transition-colors ${
              errors.title
                ? "border-red-400 bg-red-50 focus:border-red-400"
                : "border-gray-200 bg-[#FAFAFA] focus:border-[#F26739]"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-[12px] mt-1.5">{errors.title}</p>
          )}
        </div>

        {/* ── Card: Upload ảnh thumbnail ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Ảnh thumbnail (tuỳ chọn)
          </label>

          <div className="flex gap-5 items-start">

            {/* Vùng upload */}
            <div className="flex-1">
              {/* Input file ẩn */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Nút chọn ảnh */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-[90px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                  errors.image
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-[#FAFAFA] hover:border-[#F26739] hover:bg-[#FFF4EF]"
                }`}
              >
                <ImageIcon size={22} className={errors.image ? "text-red-400" : "text-gray-300"} />
                <span className={`text-[13px] font-semibold ${errors.image ? "text-red-400" : "text-gray-400"}`}>
                  Nhấn để chọn ảnh từ máy tính
                </span>
                <span className="text-[11px] text-gray-300">JPG, PNG, WEBP — tối đa 5MB</span>
              </button>

              {errors.image && (
                <p className="text-red-500 text-[12px] mt-1.5">{errors.image}</p>
              )}

              {!imagePreview && (
                <p className="text-[11px] text-gray-400 mt-2">
                  Nếu để trống sẽ hiển thị chữ cái đầu của tên bộ thẻ.
                </p>
              )}
            </div>

            {/* Preview ảnh */}
            <div className="relative w-[140px] h-[90px] rounded-xl overflow-hidden border border-gray-200 bg-[#FAFAFA] shrink-0 flex items-center justify-center">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Nút xóa ảnh */}
                  <button
                    onClick={handleClearImage}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-300">
                  <ImageIcon size={22} />
                  <span className="text-[10px]">Xem trước</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Danh sách thẻ ── */}
        <div className="flex flex-col gap-4 mb-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
            >
              {/* Header thẻ */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                  Thẻ {index + 1}
                </span>
                <button
                  onClick={() => removeCard(index)}
                  disabled={cards.length === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-20 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Mặt trước / sau */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Câu hỏi */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1473E6] uppercase tracking-wider mb-1.5">
                    Câu hỏi (mặt trước)
                  </label>
                  <textarea
                    rows={3}
                    value={card.front}
                    onChange={(e) => updateCard(index, "front", e.target.value)}
                    placeholder="Nhập câu hỏi..."
                    className={`w-full px-4 py-3 rounded-xl border text-[14px] text-[#18181B] outline-none resize-none transition-colors ${
                      errors[`card_${index}_front`]
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-[#FAFAFA] focus:border-[#1473E6]"
                    }`}
                  />
                  {errors[`card_${index}_front`] && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors[`card_${index}_front`]}
                    </p>
                  )}
                </div>

                {/* Đáp án */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#36BA58] uppercase tracking-wider mb-1.5">
                    Đáp án (mặt sau)
                  </label>
                  <textarea
                    rows={3}
                    value={card.back}
                    onChange={(e) => updateCard(index, "back", e.target.value)}
                    placeholder="Nhập đáp án..."
                    className={`w-full px-4 py-3 rounded-xl border text-[14px] text-[#18181B] outline-none resize-none transition-colors ${
                      errors[`card_${index}_back`]
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-[#FAFAFA] focus:border-[#36BA58]"
                    }`}
                  />
                  {errors[`card_${index}_back`] && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors[`card_${index}_back`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Nút thêm thẻ ── */}
        <button
          onClick={addCard}
          className="w-full h-[52px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-[14px] font-semibold text-gray-400 hover:border-[#F26739] hover:text-[#F26739] hover:bg-[#FFF4EF] transition-all mb-8"
        >
          <Plus size={18} />
          Thêm thẻ mới
        </button>

        {/* ── Nút hành động ── */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate("/teacher/flashcards")}
            className="h-[46px] px-8 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="h-[46px] px-10 bg-[#F26739] text-white rounded-xl text-[14px] font-bold hover:bg-[#d9562d] transition-colors shadow-lg active:scale-[0.97]"
          >
            Lưu bộ thẻ
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddFlashcard;