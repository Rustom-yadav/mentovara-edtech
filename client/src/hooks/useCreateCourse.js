"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toFormData } from "@/utilities";

export function useCreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    isPublished: false,
  });
  const [thumbnail, setThumbnail] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onThumbnailChange = (e) => {
    setThumbnail(e.target.files?.[0] || null);
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const fd = toFormData({ ...form, thumbnail });

      const res = await api.post(ENDPOINTS.COURSES, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const courseId = res.data?.data?._id;
      toast.success("Course created!");
      router.push(
        courseId
          ? `/dashboard/courses/${courseId}/manage`
          : "/dashboard/courses"
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    thumbnail,
    onChange,
    onThumbnailChange,
    onSubmit,
    router,
  };
}
