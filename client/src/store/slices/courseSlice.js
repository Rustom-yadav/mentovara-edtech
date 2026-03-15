import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

// ========== ASYNC THUNKS ==========

// Get all courses (public — paginated, searchable)
export const getCourses = createAsyncThunk(
  "course/getCourses",
  async ({ page = 1, limit = 10, query = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (query) params.append("query", query);

      const response = await api.get(`/courses?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch courses");
    }
  }
);

// Get a single course by ID
export const getCourseById = createAsyncThunk(
  "course/getCourseById",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch course");
    }
  }
);

// Create a course (instructor only)
export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/courses", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create course");
    }
  }
);

// Update a course (instructor only)
export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async ({ courseId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/courses/${courseId}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update course");
    }
  }
);

// Delete a course (instructor only)
export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete course");
    }
  }
);

// Enroll in a course
export const enrollInCourse = createAsyncThunk(
  "course/enrollInCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`);
      return { courseId, message: response.message };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to enroll");
    }
  }
);

// ========== SLICE ==========

const initialState = {
  courses: [],          // Course listing
  currentCourse: null,  // Single course details
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
    clearCourseError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Get Courses =====
      .addCase(getCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.docs;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          totalDocs: action.payload.totalDocs,
          hasNextPage: action.payload.hasNextPage,
          hasPrevPage: action.payload.hasPrevPage,
        };
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== Get Course By ID =====
      .addCase(getCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== Create Course =====
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== Update Course =====
      .addCase(updateCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
        const index = state.courses.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== Delete Course =====
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter(
          (c) => c._id !== action.payload
        );
        if (state.currentCourse?._id === action.payload) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== Enroll =====
      .addCase(enrollInCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCourseError, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
