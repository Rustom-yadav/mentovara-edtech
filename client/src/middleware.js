import { NextResponse } from "next/server";

// Routes that require an authenticated user
const PROTECTED_PREFIXES = ["/dashboard", "/watch"];

// Simple helper to see if a path starts with any protected prefix
function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Name of the auth cookie to check; should be set by your backend
const AUTH_COOKIE_NAME = "accessToken";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isAuthRoute =
    pathname === "/auth/login" || pathname.startsWith("/auth/login/");

  // If the route is protected and there is no auth token, redirect to login
  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and tries to visit the login page, send them to dashboard
  if (isAuthRoute && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Otherwise, allow the request as-is
  return NextResponse.next();
}

// Limit middleware to relevant routes for better performance
export const config = {
  matcher: ["/dashboard/:path*", "/watch/:path*", "/auth/login/:path*"],
};

