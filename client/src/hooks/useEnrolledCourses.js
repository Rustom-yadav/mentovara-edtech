"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

export function useEnrolledCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEnrolled = useCallback(async () => {
    if (!user?.enrolledCourses?.length) {
      setLoading(false);
      setCourses([]);
      return;
    }
    try {
      setLoading(true);
      const results = await Promise.all(
        user.enrolledCourses.map((id) =>
          api.get(ENDPOINTS.COURSE_BY_ID(id)).then((r) => r.data?.data),
        ),
      );
      setCourses(results.filter(Boolean));
    } catch {
      toast.error("Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  }, [user?.enrolledCourses]);

  useEffect(() => {
    loadEnrolled();
  }, [loadEnrolled]);

  return {
    courses,
    loading,
    refreshEnrolled: loadEnrolled,
  };
}
