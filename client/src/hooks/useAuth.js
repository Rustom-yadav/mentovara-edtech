"use client";

import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import {
  login as loginAction,
  logout as logoutAction,
  setUser,
  setLoading,
} from "@/store/slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSelector((s) => s.auth);

  // Hydrate session on app boot
  const checkAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await api.get(ENDPOINTS.PROFILE);
      dispatch(setUser(res.data?.data || res.data));
    } catch {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  // Login
  const handleLogin = useCallback(
    async (credentials) => {
      try {
        dispatch(setLoading(true));
        const res = await api.post(ENDPOINTS.LOGIN, credentials);
        const userData = res.data?.data?.user || res.data?.data || res.data;
        dispatch(loginAction(userData));
        toast.success("Logged in successfully!");
        router.push("/dashboard");
        return { success: true };
      } catch (err) {
        dispatch(setLoading(false));
        const msg =
          err?.response?.data?.message || "Login failed. Please try again.";
        toast.error(msg);
        return { success: false, message: msg };
      }
    },
    [dispatch, router]
  );

  // Register
  const handleRegister = useCallback(
    async (formData) => {
      try {
        dispatch(setLoading(true));
        const res = await api.post(ENDPOINTS.REGISTER, formData, {
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
        const msg =
          err?.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(msg);
        return { success: false, message: msg };
      }
    },
    [dispatch, router]
  );

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch {
      // clear client state regardless
    } finally {
      dispatch(logoutAction());
      toast.success("Logged out");
      router.push("/");
    }
  }, [dispatch, router]);

  return {
    user,
    isAuthenticated,
    loading,
    isInstructor: user?.role === "instructor",
    isStudent: user?.role === "student",
    checkAuth,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}
