"use client";

import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import {
  login as loginAction,
  logout as logoutAction,
  setUser,
  setLoading,
} from "@/store/slices/authSlice";

/**
 * Central auth hook — exposes state + actions for login, register, logout, etc.
 * Usage: const { user, isAuthenticated, handleLogin, ... } = useAuth();
 */
export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  // Fetch current session from backend on app boot
  const checkAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await api.get("/users/profile");
      dispatch(setUser(res.data?.data || res.data));
    } catch {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  // Login with email/username + password
  const handleLogin = useCallback(
    async (credentials) => {
      try {
        dispatch(setLoading(true));
        const res = await api.post("/users/login", credentials);
        const userData = res.data?.data?.user || res.data?.data || res.data;
        dispatch(loginAction(userData));
        toast.success("Logged in successfully!");
        router.push("/dashboard");
        return { success: true };
      } catch (err) {
        dispatch(setLoading(false));
        const message =
          err?.response?.data?.message || "Login failed. Please try again.";
        toast.error(message);
        return { success: false, message };
      }
    },
    [dispatch, router]
  );

  // Register a new account
  const handleRegister = useCallback(
    async (formData) => {
      try {
        dispatch(setLoading(true));
        const res = await api.post("/users/register", formData, {
          headers:
            formData instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : {},
        });
        const userData = res.data?.data || res.data;
        dispatch(loginAction(userData));
        toast.success("Account created successfully!");
        router.push("/dashboard");
        return { success: true };
      } catch (err) {
        dispatch(setLoading(false));
        const message =
          err?.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(message);
        return { success: false, message };
      }
    },
    [dispatch, router]
  );

  // Logout and redirect to home
  const handleLogout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch {
      // Even if the server call fails, clear client state
    } finally {
      dispatch(logoutAction());
      toast.success("Logged out");
      router.push("/");
    }
  }, [dispatch, router]);

  // Derived convenience flags
  const isInstructor = user?.role === "instructor";
  const isStudent = user?.role === "student";

  return {
    user,
    isAuthenticated,
    loading,
    isInstructor,
    isStudent,
    checkAuth,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}
