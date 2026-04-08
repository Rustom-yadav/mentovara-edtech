import axios from "axios";
import { API_URL, ENDPOINTS } from "./endpoints";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue = [];

// Queue process karne ka function
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not a retry and not the refresh call itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== ENDPOINTS.REFRESH_TOKEN) {
      
      if (isRefreshing) {
        // Agar pehle se refresh ho raha hai, toh request ko queue mein daal do
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
        
        // Agar response mein naya token mil raha hai (Headers ke liye)
        const newToken = data?.data?.accessToken;
        
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Optional: Yahan user ko logout karwane ka logic daal sakte hain
        // window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Baaki errors ke liye
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", error.response?.status, error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
