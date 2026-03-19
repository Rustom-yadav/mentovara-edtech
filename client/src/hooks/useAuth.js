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

  // Hydrate session from cookie on app boot
  const checkAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await api.get(ENDPOINTS.PROFILE);
      dispatch(setUser(res.data?.data));
    } catch {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  // Login — backend sets accessToken + refreshToken cookies
  // Response shape: { statusCode, data: { user, accessToken, refreshToken }, message }
  // redirectTo can be used to send user back to the page they came from
  const handleLogin = useCallback(
    async (credentials, redirectTo) => {
      try {
        dispatch(setLoading(true));
        const res = await api.post(ENDPOINTS.LOGIN, credentials);
        const userData = res.data?.data?.user;
        dispatch(loginAction(userData));
        toast.success("Logged in successfully!");
        
        if (redirectTo && typeof redirectTo === "string") {
          router.push(redirectTo);
        } else {
          router.push("/dashboard");
        }
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

  //here we use auto login after registration 
  // because the backend doesn't set cookies on register route, 
  // so we need to call login route to set the cookies and get the user data. 
  // We also handle both FormData and JSON payloads for flexibility.
  // Register response: { statusCode, data: createdUser, message }
  const handleRegister = useCallback(
    async (formData) => {
      try {
        dispatch(setLoading(true));

        // Step 1: Register the user
        await api.post(ENDPOINTS.REGISTER, formData, {
          headers:
            formData instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : {},
        });

        // Step 2: Auto-login since register doesn't set cookies
        const loginCredentials =
          formData instanceof FormData
            ? {
                email: formData.get("email"),
                password: formData.get("password"),
              }
            : { email: formData.email, password: formData.password };

        const loginRes = await api.post(ENDPOINTS.LOGIN, loginCredentials);
        const userData = loginRes.data?.data?.user;
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

  // Logout — backend clears accessToken + refreshToken cookies
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

  // Refresh user data from backend (e.g., after enrolling in a course)
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.PROFILE);
      dispatch(setUser(res.data?.data));
    } catch {
      // silently fail
    }
  }, [dispatch]);

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
    refreshUser,
  };
}
