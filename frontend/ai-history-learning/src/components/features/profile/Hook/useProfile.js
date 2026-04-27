import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const BASE_URL = "/api/v1/auth";

export function getToken() {
  try {
    const tokenObj = JSON.parse(localStorage.getItem("token") || "{}");
    if (tokenObj.access_token) return tokenObj.access_token;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.access_token ?? user.accessToken ?? user.token ?? "";
  } catch { return ""; }
}

export function useProfile() {
  const [savedName, setSavedName] = useState("");
  const [form, setForm]           = useState({ fullName: "", email: "", role: "" });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError]   = useState("");
  const [avatarUrl, setAvatarUrl]   = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setFetchError("");
      try {
        const token = getToken();
        if (!token) throw new Error("Không tìm thấy token.");

        const res = await fetch(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) throw new Error(`Server lỗi (${res.status})`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const data = json.data ?? json;

        const fullName = data.fullName ?? "";
        setForm({ fullName, email: data.email ?? "", role: data.role ?? "" });
        setSavedName(fullName);

        const avatar = data.avatar ?? data.profileImage ?? data.avatarUrl ?? null;
        if (avatar) setAvatarUrl(avatar);

      } catch (err) {
        setFetchError(err.message || "Không thể tải thông tin.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (avatarFile, avatarBlob, setAvatarUrl, setAvatarFile, setAvatarBlob) => {
  setSaving(true);
  setSaveError("");
  try {
    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    if (avatarFile) {
      formData.append("avatar", avatarFile); // key "avatar" tùy theo BE
    }

    const res = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        // KHÔNG set Content-Type — để browser tự set boundary cho FormData
      },
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

    const updated = json.data ?? json;
    const newName   = updated.fullName ?? form.fullName;
    const newEmail  = updated.email ?? form.email;
    const newAvatar = updated.profileImage ?? updated.avatar ?? updated.avatarUrl ?? avatarBlob ?? avatarUrl;

    setForm(p => ({ ...p, fullName: newName, email: newEmail }));
    setSavedName(newName);
    if (newAvatar) setAvatarUrl(newAvatar);

    // Reset avatar file sau khi lưu xong
    if (setAvatarFile) setAvatarFile(null);
    if (setAvatarBlob) setAvatarBlob(null);

    // Sync localStorage
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({
      ...stored,
      fullName: newName,
      email: newEmail,
      profileImage: newAvatar,
    }));
    window.dispatchEvent(new Event("user-update"));

    await Swal.fire({
      icon: "success",
      title: "CẬP NHẬT THÀNH CÔNG",
      html: "Thông tin tài khoản đã được lưu",
      confirmButtonColor: "#f97316",
      timer: 1800,
      timerProgressBar: true,
    });
  } catch (err) {
    setSaveError(err.message || "Lưu thất bại. Vui lòng thử lại.");
  } finally {
    setSaving(false);
  }
};
  return {
    savedName, form, setForm,
    loading, saving,
    fetchError, saveError,
    avatarUrl, setAvatarUrl,
    handleSubmit,
  };
}