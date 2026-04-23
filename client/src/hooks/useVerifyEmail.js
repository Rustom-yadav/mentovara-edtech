"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useVerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleVerifyEmail, handleResendVerification, loading } = useAuth();
  
  const initialEmail = searchParams.get("email") || "";
  const from = searchParams.get("from");

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !otp) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    const result = await handleVerifyEmail(email, otp);
    if (result.success) {
      router.push(`/auth/login${from ? `?from=${encodeURIComponent(from)}` : ""}`);
    }
  };

  const onResend = useCallback(async () => {
    if (!email) {
      setError("Please enter your email to resend the code.");
      return;
    }
    setError("");
    const result = await handleResendVerification(email);
    if (result.success) {
      setResendCooldown(60); // 1 minute cooldown
    }
  }, [email, handleResendVerification]);

  return {
    email,
    otp,
    error,
    resendCooldown,
    loading,
    initialEmail,
    from,
    setEmail,
    setOtp,
    onSubmit,
    onResend,
  };
}
