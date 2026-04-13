"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "@/store/slices/courseSlice";

export function useCourses() {
  const dispatch = useDispatch();
  const { courses, pagination, isLoading, error } = useSelector(
    (s) => s.course,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch courses whenever page or query changes
  const loadCourses = useCallback(
    (page = 1) => {
      dispatch(fetchCourses({ page, limit: 12, query: debouncedQuery }));
    },
    [dispatch, debouncedQuery],
  );

  useEffect(() => {
    loadCourses(1);
  }, [loadCourses]);

  return {
    courses,
    pagination,
    isLoading,
    error,
    searchQuery,
    debouncedQuery,
    setSearchQuery,
    loadCourses,
  };
}
