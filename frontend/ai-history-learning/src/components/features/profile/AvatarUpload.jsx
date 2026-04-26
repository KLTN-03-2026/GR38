import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { getToken } from "./Hook/useProfile";

const BASE_URL = "/api/v1/auth";

export default function AvatarUpload({ avatarUrl, setAvatarUrl, initials }) {
  const inputRef = useRef(null);
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);

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
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);

      // ✅ Đúng route: PUT /api/v1/auth/profile (không phải /upload-avatar)
      // ✅ Đúng field: "avatar" theo Swagger docs
      // ✅ KHÔNG set Content-Type thủ công — browser tự set multipart/form-data + boundary
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch(`${BASE_URL}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });

      if (!res.ok) throw new Error();

      const json = await res.json();
      const data = json.data ?? json;

      // Cloudinary trả URL về — thử các field có thể có
      const realUrl =
        data.profileImage ??
        data.avatarUrl ??
        data.avatar ??
        preview;

      setPreview(realUrl);
      setAvatarUrl(realUrl);
      setFile(null);

      // Lưu localStorage để F5 vẫn còn
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...stored, profileImage: realUrl, avatarUrl: realUrl, avatar: realUrl })
        );
      } catch (_) {}

      // Đồng bộ Header ngay lập tức
      window.dispatchEvent(new CustomEvent("avatar-update", { detail: { avatarUrl: realUrl } }));
      window.dispatchEvent(new Event("user-update"));

      await Swal.fire({
        icon: "success",
        title: "Cập nhật ảnh thành công",
        confirmButtonColor: "#f97316",
        timer: 1500,
        timerProgressBar: true,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Upload ảnh thất bại", confirmButtonColor: "#f97316" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <div className="w-16 h-16 rounded-full bg-white border-[3px] border-[#F26739] overflow-hidden flex items-center justify-center">
          {preview
            ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
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

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs bg-[#F26739] hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg transition disabled:opacity-60"
        >
          {uploading
            ? <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Đang tải...</>
            : "Lưu ảnh đại diện"
          }
        </button>
      )}
    </div>
  );
}