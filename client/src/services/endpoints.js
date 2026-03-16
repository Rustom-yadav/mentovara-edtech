// Base URL for all backend API calls
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Central registry of REST endpoints used by the frontend
export const ENDPOINTS = {
  // ==== AUTH ====
  AUTH_LOGIN: `${API_URL}/auth/login`,
  AUTH_REGISTER: `${API_URL}/auth/register`,
  AUTH_ME: `${API_URL}/auth/me`,
  AUTH_LOGOUT: `${API_URL}/auth/logout`,

  // Example course endpoints (can be extended later)
  COURSES_LIST: `${API_URL}/courses`,
  COURSE_DETAIL: (courseId) => `${API_URL}/courses/${courseId}`,
};

// Export base URL separately for rare custom usage
export { API_URL };
