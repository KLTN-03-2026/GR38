import { useState } from "react";
import { useProfile } from "@/components/features/profile/Hook/useProfile";
import AvatarUpload  from "@/components/features/profile/AvatarUpload";
import ProfileForm   from "@/components/features/profile/ProfileForm";
import PasswordModal from "@/components/features/profile/PasswordModal";
import StatsPanel    from "@/components/features/profile/StatsPanel";

export default function ProfilePage() {
  const { savedName, form, setForm, loading, saving, fetchError, saveError, avatarUrl, setAvatarUrl, handleSubmit } = useProfile();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarBlob, setAvatarBlob] = useState(null);

  const initials  = savedName ? savedName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const roleLabel =
    (form.role || "").toUpperCase() === "TEACHER" ? "Giáo viên" :
    (form.role || "").toUpperCase() === "LEARNER"  ? "Người học" : form.role ?? "";

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-[#F26739] to-[#f08260] relative">
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <AvatarUpload
              avatarUrl={avatarUrl}
              initials={initials}
              onFileChange={(f, blob) => { setAvatarFile(f); setAvatarBlob(blob); }}
            />
          </div>
        </div>

        <div className="pt-12 pb-5 px-10">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Đang tải thông tin...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 mb-3">{fetchError}</p>
              <button onClick={() => window.location.reload()} className="text-xs text-orange-500 underline">Thử lại</button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="font-medium text-gray-900">{savedName}</p>
                {roleLabel && <span className="text-xs px-3 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">{roleLabel}</span>}
              </div>
              <hr className="border-gray-100 my-4" />
              <ProfileForm
                form={form} setForm={setForm}
                saving={saving} saveError={saveError}
                onSubmit={() => handleSubmit(avatarFile, avatarBlob, setAvatarUrl, setAvatarFile, setAvatarBlob)}
                onOpenPassword={() => setShowPasswordModal(true)}
              />
            </>
          )}
        </div>
      </div>

      <StatsPanel />
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}