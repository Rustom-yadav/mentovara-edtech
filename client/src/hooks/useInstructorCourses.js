"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { isCourseOwner } from "@/utilities";

export function useInstructorCourses() {
  const { user, isInstructor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyCourses = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.COURSES, {
        params: { page: 1, limit: 100 },
      });
      const allCourses = res.data?.data?.docs || [];
      const mine = allCourses.filter((c) => isCourseOwner(c, user._id));
      setCourses(mine);
    } catch (err) {
      if (err?.response?.status !== 404) {
        toast.error("Failed to load your courses");
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadMyCourses();
  }, [loadMyCourses]);

  async function handleDelete(courseId) {
    if (!confirm("Are you sure? This will permanently delete the course and all its content."))
      return;
    try {
      await api.delete(ENDPOINTS.COURSE_BY_ID(courseId));
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success("Course deleted");
    } catch {
      toast.error("Failed to delete course");
    }
  }

  return {
    courses,
    loading,
    isInstructor,
    handleDelete,
    refreshCourses: loadMyCourses,
  };
}
