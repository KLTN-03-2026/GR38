import { useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function AvatarUpload({ avatarUrl, initials, onFileChange }) {
  const inputRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleCameraClick = (e) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = URL.createObjectURL(file);
    onFileChange?.(file, blob);
  };

  return (
    <>
      <div
        className="relative cursor-pointer"
        style={{ width: 80, height: 80 }}
        onClick={() => setLightboxOpen(true)}
      >
        <div
          className="rounded-full overflow-hidden border-[3px] border-white"
          style={{ width: 80, height: 80 }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
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

        <button
          type="button"
          onClick={handleCameraClick}
          className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 z-10"
          title="Đổi ảnh"
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

      {/* ✅ Portal render ra document.body, tránh bị clip bởi parent */}
      {lightboxOpen && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: 256, height: 256,
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid white",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{ width: 256, height: 256, objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: 256, height: 256,
                    background: "#F26739",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 64, fontWeight: 500, userSelect: "none",
                  }}
                >
                  {initials}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
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
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>
            Nhấn Esc hoặc click bên ngoài để đóng
          </p>
        </div>,
        document.body
      )}
    </>
  );
}