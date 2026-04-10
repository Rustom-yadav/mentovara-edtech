import { createSlice } from "@reduxjs/toolkit";

// Initial auth state that matches the requested shape
const initialState = {
  user: null,
  accessToken: null,
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
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken || null;
      state.isAuthenticated = true;
      state.loading = false;
    },
    // Clear all user info and mark as logged out
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    // Update user (e.g., from `/auth/me`) and infer auth flag
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    // Store a fresh access token (e.g., after token refresh)
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    // Explicitly toggle loading state (useful around initial checks)
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { login, logout, setUser, setAccessToken, setLoading } = authSlice.actions;
export default authSlice.reducer;
