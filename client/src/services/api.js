import axios from "axios";
import { API_URL } from "./endpoints";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    console.error("[API]", status, message);

    if (status === 401) {
      console.warn("[API] 401 — session may have expired");
    }

    return Promise.reject(error);
  }
);

export default api;
