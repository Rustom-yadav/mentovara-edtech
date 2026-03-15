import axios from "axios";

// Create Axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use(
  (config) => {
    // If sending FormData (file uploads), let browser set Content-Type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
  (response) => {
    // Return the data directly for cleaner usage
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    // Auto-logout on 401 (Unauthorized)
    if (status === 401) {
      // Only redirect if we're in the browser and not already on login page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        // Clear any stored auth state
        window.location.href = "/login";
      }
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors || [],
    });
  }
);

export default api;
