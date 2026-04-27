import { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function AvatarUpload({ avatarUrl, initials, onFileChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (avatarUrl && !avatarUrl.startsWith("blob:")) {
      setPreview(avatarUrl);
    }
  }, [avatarUrl]);

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Chỉ chấp nhận file ảnh", confirmButtonColor: "#f97316" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "Ảnh không vượt quá 5MB", confirmButtonColor: "#f97316" });
      return;
    }
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const newBlob = URL.createObjectURL(f);
    setBlobUrl(newBlob);
    setPreview(newBlob);
    onFileChange(f, newBlob);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <div className="w-16 h-16 rounded-full bg-white border-[3px] border-[#F26739] overflow-hidden flex items-center justify-center">
          {preview
            ? <img key={preview} src={preview} alt="avatar" className="w-full h-full object-cover" />
            : <span className="text-[#F26739] text-lg font-medium">{initials}</span>
          }
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#F26739] border-2 border-white flex items-center justify-center hover:bg-orange-600 transition"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    </div>
  );
}