"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { validateLoginForm } from "@/utilities";

export function useLoginForm() {
  const { handleLogin, loading } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  async function onSubmit(e) {
    if (e) e.preventDefault();
    
    // Validate form
    const validationError = validateLoginForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await handleLogin(form, from);
    if (!result.success) setError(result.message);
  }

  const togglePassword = () => setShowPassword((v) => !v);

  return {
    form,
    loading,
    error,
    showPassword,
    from,
    onChange,
    onSubmit,
    togglePassword,
  };
}
