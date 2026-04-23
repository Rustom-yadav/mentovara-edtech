"use client";

import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { setUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { toFormData, validateProfileForm } from "@/utilities";

export function useProfile() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sync fullName when user loads after initial render (e.g., slow auth)
  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user?.fullName]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const validationError = validateProfileForm({ fullName });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const fd = toFormData({
        fullName: fullName.trim(),
        avatar: avatar,
      });

      const res = await api.patch(ENDPOINTS.UPDATE_PROFILE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const updatedUser = res.data?.data;
      dispatch(setUser(updatedUser));
      toast.success("Profile updated!");
      
      setAvatar(null);
      setPreview(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    fullName,
    avatar,
    preview,
    saving,
    setFullName,
    handleAvatarChange,
    handleSave,
  };
}
