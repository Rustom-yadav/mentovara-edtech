"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { validateRegisterForm, validateImageFile, toFormData } from "@/utilities";

export function useRegisterForm() {
  const { handleRegister, loading } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileError = validateImageFile(file, 2);
      if (fileError) {
        setError(fileError);
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  function setRole(role) {
    setForm((prev) => ({ ...prev, role }));
  }

  async function onSubmit(e) {
    if (e) e.preventDefault();
    
    // Validate form
    const validationError = validateRegisterForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Convert to FormData if avatar exists, otherwise send as JSON
    const submitData = avatar 
      ? toFormData({ ...form, avatar }) 
      : form;

    const result = await handleRegister(submitData, from);
    if (!result.success) setError(result.message);
  }

  const togglePassword = () => setShowPassword((v) => !v);

  return {
    form,
    loading,
    error,
    showPassword,
    avatarPreview,
    fileInputRef,
    from,
    onChange,
    onSubmit,
    togglePassword,
    handleAvatarChange,
    removeAvatar,
    setRole,
  };
}
