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
  setAccessToken,
  setLoading,
} from "@/store/slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, accessToken } = useSelector((s) => s.auth);

  // Hydrate session from cookie on app boot
  const checkAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await api.get(ENDPOINTS.PROFILE);
      const data = res.data?.data;
      // Profile now returns { user, accessToken }
      dispatch(setUser(data?.user ?? data));
      if (data?.accessToken) {
        dispatch(setAccessToken(data.accessToken));
      }
    } catch {
      dispatch(logoutAction());
    } finally {
      dispatch(setLoading(false));
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

        // Check if server returned 403 (email not verified)
        if (res.data?.data?.isEmailVerified === false) {
          const userEmail = res.data.data.email;
          toast.error("Please verify your email first.");
          let verifyUrl = `/auth/verify-email?email=${encodeURIComponent(userEmail)}`;
          if (redirectTo && typeof redirectTo === "string") {
            verifyUrl += `&from=${redirectTo}`;
          }
          router.push(verifyUrl);
          return { success: false, message: res.data?.message };
        }

        const userData = res.data?.data?.user;
        const token = res.data?.data?.accessToken;
        dispatch(loginAction({ user: userData, accessToken: token }));
        toast.success("Logged in successfully!");
        
        if (redirectTo && typeof redirectTo === "string") {
          router.push(redirectTo);
        } else {
          router.push("/dashboard");
        }
        return { success: true };
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const msg = data?.message || "Login failed. Please try again.";

        // Also handle 403 from error responses (email not verified)
        if (status === 403 && data?.data?.isEmailVerified === false) {
          const userEmail = data.data.email;
          toast.error("Please verify your email first.");
          let verifyUrl = `/auth/verify-email?email=${encodeURIComponent(userEmail)}`;
          if (redirectTo && typeof redirectTo === "string") {
            verifyUrl += `&from=${redirectTo}`;
          }
          router.push(verifyUrl);
          return { success: false, message: msg };
        }

        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, router]
  );

  // Handle registration and then redirect to the login page.
  // We also handle both FormData and JSON payloads for flexibility.
  // Register response: { statusCode, data: createdUser, message }
  const handleRegister = useCallback(
    async (formData, redirectTo) => {
      try {
        dispatch(setLoading(true));

        // Step 1: Register the user
        await api.post(ENDPOINTS.REGISTER, formData, {
          headers:
            formData instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : {},
        });

        toast.success("Account created successfully! Please verify your email.");
        
        const userEmail = formData instanceof FormData ? formData.get("email") : formData.email;
        let verifyUrl = `/auth/verify-email?email=${encodeURIComponent(userEmail)}`;
        
        if (redirectTo && typeof redirectTo === "string") {
          verifyUrl += `&from=${redirectTo}`;
        }
        router.push(verifyUrl);

        return { success: true };
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        dispatch(setLoading(false));
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

  // Verify email using OTP
  const handleVerifyEmail = useCallback(async (email, otp) => {
    try {
      dispatch(setLoading(true));
      await api.post(ENDPOINTS.VERIFY_EMAIL, { email, otp });
      toast.success("Email verified successfully! Please log in.");
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Verification failed. Please try again.";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Resend verification email
  const handleResendVerification = useCallback(async (email) => {
    try {
      await api.post(ENDPOINTS.RESEND_VERIFICATION, { email });
      toast.success("Verification email sent!");
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to resend email.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  // Refresh user data from backend (e.g., after enrolling in a course)
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.PROFILE);
      const data = res.data?.data;
      dispatch(setUser(data?.user ?? data));
    } catch {
      // silently fail
    }
  }, [dispatch]);

  return {
    user,
    accessToken,
    isAuthenticated,
    loading,
    isInstructor: user?.role === "instructor",
    isStudent: user?.role === "student",
    checkAuth,
    handleLogin,
    handleRegister,
    handleLogout,
    refreshUser,
    handleVerifyEmail,
    handleResendVerification,
  };
}
