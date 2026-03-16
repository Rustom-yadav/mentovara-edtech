// Single source of truth for the backend base URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// All backend API endpoint paths (relative to API_URL)
export const ENDPOINTS = {
  // Auth / Users
  REGISTER: "/users/register",
  LOGIN: "/users/login",
  LOGOUT: "/users/logout",
  PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/update-profile",

  // Courses
  COURSES: "/courses",
  COURSE_BY_ID: (id) => `/courses/${id}`,
  ENROLL: (id) => `/courses/${id}/enroll`,

  // Sections
  ADD_SECTION: (courseId) => `/sections/${courseId}`,
  COURSE_SECTIONS: (courseId) => `/sections/course/${courseId}`,
  SECTION_BY_ID: (sectionId) => `/sections/${sectionId}`,

  // Videos
  VIDEOS: "/videos",
  VIDEO_BY_ID: (id) => `/videos/${id}`,

  // Progress
  PROGRESS: (courseId) => `/progress/${courseId}`,
  MARK_COMPLETE: "/progress/complete",

  // Health
  HEALTH: "/health",
};
