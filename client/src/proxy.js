import { NextResponse } from "next/server";

// Routes that require an authenticated user
const PROTECTED_PREFIXES = ["/dashboard", "/watch"];

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Cookie name set by the backend after login
const AUTH_COOKIE = "accessToken";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isAuthRoute =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname.startsWith("/auth/login/") ||
    pathname.startsWith("/auth/register/");

  // Protected route without token → redirect to login
  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged-in user visiting auth pages → redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/watch/:path*",
    "/auth/login/:path*",
    "/auth/register/:path*",
  ],
};
