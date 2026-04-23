import { useState } from "react";

const DEFAULT_PROFILE = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  role: "teacher",
};

export default function ProfilePage() {
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });
  const [saved, setSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    localStorage.setItem("user", JSON.stringify(form));
    window.dispatchEvent(new Event("user-update"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordSubmit = () => {
    if (!passwordForm.current) { setPasswordError("Vui lòng nhập mật khẩu hiện tại"); return; }
    if (!passwordForm.newPass) { setPasswordError("Vui lòng nhập mật khẩu mới"); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordError("Mật khẩu xác nhận không khớp"); return; }
    setPasswordError("");
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setShowPasswordModal(false);
  };

  const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = form.role === "teacher" ? "Giáo viên" : "Người học";

  return (
    <div className="flex gap-4 items-start">

      {/* LEFT - Form */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Banner + Avatar */}
        <div className="h-16 bg-gradient-to-r from-[#F26739] to-[#f08260] relative">
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-[3px] border-[#F26739] flex items-center justify-center">
            <span className="text-[#F26739] text-lg font-medium">{initials}</span>
          </div>
        </div>

        <div className="pt-10 pb-5 px-10">
          <div className="text-center mb-4">
            <p className="font-medium text-gray-900">{form.name}</p>
            <p className="text-xs text-gray-400 mb-2">{form.email}</p>
            <span className="text-xs px-3 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">
              {roleLabel}
            </span>
          </div>

          <hr className="border-gray-100 my-4" />

          <p className="text-sm font-medium text-gray-800 text-center mb-3">Thông tin cá nhân</p>

          <div className="max-w-xs mx-auto space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Họ và tên</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4 max-w-xs mx-auto">
            <button
              onClick={handleSubmit}
              className={`flex-1 h-9 text-white text-sm rounded-lg font-medium transition-colors ${
                saved ? "bg-green-500" : "bg-[#F26739] hover:bg-orange-600"
              }`}
            >
              {saved ? "Đã lưu" : "Lưu thay đổi"}
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex-1 h-9 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-60 space-y-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Thống kê</p>
          <div className="grid grid-cols-2 gap-2">
            {[["Tài liệu","6"],["Học sinh","24"],["Chương","18"],["Bài học","47"]].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-xl font-medium text-gray-900">{val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Hoạt động gần đây</p>
          {[
            { color: "bg-orange-50", text: "text-[#F26739]", label: "Thêm tài liệu mới", time: "2 giờ trước",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> },
            { color: "bg-green-50", text: "text-green-600", label: "Cập nhật chương 2", time: "Hôm qua",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> },
            { color: "bg-blue-50", text: "text-blue-600", label: "Học sinh mới tham gia", time: "2 ngày trước",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                <svg className={`w-3.5 h-3.5 ${item.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
            <div className="space-y-3">
              {[
                ["current", "Mật khẩu hiện tại"],
                ["newPass", "Mật khẩu mới"],
                ["confirm", "Xác nhận mật khẩu"],
              ].map(([field, placeholder]) => (
                <input
                  key={field}
                  type="password"
                  placeholder={placeholder}
                  value={passwordForm[field]}
                  onChange={e => setPasswordForm(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
                />
              ))}
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowPasswordModal(false)}
                className="flex-1 h-9 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handlePasswordSubmit}
                className="flex-1 h-9 bg-[#F26739] hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}