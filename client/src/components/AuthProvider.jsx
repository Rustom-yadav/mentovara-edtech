"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Runs once on mount to check the existing session cookie with the backend.
 * Wrap inside StoreProvider so Redux is available.
 */
export default function AuthProvider({ children }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return children;
}
