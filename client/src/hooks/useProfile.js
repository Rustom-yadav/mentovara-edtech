"use client";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { setUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { toFormData } from "@/utilities";

export function useProfile() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const fd = toFormData({
        fullName: fullName.trim(),
        avatar: avatar, // will only be appended if exists
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
