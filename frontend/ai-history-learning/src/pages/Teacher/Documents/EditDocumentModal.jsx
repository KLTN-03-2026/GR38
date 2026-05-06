import { useRef, useState } from "react";
import api from "../../../lib/api";
import { IconEdit, IconX, IconImage, IconCheck } from "./icons";

const DEFAULT_COVERS = ["/anh1.jpg", "/anh2.jpg", "/anh3.jpg", "/anh6.jpg"];

export default function EditDocumentModal({ doc, onClose, onSaved }) {
  const thumbInputRef = useRef(null);
  const pdfInputRef   = useRef(null);
  const [title, setTitle]             = useState(doc?.title ?? "");
  const [description, setDescription] = useState(doc?.description ?? "");
  const [thumbFile, setThumbFile]     = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbSuccess, setThumbSuccess]     = useState(false);
  const [pdfFile, setPdfFile]         = useState(null);
  const [uploadingPdf, setUploadingPdf]   = useState(false);
  const [pdfSuccess, setPdfSuccess]       = useState(false);
  const [pdfProgress, setPdfProgress]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const currentCover = (() => {
    if (doc?.thumbnail && doc.thumbnail.trim() !== "" && doc.thumbnail !== "null") return doc.thumbnail;
    const hash = (doc?._id?.toString() ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return DEFAULT_COVERS[hash % DEFAULT_COVERS.length];
  })();

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Chỉ chấp nhận file ảnh"); return; }
    if (file.size > 5 * 1024 * 1024)    { setError("Ảnh không được vượt quá 5MB"); return; }
    setError(""); setThumbFile(file); setThumbPreview(URL.createObjectURL(file)); setThumbSuccess(false);
  };

  const handleUploadThumb = async () => {
    if (!thumbFile) return;
    try {
      setUploadingThumb(true); setError("");
      const fd = new FormData(); fd.append("thumbnail", thumbFile);
      const { data } = await api.post("/documents/upload-thumbnail", fd);
      await api.patch(`/documents/${doc._id}`, { thumbnail: data.url });
      setThumbSuccess(true);
    } catch (err) { setError(err.response?.data?.message ?? "Lỗi upload ảnh bìa"); }
    finally { setUploadingThumb(false); }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf")    { setError("Chỉ chấp nhận file PDF"); return; }
    if (file.size > 100 * 1024 * 1024)     { setError("File PDF không được vượt quá 100MB"); return; }
    setError(""); setPdfFile(file); setPdfSuccess(false); setPdfProgress(0);
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return;
    try {
      setUploadingPdf(true); setError("");
      const fd = new FormData(); fd.append("pdf", pdfFile); fd.append("documentId", doc._id);
      await api.post("/documents/upload-pdf", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => { if (e.total) setPdfProgress(Math.round((e.loaded / e.total) * 100)); },
      });
      setPdfSuccess(true); setPdfProgress(100);
    } catch (err) { setError(err.response?.data?.message ?? "Lỗi upload PDF"); }
    finally { setUploadingPdf(false); }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Tên tài liệu không được để trống"); return; }
    try {
      setSaving(true); setError("");
      await api.put(`/documents/${doc._id}`, { title: title.trim(), description: description.trim() });
      onSaved?.(); onClose();
    } catch (err) { setError(err.response?.data?.message ?? "Lỗi lưu tài liệu"); }
    finally { setSaving(false); }
  };

  const isBusy = saving || uploadingThumb || uploadingPdf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[440px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F26739]"><IconEdit /></div>
            <p className="text-sm font-semibold text-gray-800">Chỉnh sửa tài liệu</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"><IconX /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Step 1 */}
          <div className="space-y-4">
            <StepLabel n={1} label="Thông tin tài liệu" />
            <Field label="Tên tài liệu *">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tên tài liệu..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100 transition" />
            </Field>
            <Field label="Mô tả">
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="Nhập mô tả (tuỳ chọn)..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100 transition resize-none" />
            </Field>
          </div>

          <hr className="border-gray-100" />

          {/* Step 2 */}
          <div className="space-y-3">
            <StepLabel n={2} label="Ảnh bìa tài liệu" />
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 group cursor-pointer"
              onClick={() => thumbInputRef.current?.click()}>
              <img src={thumbPreview ?? currentCover} alt="cover" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><IconImage /></div>
                <p className="text-xs text-white font-medium">Nhấn để đổi ảnh</p>
              </div>
            </div>
            <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
            <div className="flex items-center gap-2">
              <button onClick={() => thumbInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition">
                <IconImage /> {thumbFile ? "Đổi ảnh khác" : "Chọn ảnh"}
              </button>
              {thumbFile && !thumbSuccess && (
                <button onClick={handleUploadThumb} disabled={uploadingThumb}
                  className="flex items-center gap-1.5 text-xs bg-[#F26739] hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition disabled:opacity-60">
                  {uploadingThumb ? <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Đang tải...</> : <><IconCheck /> Tải lên</>}
                </button>
              )}
              {thumbSuccess && <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg"><IconCheck /> Đã cập nhật</span>}
            </div>
            {thumbFile && <p className="text-[10px] text-gray-400">📎 {thumbFile.name} · {(thumbFile.size / 1024).toFixed(0)} KB</p>}
          </div>

          <hr className="border-gray-100" />

          {/* Step 3 */}
          <div className="space-y-3">
            <StepLabel n={3} label="Thay thế file PDF" />
            <div onClick={() => pdfInputRef.current?.click()}
              className={`w-full rounded-xl border-2 border-dashed px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition
                ${pdfSuccess ? "border-green-300 bg-green-50" : pdfFile ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-gray-50 hover:border-orange-300"}`}>
              {pdfSuccess ? (
                <><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500"><IconCheck /></div>
                  <p className="text-xs font-medium text-green-600">Upload thành công!</p><p className="text-[10px] text-green-500">{pdfFile?.name}</p></>
              ) : pdfFile ? (
                <><p className="text-xs font-medium text-gray-700 truncate max-w-full">{pdfFile.name}</p>
                  <p className="text-[10px] text-gray-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB · Nhấn để đổi file</p></>
              ) : (
                <><p className="text-xs font-medium text-gray-600">Nhấn để chọn file PDF</p><p className="text-[10px] text-gray-400">Tối đa 10MB</p></>
              )}
            </div>
            <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfChange} />
            {pdfFile && !pdfSuccess && (
              <div className="space-y-2">
                <button onClick={handleUploadPdf} disabled={uploadingPdf}
                  className="w-full flex items-center justify-center gap-2 text-sm bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-xl transition disabled:opacity-60">
                  {uploadingPdf ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang upload... {pdfProgress}%</> : "Upload PDF"}
                </button>
                {uploadingPdf && pdfProgress > 0 && (
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F26739] rounded-full transition-all" style={{ width: `${pdfProgress}%` }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-500">⚠️ {error}</div>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 pb-5">
          <button onClick={onClose} disabled={isBusy} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">Huỷ</button>
          <button onClick={handleSave} disabled={isBusy}
            className="flex-1 py-2.5 rounded-xl bg-[#F26739] hover:bg-orange-600 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

const StepLabel = ({ n, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded-full bg-[#F26739] text-white text-[10px] font-bold flex items-center justify-center">{n}</div>
    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</p>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    {children}
  </div>
);