import { useState } from "react";
import { useProfile } from "@/components/features/profile/Hook/useProfile";
import AvatarUpload  from "@/components/features/profile/AvatarUpload";
import ProfileForm   from "@/components/features/profile/ProfileForm";
import PasswordModal from "@/components/features/profile/PasswordModal";
import StatsPanel    from "@/components/features/profile/StatsPanel";

export default function ProfilePage() {
  const {
    savedName, form, setForm, loading, saving,
    fetchError, saveError, avatarUrl, setAvatarUrl, handleSubmit,
  } = useProfile();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarBlob, setAvatarBlob] = useState(null);

  const initials  = savedName
    ? savedName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roleLabel =
    (form.role || "").toUpperCase() === "TEACHER" ? "Giáo viên" :
    (form.role || "").toUpperCase() === "LEARNER"  ? "Người học" :
    form.role ?? "";

  const isTeacher = (form.role || "").toUpperCase() === "TEACHER";

  return (
    /* Page wrapper — two-column layout */
    <div className="flex gap-6 items-start w-full">

      {/* ── Main card ── */}
      <div className="flex-1 min-w-0 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/80">

        {/* Hero banner */}
        <div
          className="relative h-28"
          style={{
            background: "linear-gradient(135deg, #F26739 0%, #f5915e 60%, #fbb49a 100%)",
          }}
        >
          {/* Subtle texture overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), " +
                "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25) 0%, transparent 40%)",
            }}
          />

          {/* Avatar — centred, half-overlapping the banner */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-11 z-10">
            <AvatarUpload
              avatarUrl={avatarUrl}
              initials={initials}
              onFileChange={(f, blob) => { setAvatarFile(f); setAvatarBlob(blob); }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="pt-14 pb-8 px-12">
          {loading ? (
            /* Loading skeleton */
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-5 h-5 border-[2.5px] border-orange-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400 tracking-wide">Đang tải thông tin...</p>
            </div>

          ) : fetchError ? (
            /* Error state */
            <div className="text-center py-8">
              <p className="text-sm text-red-500 mb-3">{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-[#F26739] underline underline-offset-2 hover:opacity-75 transition-opacity"
              >
                Thử lại
              </button>
            </div>

          ) : (
            <>
              {/* Name + role badge */}
              <div className="text-center mb-6">
                <h1 className="text-lg font-semibold text-gray-900 leading-snug">{savedName}</h1>
                {roleLabel && (
                  <span
                    className="inline-block mt-1.5 text-[11px] font-medium tracking-wide px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(242, 103, 57, 0.08)",
                      color: "#c94e20",
                      border: "1px solid rgba(242, 103, 57, 0.18)",
                    }}
                  >
                    {roleLabel}
                  </span>
                )}
              </div>

              <div className="h-px bg-gray-100 mb-6" />

              {/* Profile form */}
              <ProfileForm
                form={form}
                setForm={setForm}
                saving={saving}
                saveError={saveError}
                onSubmit={() =>
                  handleSubmit(avatarFile, avatarBlob, setAvatarUrl, setAvatarFile, setAvatarBlob)
                }
                onOpenPassword={() => setShowPasswordModal(true)}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Stats sidebar — fixed width, không bị co ── */}
      {isTeacher && (
        <div className="w-80 flex-shrink-0 self-start">
          <StatsPanel />
        </div>
      )}

      {/* ── Password modal ── */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}