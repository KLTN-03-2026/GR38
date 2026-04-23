import axios from "axios";

// Instance chính dùng cho toàn bộ app
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance riêng cho refresh 
const refreshClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

// Queue xử lý các request bị 401 trong lúc refresh

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};


// Helper lấy access token

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

// Helper lấy refresh token

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

// Request Interceptor (gắn token)

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


// Response Interceptor (refresh token)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Không có response hoặc không phải 401
    if (!error.response || error.response.status !== 401) {
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

      // Gọi API refresh (dùng instance riêng)
      const { data } = await refreshClient.post("/auth/refresh-token", {
        refresh_token: refreshToken,
      });

      const newAccessToken = data.access_token;

      // Lưu lại token mới
      localStorage.setItem(
        "token",
        JSON.stringify({
          access_token: newAccessToken,
          refresh_token: data.refresh_token ?? refreshToken,
        })
      );

      // Cập nhật header mặc định
      api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      // Retry request cũ
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh fail → logout
      localStorage.removeItem("token");
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;