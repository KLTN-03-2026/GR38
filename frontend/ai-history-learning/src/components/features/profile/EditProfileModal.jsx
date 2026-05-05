import { useState } from "react";
import AvatarUpload  from "@/components/features/profile/AvatarUpload";
import PasswordModal from "@/components/features/profile/PasswordModal";

export default function EditProfileModal({
  form, setForm,
  saving, saveError,
  avatarUrl, setAvatarUrl,
  initials,
  handleSubmit,
  onClose,
}) {
  const [showPwModal, setShowPwModal]   = useState(false);
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarBlob, setAvatarBlob]     = useState(null);

  const isUnchanged = !form.fullName?.trim();

  const onSubmit = async () => {
    await handleSubmit(avatarFile, avatarBlob, setAvatarUrl, setAvatarFile, setAvatarBlob);
    // handleSubmit gọi Swal bên trong, chỉ đóng modal khi không có lỗi
    if (!saveError) onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Chỉnh sửa hồ sơ</h3>
            <button
              onClick={() => !saving && onClose()}
              className="w-7 h-7 rounded-full flex items-center justify-center
                         text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <AvatarUpload
                avatarUrl={avatarUrl}
                initials={initials}
                onFileChange={(f, blob) => { setAvatarFile(f); setAvatarBlob(blob); }}
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Ảnh đại diện</p>
                <p className="text-xs text-gray-400 mt-0.5">Nhấn vào ảnh để thay đổi · Tối đa 5MB</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Họ và tên */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Họ và tên</label>
              <input
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                placeholder="Nhập họ và tên"
                maxLength={100}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none
                           focus:border-[#F26739] focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Nhập email"
                type="email"
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none
                           focus:border-[#F26739] focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>

            {saveError && (
              <p className="text-xs text-red-500">{saveError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
            <button
              onClick={onSubmit}
              disabled={saving || isUnchanged}
              className="flex-1 h-9 bg-[#F26739] hover:bg-orange-600 text-white text-sm
                         rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? <span className="flex items-center justify-center gap-1.5">
                    <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </span>
                : "Lưu thay đổi"
              }
            </button>
            <button
              onClick={() => setShowPwModal(true)}
              disabled={saving}
              className="flex-1 h-9 border border-gray-200 text-sm text-gray-600
                         rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      {/* Password modal — mở chồng lên trên edit modal */}
      {showPwModal && (
        <PasswordModal onClose={() => setShowPwModal(false)} />
      )}
    </>
  );
}