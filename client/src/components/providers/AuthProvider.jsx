"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const PROTECTED_PREFIXES = ["/dashboard", "/watch"];

function isProtectedPath(pathname) {
  if (!pathname) return false;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * 1) On mount, check session with backend (cookie is sent to API only).
 * 2) After check finishes, if user is on a protected route and not logged in,
 *    redirect to login (client-side auth guard).
 */
export default function AuthProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect to login if on protected route and not authenticated (after checkAuth done)
  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) return;
    if (!isProtectedPath(pathname)) return;
    router.replace(`/auth/login?from=${encodeURIComponent(pathname)}`);
  }, [loading, isAuthenticated, pathname, router]);

  // Redirect to dashboard if logged in and on login/register page
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    if (pathname === "/auth/login" || pathname === "/auth/register") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, pathname, router]);

  return children;
}
