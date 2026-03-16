import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

// Fetch published courses (paginated + searchable)
// Backend throws 404 when no courses match — we return empty pagination
export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  async ({ page = 1, limit = 12, query = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (query) params.append("query", query);
      const res = await api.get(`${ENDPOINTS.COURSES}?${params}`);
      return res.data?.data;
    } catch (err) {
      if (err?.response?.status === 404) {
        return { docs: [], page: 1, totalPages: 0, totalDocs: 0, hasNextPage: false, hasPrevPage: false };
      }
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

// Fetch a single course by ID (includes instructor + sections)
export const fetchCourseById = createAsyncThunk(
  "course/fetchCourseById",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await api.get(ENDPOINTS.COURSE_BY_ID(courseId));
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch course"
      );
    }
  }
);

// Create a course (instructor only, supports FormData for thumbnail)
export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post(ENDPOINTS.COURSES, formData, {
        headers:
          formData instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : {},
      });
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create course"
      );
    }
  }
);

// Update a course (instructor only)
export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async ({ courseId, formData }, { rejectWithValue }) => {
    try {
      const res = await api.patch(ENDPOINTS.COURSE_BY_ID(courseId), formData, {
        headers:
          formData instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : {},
      });
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update course"
      );
    }
  }
);

// Delete a course (instructor only, cascade deletes sections + videos)
export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(ENDPOINTS.COURSE_BY_ID(courseId));
      return courseId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete course"
      );
    }
  }
);

// Enroll in a course
export const enrollInCourse = createAsyncThunk(
  "course/enrollInCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      await api.post(ENDPOINTS.ENROLL(courseId));
      return courseId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to enroll"
      );
    }
  }
);

// Fetch sections (with populated videos) for a course
// Backend throws 404 when no sections exist — we treat that as an empty array
export const fetchCourseSections = createAsyncThunk(
  "course/fetchCourseSections",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await api.get(ENDPOINTS.COURSE_SECTIONS(courseId));
      return res.data?.data || [];
    } catch (err) {
      if (err?.response?.status === 404) return [];
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sections"
      );
    }
  }
);

const initialState = {
  courses: [],
  currentCourse: null,
  sections: [],
  pagination: {
    page: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    clearCourseError(state) {
      state.error = null;
    },
    clearCurrentCourse(state) {
      state.currentCourse = null;
      state.sections = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload?.docs || [];
        state.pagination = {
          page: action.payload?.page || 1,
          totalPages: action.payload?.totalPages || 1,
          totalDocs: action.payload?.totalDocs || 0,
          hasNextPage: action.payload?.hasNextPage || false,
          hasPrevPage: action.payload?.hasPrevPage || false,
        };
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.courses = [];
      })

      // Fetch Course By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.courses.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Course
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
        const idx = state.courses.findIndex(
          (c) => c._id === action.payload?._id
        );
        if (idx !== -1) state.courses[idx] = action.payload;
      })

      // Delete Course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter((c) => c._id !== action.payload);
        if (state.currentCourse?._id === action.payload) {
          state.currentCourse = null;
        }
      })

      // Enroll
      .addCase(enrollInCourse.fulfilled, (state) => {
        state.isLoading = false;
        if (state.currentCourse) {
          state.currentCourse.enrolledStudents =
            (state.currentCourse.enrolledStudents || 0) + 1;
        }
      })

      // Fetch Sections
      .addCase(fetchCourseSections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourseSections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload || [];
      })
      .addCase(fetchCourseSections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCourseError, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
