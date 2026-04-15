import React, { useState } from "react";

const DEFAULT_PROFILE = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone: "0851225478",
  role: "teacher",
};

export default function ProfilePage() {
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [saved, setSaved] = useState(false);

  //  password modal
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

  //  save profile
  const handleSubmit = () => {
    localStorage.setItem("user", JSON.stringify(form));
    window.dispatchEvent(new Event("user-update"));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  //  change password
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

  const roleLabel =
    form.role === "teacher" ? "Giáo viên" : "Người học";

  return (
    <div>
      <h1 className="text-xl font-medium text-gray-800 text-center mb-6">
        Thông tin cá nhân
      </h1>
      <div className="flex gap-5 items-start">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#F26739] flex items-center justify-center text-white font-medium text-xl">
              {initials || "?"}
            </div>
            <p className="font-medium text-gray-800">{form.name}</p>
            <p className="text-sm text-gray-400">{form.email}</p>
            <span className="mt-2 text-xs px-3 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {roleLabel}
            </span>
          </div>
          <div className="space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full h-10 px-3 border rounded-lg text-sm"
              placeholder="Họ và tên"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full h-10 px-3 border rounded-lg text-sm"
              placeholder="Email"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full h-10 px-3 border rounded-lg text-sm"
              placeholder="Số điện thoại"
            />
          </div>
          <div className="space-y-2 mt-6">
            <button
              onClick={handleSubmit}
              className={`w-full h-10 text-white rounded-lg ${
                saved
                  ? "bg-green-500"
                  : "bg-[#F26739] hover:bg-orange-600"
              }`}
            >
              {saved ? "Đã lưu thay đổi" : "Xác nhận thay đổi"}
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full h-10 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-80 bg-white border rounded-xl p-5">
          <p className="text-sm font-medium mb-3">
            Hoạt động gần đây
          </p>

          <div className="text-xs text-gray-500">
            (giữ nguyên phần của bạn)
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">

            <h3 className="text-base font-medium mb-4">
              Đổi mật khẩu
            </h3>

            <div className="space-y-3">

              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    current: e.target.value,
                  }))
                }
                className="w-full h-9 px-3 border rounded-lg text-sm"
              />

              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordForm.newPass}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    newPass: e.target.value,
                  }))
                }
                className="w-full h-9 px-3 border rounded-lg text-sm"
              />

              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    confirm: e.target.value,
                  }))
                }
                className="w-full h-9 px-3 border rounded-lg text-sm"
              />

              {passwordError && (
                <p className="text-xs text-red-500">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-5">

              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 h-9 border rounded-lg text-sm"
              >
                Hủy
              </button>

              <button
                onClick={handlePasswordSubmit}
                className="flex-1 h-9 bg-[#F26739] text-white rounded-lg text-sm"
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