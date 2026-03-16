import axios from "axios";
import { API_URL } from "./endpoints";

// Shared Axios instance for the entire app
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ensure cookies (auth) are always sent
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Response interceptor to normalize success and log errors
api.interceptors.response.use(
  (response) => response, // return raw response; callers can read `response.data`
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    // Helpful logging during development and debugging
    // eslint-disable-next-line no-console
    console.error("[API ERROR]", { status, message, error });

    // Special handling for unauthorized errors
    if (status === 401) {
      // You can hook in Redux logout or router redirects from components
      // eslint-disable-next-line no-console
      console.warn("[API] 401 Unauthorized detected");
    }

    return Promise.reject(error);
  }
);

export default api;
