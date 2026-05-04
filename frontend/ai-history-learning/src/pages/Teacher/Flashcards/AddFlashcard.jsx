import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, BookOpen, Loader2 } from "lucide-react";
import api from "../../../lib/api";
import { documentService } from "../../../services/documentService";
import CardTable from "./CardTable";
import DocSelector from "./DocSelector";
import ThumbnailUpload from "./ThumbnailUpload";

const MIN_CARDS = 5;

const AddFlashcard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedDocId, setSelectedDocId] = useState(
    location.state?.documentId ?? "",
  );
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [cards, setCards] = useState([{ front: "", back: "" }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    (async () => {
      setDocsLoading(true);
      try {
        const res = await documentService.getAll();
        const list = res?.data ?? res ?? [];
        setDocuments(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
      } finally {
        setDocsLoading(false);
      }
    })();
  }, []);

  const addCard = () => setCards((p) => [...p, { front: "", back: "" }]);
  const removeCard = (i) => {
    if (cards.length > 1) setCards((p) => p.filter((_, idx) => idx !== i));
  };
  const updateCard = (i, field, value) => {
    setCards((p) =>
      p.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    );
    setErrors((p) => {
      const n = { ...p };
      delete n[`card_${i}_${field}`];
      return n;
    });
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Vui lòng nhập tên bộ thẻ";
    if (cards.length < MIN_CARDS)
      errs.minCards = `Cần ít nhất ${MIN_CARDS} thẻ (hiện có ${cards.length})`;
    cards.forEach((c, i) => {
      if (!c.front.trim()) errs[`card_${i}_front`] = "Chưa nhập câu hỏi";
      if (!c.back.trim()) errs[`card_${i}_back`] = "Chưa nhập đáp án";
    });
    return errs;
  };

  const handleSave = async () => {
  const errs = validate();
  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }
  try {
    setSaving(true);
    setSaveErr("");
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append(
      "cards",
      JSON.stringify(
        cards.map((c) => ({ front: c.front.trim(), back: c.back.trim() })),
      ),
    );
    if (imagePreview) {
      const fetchRes = await fetch(imagePreview); // ← đổi tên từ res → fetchRes
      const blob = await fetchRes.blob();
      formData.append("thumbnail", blob, "thumbnail.jpg");
    }

    const res = await api.post("/flashcards", formData);
    console.log("full response:", JSON.stringify(res.data));

    const saved = res.data?.data ?? res.data;
    const newId = saved?._id;

    if (newId) {
      const existing = JSON.parse(localStorage.getItem("flashcards") || "[]");
      existing.push({
        id: newId,
        title: title.trim(),
        cards: cards.map((c) => ({ front: c.front.trim(), back: c.back.trim() })),
        thumbnail: saved?.thumbnail ?? null,
      });
      localStorage.setItem("flashcards", JSON.stringify(existing));
    }

    navigate("/teacher/flashcards");
  } catch (err) {
    setSaveErr(
      err?.response?.data?.message ||
        "Tạo bộ thẻ thất bại, vui lòng thử lại.",
    );
  } finally {
    setSaving(false);
  }
};
  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen flex flex-col items-center p-8 font-['Inter']">
      <div className="w-full max-w-[860px]">
        {/* Thanh trên */}
        <div className="w-full h-[53px] bg-white border border-gray-200 rounded-[10px] mb-8 flex items-center px-5 shadow-sm">
          <button
            onClick={() => navigate("/teacher/flashcards")}
            className="flex items-center gap-2 text-[14px] font-semibold text-gray-600 hover:text-[#F26739] transition-colors"
          >
            <ChevronLeft size={18} /> Quay lại danh sách
          </button>
        </div>

        {/* Tiêu đề */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FFF4EF] flex items-center justify-center">
            <BookOpen size={20} className="text-[#F26739]" />
          </div>
          <h1 className="text-[24px] font-black text-[#18181B] uppercase tracking-tight">
            Tạo bộ Flashcard mới
          </h1>
        </div>     
        {/* Tên bộ thẻ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Tên bộ thẻ <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((p) => {
                const n = { ...p };
                delete n.title;
                return n;
              });
            }}
            placeholder="VD: Kháng chiến chống Mỹ..."
            className={`w-full h-[46px] px-4 rounded-xl border text-[15px] text-[#18181B] outline-none transition-colors ${
              errors.title
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-[#FAFAFA] focus:border-[#F26739]"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-[12px] mt-1.5">{errors.title}</p>
          )}
        </div>

        <ThumbnailUpload
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          errors={errors}
          setErrors={setErrors}
        />

        <CardTable
          cards={cards}
          errors={errors}
          updateCard={updateCard}
          removeCard={removeCard}
          addCard={addCard}
        />

        {/* Counter */}
        <div
          className={`flex items-center justify-between mb-5 px-1 ${errors.minCards ? "text-red-500" : "text-gray-400"}`}
        >
          <span className="text-[12px] font-semibold">
            {cards.length < MIN_CARDS
              ? `⚠️ ${errors.minCards || `Cần ít nhất ${MIN_CARDS} thẻ`}`
              : `✅ ${cards.length} thẻ — đủ điều kiện tạo bộ`}
          </span>
          <span
            className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${cards.length >= MIN_CARDS ? "bg-green-50 text-green-500" : "bg-red-50 text-red-400"}`}
          >
            {cards.length} / {MIN_CARDS} thẻ tối thiểu
          </span>
        </div>

        {/* Lỗi API */}
        {saveErr && (
          <div className="mb-6 flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="#ef4444"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-600">{saveErr}</p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate("/teacher/flashcards")}
            disabled={saving}
            className="h-[46px] px-8 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-[46px] px-10 bg-[#F26739] text-white rounded-xl text-[14px] font-bold hover:bg-[#d9562d] transition-colors shadow-lg active:scale-[0.97] disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang lưu...
              </>
            ) : (
              "Lưu bộ thẻ"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFlashcard;
