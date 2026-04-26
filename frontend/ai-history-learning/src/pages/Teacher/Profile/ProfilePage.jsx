import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const BASE_URL = "/api/v1/auth";

function getToken() {
  try {
    const tokenObj = JSON.parse(localStorage.getItem("token") || "{}");
    if (tokenObj.access_token) return tokenObj.access_token;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.access_token ?? user.accessToken ?? user.token ?? "";
  } catch { return ""; }
}

export default function ProfilePage() {
  const [form, setForm]             = useState({ name: "", email: "", role: "" });
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError]   = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // ── GET profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      setFetchError("");
      try {
        const token = getToken();
        if (!token) throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");

        const res = await fetch(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Server trả về HTML thay vì JSON:", text.slice(0, 200));
          throw new Error(`Server lỗi (${res.status}): Không nhận được JSON`);
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const data = json.data ?? json;
        setForm({
          name:  data.fullName ?? data.name ?? "",
          email: data.email ?? "",
          role:  data.role  ?? "",
        });
      } catch (err) {
        setFetchError(err.message || "Không thể tải thông tin. Vui lòng thử lại.");
        console.error("GET profile error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── PUT profile ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ fullName: form.name, email: form.email }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const updated = json.data ?? json;

      setForm(p => ({
        ...p,
        name:  updated.fullName ?? updated.name ?? p.name,
        email: updated.email ?? p.email,
      }));

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...stored,
        name:     form.name,
        fullName: form.name,
        email:    form.email,
      }));
      window.dispatchEvent(new Event("user-update"));

      await Swal.fire({
        icon: "success",
        title: "CẬP NHẬT THÀNH CÔNG",
        html: `Thông tin tài khoản đã được lưu`,
        confirmButtonColor: "#f97316",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (err) {
      setSaveError("Lưu thất bại. Vui lòng thử lại.");
      console.error("PUT profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── POST change-password ─────────────────────────────────────────────────
  const handlePasswordSubmit = async () => {
    if (!passwordForm.current) { setPasswordError("Vui lòng nhập mật khẩu hiện tại"); return; }
    if (!passwordForm.newPass)  { setPasswordError("Vui lòng nhập mật khẩu mới"); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordError("Mật khẩu xác nhận không khớp"); return; }

    setPasswordSaving(true);
    setPasswordError("");
    try {
      const res = await fetch(`${BASE_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword:    passwordForm.current,
          newPassword:        passwordForm.newPass,
          newPasswordConfirm: passwordForm.confirm,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);

      setShowPasswordModal(false);
      setPasswordForm({ current: "", newPass: "", confirm: "" });

      await Swal.fire({
        icon: "success",
        title: "ĐỔI MẬT KHẨU THÀNH CÔNG",
        html: `Mật khẩu của bạn đã được cập nhật`,
        confirmButtonColor: "#f97316",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (err) {
      setPasswordError(err.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
      console.error("POST change-password error:", err);
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = form.name
    ? form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roleLabel =
    (form.role || "").toUpperCase() === "TEACHER" ? "Giáo viên" :
    (form.role || "").toUpperCase() === "LEARNER" ? "Người học" :
    form.role ?? "";

  return (
    <div className="flex gap-4 items-start">

      {/* LEFT - Form */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-[#F26739] to-[#f08260] relative">
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-[3px] border-[#F26739] flex items-center justify-center">
            <span className="text-[#F26739] text-lg font-medium">{initials}</span>
          </div>
        </div>

        <div className="pt-10 pb-5 px-10">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Đang tải thông tin...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 mb-3">{fetchError}</p>
              <button onClick={() => window.location.reload()}
                className="text-xs text-orange-500 underline">Thử lại</button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="font-medium text-gray-900">{form.name}</p>
                <p className="text-xs text-gray-400 mb-2">{form.email}</p>
                {roleLabel && (
                  <span className="text-xs px-3 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">
                    {roleLabel}
                  </span>
                )}
              </div>

              <hr className="border-gray-100 my-4" />

              <p className="text-sm font-medium text-gray-800 text-center mb-3">Thông tin cá nhân</p>

              <div className="max-w-xs mx-auto space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Họ và tên</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {saveError && <p className="text-xs text-red-500 text-center mt-2">{saveError}</p>}

              <div className="flex gap-2 mt-4 max-w-xs mx-auto">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 h-9 bg-[#F26739] hover:bg-orange-600 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  onClick={() => { setShowPasswordModal(true); setPasswordError(""); }}
                  className="flex-1 h-9 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-60 space-y-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Thống kê</p>
          <div className="grid grid-cols-2 gap-2">
            {[["Tài liệu","6"],["Người học","24"],["Chương","18"],["Bài học","47"]].map(([label, val]) => (
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
            { color: "bg-orange-50", text: "text-[#F26739]", label: "Thêm tài liệu mới",      time: "2 giờ trước",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> },
            { color: "bg-green-50",  text: "text-green-600", label: "Cập nhật chương 2",       time: "Hôm qua",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> },
            { color: "bg-blue-50",   text: "text-blue-600",  label: "Người học mới tham gia",  time: "2 ngày trước",
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
          onClick={() => !passwordSaving && setShowPasswordModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
            <div className="space-y-3">
              {[
                ["current", "Mật khẩu hiện tại"],
                ["newPass",  "Mật khẩu mới"],
                ["confirm",  "Xác nhận mật khẩu"],
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
              <button onClick={() => setShowPasswordModal(false)} disabled={passwordSaving}
                className="flex-1 h-9 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                Hủy
              </button>
              <button onClick={handlePasswordSubmit} disabled={passwordSaving}
                className="flex-1 h-9 bg-[#F26739] hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                {passwordSaving ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}