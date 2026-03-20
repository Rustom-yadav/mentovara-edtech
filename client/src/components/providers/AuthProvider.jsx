"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
function AuthProviderContent({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      const from = searchParams.get("from") || "/dashboard";
      router.replace(from);
    }
  }, [isAuthenticated, loading, pathname, router]);

  return children;
}

export default function AuthProvider({ children }) {
  return (
    <Suspense fallback={null}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}
