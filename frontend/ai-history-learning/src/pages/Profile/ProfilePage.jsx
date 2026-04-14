import React, { useState } from "react";

const ROLES = [
  { value: "admin", label: "Quản trị viên", color: "bg-purple-100 text-purple-700" },
  { value: "teacher", label: "Giáo viên", color: "bg-blue-100 text-blue-700" },
  { value: "student", label: "Học sinh", color: "bg-green-100 text-green-700" },
];

const DEFAULT_PROFILE = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone: "0851225478",
  role: "teacher",
};

export default function ProfilePage() {
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });
  const [saved, setSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    localStorage.setItem("profile", JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordSubmit = () => {
    if (!passwordForm.current) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!passwordForm.newPass) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }
    setPasswordError("");
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setShowPasswordModal(false);
  };

  const initials = form.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentRole = ROLES.find((r) => r.value === form.role);

  return (
    <div>
      <h1 className="text-xl font-medium text-gray-800 text-center mb-6">
        Thông tin cá nhân
      </h1>

      <div className="flex gap-5 items-start">
        {/* Left — Form */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#F26739] flex items-center justify-center mb-2 text-white font-medium text-xl">
              {initials || "?"}
            </div>
            <p className="font-medium text-gray-800">{form.name || "—"}</p>
            <p className="text-sm text-gray-400">{form.email || "—"}</p>
            {currentRole && (
              <span
                className={`mt-2 text-xs font-medium px-3 py-0.5 rounded-full ${currentRole.color}`}
              >
                {currentRole.label}
              </span>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Họ và tên</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Vai trò</label>
              <div className="flex gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                    className={`flex-1 h-10 rounded-lg text-sm font-medium border transition-all ${
                      form.role === role.value
                        ? "border-[#F26739] bg-orange-50 text-[#F26739]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 mt-6">
            <button
              onClick={handleSubmit}
              className={`w-full h-10 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
                saved
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-[#F26739] hover:bg-orange-600"
              }`}
            >
              {saved ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Đã lưu thay đổi
                </>
              ) : (
                "Xác nhận thay đổi"
              )}
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full h-10 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Thay đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Right — Recent Activity */}
        <div className="w-80 bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium text-gray-800 mb-4">Hoạt động gần đây</p>
          <div className="space-y-0 divide-y divide-gray-100">
            {[
              {
                bg: "bg-blue-50",
                color: "text-blue-500",
                title: "Upload file mới",
                desc: "Chiến tranh Điện Biên Phủ",
                time: "5 phút trước",
              },
              {
                bg: "bg-green-50",
                color: "text-green-500",
                title: "Phản hồi bình luận",
                desc: "Phản hồi bình luận của Tạ Văn Tú",
                time: "12 phút trước",
              },
              {
                bg: "bg-orange-50",
                color: "text-orange-500",
                title: "Sửa nội dung bài học",
                desc: "Giải phóng miền Nam Việt Nam",
                time: "1 giờ trước",
              },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div
                  className={`w-8 h-8 rounded-lg ${act.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <svg
                    className={`w-4 h-4 ${act.color}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{act.title}</p>
                  <p className="text-xs text-gray-400 truncate">{act.desc}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Thay đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-sm p-6">
            <h3 className="text-base font-medium text-gray-800 mb-4">
              Thay đổi mật khẩu
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, current: e.target.value }))
                  }
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, newPass: e.target.value }))
                  }
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                  }
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordForm({ current: "", newPass: "", confirm: "" });
                }}
                className="flex-1 h-9 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 h-9 bg-[#F26739] hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}