import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để lưu promise refresh token (tránh gọi nhiều lần đồng thời)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ─────────────────────────────────────────────
// Request Interceptor - Thêm token vào header
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem("token");

    if (rawToken) {
      let tokenToUse = rawToken;
      try {
        const parsed = JSON.parse(rawToken);
        if (parsed && parsed.access_token) {
          tokenToUse = parsed.access_token;
        }
      } catch {
        // rawToken là string thuần, dùng trực tiếp
      }
      config.headers["Authorization"] = `Bearer ${tokenToUse}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// Response Interceptor - Xử lý refresh token
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh → đưa request vào hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rawToken = localStorage.getItem("token");
        const parsed = JSON.parse(rawToken);
        const refreshToken = parsed?.refresh_token;

        const { data } = await axios.post(
          "http://localhost:8000/api/v1/auth/refresh-token",
          { refresh_token: refreshToken }
        );

        const newToken = data.access_token;

        // Cập nhật token mới vào localStorage
        localStorage.setItem(
          "token",
          JSON.stringify({
            access_token: newToken,
            refresh_token: data.refresh_token ?? refreshToken,
          })
        );

        api.defaults.headers["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh thất bại → đăng xuất
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;