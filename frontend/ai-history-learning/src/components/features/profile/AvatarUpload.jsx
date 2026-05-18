import { useRef, useState } from "react";
import { createPortal } from "react-dom";

// mode: null | "view" | "preview"
export default function AvatarUpload({ avatarUrl, initials, onFileChange }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState(null); // null = đóng, "view" = xem ảnh, "preview" = xem trước ảnh mới
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Ảnh hiển thị trên avatar nhỏ: nếu đang preview thì dùng preview, không thì dùng avatarUrl
  const displayUrl = previewUrl ?? avatarUrl;

  // Click icon camera → mở file picker
  const handleCameraClick = (e) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  // Chọn file xong → tạo preview, mở lightbox ở mode "preview"
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Huỷ blob cũ nếu có
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const blob = URL.createObjectURL(file);
    setPreviewUrl(blob);
    setPreviewFile(file);
    setMode("preview");
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  // Xác nhận dùng ảnh mới
  const handleConfirm = () => {
    if (previewFile && previewUrl) {
      onFileChange?.(previewFile, previewUrl);
    }
    // Giữ previewUrl làm displayUrl (đã lưu), đóng lightbox
    setMode(null);
    setPreviewFile(null);
  };

  // Huỷ preview → quay lại ảnh cũ
  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);
    setMode(null);
  };

  // Đóng lightbox xem ảnh bình thường
  const handleClose = () => setMode(null);

  // Ảnh hiển thị trong lightbox
  const lightboxUrl = mode === "preview" ? previewUrl : avatarUrl;

  return (
    <>
      <div className="relative" style={{ width: 80, height: 80 }}>
        {/* Avatar — click để xem */}
        <div
          className="rounded-full overflow-hidden border-[3px] border-white cursor-pointer"
          style={{ width: 80, height: 80 }}
          onClick={() => setMode("view")}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              style={{ width: 80, height: 80, minWidth: 80, maxWidth: 80, objectFit: "cover", display: "block", flexShrink: 0 }}
            />
          ) : (
            <div
              className="bg-[#F26739] flex items-center justify-center text-white font-medium select-none"
              style={{ width: 80, height: 80, fontSize: 20 }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Nút camera — click để thay ảnh */}
        <button
          type="button"
          onClick={handleCameraClick}
          className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 z-10"
          title="Thay ảnh"
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Lightbox */}
      {mode !== null && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}
          onClick={mode === "view" ? handleClose : undefined}
        >
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            {mode === "preview" && (
              <p style={{
                color: "white", fontSize: 14, fontWeight: 500,
                textAlign: "center", margin: "0 0 12px",
              }}>
                Xem trước ảnh mới
              </p>
            )}

            <div style={{
              width: 256, height: 256,
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid white",
            }}>
              {lightboxUrl ? (
                <img
                  src={lightboxUrl}
                  alt="Avatar"
                  style={{ width: 256, height: 256, objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{
                  width: 256, height: 256,
                  background: "#F26739",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 64, fontWeight: 500, userSelect: "none",
                }}>
                  {initials}
                </div>
              )}
            </div>

            {/* Nút X — chỉ hiện khi xem ảnh bình thường */}
            {mode === "view" && (
              <button
                type="button"
                onClick={handleClose}
                style={{
                  position: "absolute", top: -12, right: -12,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "white", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 16,
                }}
                aria-label="Đóng"
              >
                ✕
              </button>
            )}
          </div>

          {/* Nút hành động */}
          {mode === "preview" ? (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  padding: "10px 28px",
                  background: "#F26739",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Dùng ảnh này
              </button>
              <button
                type="button"
                onClick={handleCancelPreview}
                style={{
                  padding: "10px 28px",
                  background: "white",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Huỷ
              </button>
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>
              Nhấn Esc hoặc click bên ngoài để đóng
            </p>
          )}
        </div>,
        document.body
      )}
    </>
  );
}