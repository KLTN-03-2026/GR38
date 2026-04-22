export const getAuthHeader = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return {};
  try {
    const token = JSON.parse(raw).access_token ?? raw;
    return { Authorization: `Bearer ${token}` };
  } catch {
    return { Authorization: `Bearer ${raw}` };
  }
};