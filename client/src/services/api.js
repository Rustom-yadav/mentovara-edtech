import axios from "axios";
import { API_URL, ENDPOINTS } from "./endpoints";
import { store } from "@/store/store";
import { setAccessToken } from "@/store/slices/authSlice";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // 60 seconds default (was 30s — too short for Cloudinary ops)
});

let isRefreshing = false;
let failedQueue = [];

// Queue process  function
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

// ── Request Interceptor ──
// File uploads (FormData) → timeout OFF (backend pe rely karo)
// Normal requests → 60 sec timeout (safety net if server is dead)
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.timeout = 0; // No timeout — wait for backend response
  }

  // Inject Bearer Token from Redux state for every request
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response Interceptor ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not a retry and not the refresh call itself
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      originalRequest.url !== ENDPOINTS.REFRESH_TOKEN &&
      originalRequest.url !== ENDPOINTS.PROFILE // Guest user on boot: profile fails, don't hammer with refresh
    ) {
      
      if (isRefreshing) {
        // if already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token call (Directly use axios to avoid interceptor loop)
        const { data } = await axios.post(`${API_URL}${ENDPOINTS.REFRESH_TOKEN}`, {}, { withCredentials: true });
        
        // Store the new access token in Redux for direct backend requests
        const newToken = data?.data?.accessToken;
        if (newToken) {
          store.dispatch(setAccessToken(newToken));
        }
        
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Optional: Yahan user ko logout karwane ka logic daal sakte hain
        // window.location.href = '/login'; causes infinite loop so we don't do it here
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log unexpected errors in development (skip 401/403 — handled explicitly)
    if (process.env.NODE_ENV === "development" && ![401, 403].includes(error.response?.status)) {
      console.error("[API Error]", error.response?.status, error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
