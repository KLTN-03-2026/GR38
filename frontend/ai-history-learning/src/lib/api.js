import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const getAccessToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.access_token || raw;
  } catch {
    return raw;
  }
};

const getRefreshToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.refresh_token;
  } catch {
    return null;
  }
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Không có response hoặc không phải 401 → trả lỗi thẳng
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // ✅ FIX: Các route public (login, register) không cần refresh token
    // Nếu chính request login/register bị 401 thì trả lỗi luôn, không refresh
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // Tránh loop vô hạn
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Nếu đang refresh → đưa vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const { data } = await refreshClient.post("/auth/refresh-token", {
        refresh_token: refreshToken,
      });

      const newAccessToken = data.access_token;

      localStorage.setItem(
        "token",
        JSON.stringify({
          access_token: newAccessToken,
          refresh_token: data.refresh_token ?? refreshToken,
        })
      );

      api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Không redirect nếu đang ở trang login/register
      const isOnAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/";

      if (!isOnAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;