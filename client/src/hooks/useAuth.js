"use client";

import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  clearAuth,
  clearError,
} from "@/store/slices/authSlice";

/**
 * Custom hook for authentication — provides auth state + dispatched actions.
 * Usage: const { user, isAuthenticated, login, logout, ... } = useAuth();
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const login = useCallback(
    (credentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  const register = useCallback(
    (formData) => dispatch(registerUser(formData)),
    [dispatch]
  );

  const logout = useCallback(
    () => dispatch(logoutUser()),
    [dispatch]
  );

  const fetchCurrentUser = useCallback(
    () => dispatch(getCurrentUser()),
    [dispatch]
  );

  const editProfile = useCallback(
    (formData) => dispatch(updateProfile(formData)),
    [dispatch]
  );

  const resetAuth = useCallback(
    () => dispatch(clearAuth()),
    [dispatch]
  );

  const resetError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  // Derived state
  const isInstructor = user?.role === "instructor";
  const isStudent = user?.role === "student";

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    isInstructor,
    isStudent,

    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    editProfile,
    resetAuth,
    resetError,
  };
}
