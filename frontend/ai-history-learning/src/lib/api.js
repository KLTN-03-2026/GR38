import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL });
const refreshClient = axios.create({ baseURL }); 

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 3. Tối ưu hàm lấy và parse token an toàn
const getAuthData = () => {
  try {
    const raw = localStorage.getItem("token");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Lỗi parse token từ localStorage", error);
    return null;
  }
};

const getAccessToken = () => getAuthData()?.access_token || null;
const getRefreshToken = () => getAuthData()?.refresh_token || null;

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

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

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
      
      // Lưu token mới vào localStorage
      localStorage.setItem(
        "token",
        JSON.stringify({
          access_token: newAccessToken,
          refresh_token: data.refresh_token ?? refreshToken,
        })
      );

      // Cập nhật lại header cho request bị lỗi và gọi lại
      api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      
      processQueue(null, newAccessToken);
      
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // 2. Chỉnh sửa logic điều hướng: 
      // Do hệ thống không có khách vãng lai, trang chủ "/" cũng cần xác thực
      const isOnAuthPage = 
        window.location.pathname === "/login" || 
        window.location.pathname === "/register";

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