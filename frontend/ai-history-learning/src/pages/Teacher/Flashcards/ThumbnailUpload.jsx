import { useRef } from "react";
import { ImageIcon, X } from "lucide-react";

export default function ThumbnailUpload({ imagePreview, setImagePreview, errors, setErrors }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "Vui lòng chọn file ảnh (jpg, png, webp...)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB" }));
      return;
    }
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
      <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">
        Ảnh thumbnail (tuỳ chọn)
      </label>
      <div className="flex gap-5 items-start">
        <div className="flex-1">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-[90px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
              errors.image ? "border-red-300 bg-red-50" : "border-gray-200 bg-[#FAFAFA] hover:border-[#F26739] hover:bg-[#FFF4EF]"
            }`}
          >
            <ImageIcon size={22} className={errors.image ? "text-red-400" : "text-gray-300"} />
            <span className={`text-[13px] font-semibold ${errors.image ? "text-red-400" : "text-gray-400"}`}>
              Nhấn để chọn ảnh từ máy tính
            </span>
            <span className="text-[11px] text-gray-300">JPG, PNG, WEBP — tối đa 5MB</span>
          </button>
          {errors.image && <p className="text-red-500 text-[12px] mt-1.5">{errors.image}</p>}
          {!imagePreview && <p className="text-[11px] text-gray-400 mt-2">Nếu để trống sẽ hiển thị chữ cái đầu của tên bộ thẻ.</p>}
        </div>

        <div className="relative w-[140px] h-[90px] rounded-xl overflow-hidden border border-gray-200 bg-[#FAFAFA] shrink-0 flex items-center justify-center">
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={handleClear}
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
  );
}