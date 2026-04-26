import { useState } from "react";
import Swal from "sweetalert2";
import { getToken } from "./Hook/useProfile";

const BASE_URL = "/api/v1/auth";

const EyeOn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function PasswordModal({ onClose }) {
  const [form, setForm]     = useState({ current: "", newPass: "", confirm: "" });
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);
  const [show, setShow]     = useState({ current: false, newPass: false, confirm: false });

  const handleSubmit = async () => {
    if (!form.current) { setError("Vui lòng nhập mật khẩu hiện tại"); return; }
    if (!form.newPass)  { setError("Vui lòng nhập mật khẩu mới"); return; }
    if (form.newPass !== form.confirm) { setError("Mật khẩu xác nhận không khớp"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass, newPasswordConfirm: form.confirm }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
      onClose();
      await Swal.fire({ icon: "success", title: "ĐỔI MẬT KHẨU THÀNH CÔNG", html: "Mật khẩu của bạn đã được cập nhật", confirmButtonColor: "#f97316", timer: 1800, timerProgressBar: true });
    } catch (err) {
      setError(err.message || "Đổi mật khẩu thất bại.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => !saving && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
        <div className="space-y-3">
          {[["current","Mật khẩu hiện tại"],["newPass","Mật khẩu mới"],["confirm","Xác nhận mật khẩu"]].map(([field, placeholder]) => (
            <div key={field} className="relative">
              <input type={show[field] ? "text" : "password"} placeholder={placeholder}
                value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                className="w-full h-9 px-3 pr-9 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F26739] focus:ring-2 focus:ring-orange-100" />
              <button type="button" onClick={() => setShow(p => ({ ...p, [field]: !p[field] }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                {show[field] ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
          ))}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} disabled={saving}
            className="flex-1 h-9 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">Hủy</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 h-9 bg-[#F26739] hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {saving ? "Đang lưu..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}