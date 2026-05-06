export default function ProfileForm({ form, setForm, saving, saveError, onSubmit, onOpenPassword }) {
  const isUnchanged = !form.fullName?.trim();

  return (
    <>
      <p className="text-sm font-medium text-gray-800 text-center mb-3">Thông tin cá nhân</p>
      <div className="max-w-xs mx-auto space-y-3">

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Họ và tên</label>
          <input
            value={form.fullName}
            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
            placeholder="Nhập họ và tên"
            maxLength={100}
            className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Email</label>
          <input
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="Nhập email"
            type="email"
            className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
          />
        </div>

      </div>

      {saveError && (
        <p className="text-xs text-red-500 text-center mt-2">{saveError}</p>
      )}

      <div className="flex gap-2 mt-4 max-w-xs mx-auto">
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
          onClick={onOpenPassword}
          className="flex-1 h-9 border border-gray-200 text-sm text-gray-600
                     rounded-lg hover:bg-gray-50 transition"
        >
          Đổi mật khẩu
        </button>
      </div>
    </>
  );
}