import { createSlice } from "@reduxjs/toolkit";

// Initial auth state that matches the requested shape
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

// Simple synchronous reducers for auth; async logic will dispatch these
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set user data and mark the session as authenticated
    login(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    // Clear all user info and mark as logged out
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    // Update user (e.g., from `/auth/me`) and infer auth flag
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    // Explicitly toggle loading state (useful around initial checks)
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { login, logout, setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;

