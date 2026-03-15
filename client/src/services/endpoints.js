// All backend API endpoints in one place
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const ENDPOINTS = {
  // ========== AUTH ==========
  REGISTER: `${API_URL}/users/register`,
  LOGIN: `${API_URL}/users/login`,
  LOGOUT: `${API_URL}/users/logout`,
  GET_PROFILE: `${API_URL}/users/profile`,
  UPDATE_PROFILE: `${API_URL}/users/update-profile`,

  // ========== COURSES ==========
  GET_COURSES: `${API_URL}/courses`,
  CREATE_COURSE: `${API_URL}/courses`,
  GET_COURSE_BY_ID: (courseId) => `${API_URL}/courses/${courseId}`,
  UPDATE_COURSE: (courseId) => `${API_URL}/courses/${courseId}`,
  DELETE_COURSE: (courseId) => `${API_URL}/courses/${courseId}`,
  ENROLL_COURSE: (courseId) => `${API_URL}/courses/${courseId}/enroll`,

  // ========== SECTIONS ==========
  ADD_SECTION: (courseId) => `${API_URL}/sections/${courseId}`,
  GET_COURSE_SECTIONS: (courseId) => `${API_URL}/sections/course/${courseId}`,
  UPDATE_SECTION: (sectionId) => `${API_URL}/sections/${sectionId}`,
  DELETE_SECTION: (sectionId) => `${API_URL}/sections/${sectionId}`,

  // ========== VIDEOS ==========
  ADD_VIDEO: `${API_URL}/videos`,
  GET_VIDEO: (videoId) => `${API_URL}/videos/${videoId}`,
  DELETE_VIDEO: (videoId) => `${API_URL}/videos/${videoId}`,

  // ========== PROGRESS ==========
  GET_PROGRESS: (courseId) => `${API_URL}/progress/${courseId}`,
  MARK_VIDEO_COMPLETE: `${API_URL}/progress/complete`,

  // ========== HEALTH ==========
  HEALTH: `${API_URL}/health`,
};
