import { NextResponse } from "next/server";

/*
 * Problem:
 * ----------
 * Initially, frontend (Vercel) and backend (Render) were on different domains.
 * Because of this, the browser treated cookies as third-party cookies.
 *
 * Result:
 * - accessToken cookie (set by backend) was NOT sent in requests
 * - Even with withCredentials: true, cookie was blocked
 * - On page refresh, /users/profile returned 401 Unauthorized
 * - Redux state reset → user logged out
 *
 *
 * Solutions Explored:
 * -------------------
 * 1. SameSite=None + Secure cookies
 *    → Required for cross-site cookies
 *    → Still unreliable due to browser restrictions (third-party cookie blocking)
 *
 * 2. Same domain / subdomain setup (frontend + backend)
 *    → Ideal solution (e.g. api.example.com)
 *    → But requires custom domain + deployment changes
 *
 * 3. LocalStorage / Redux persist
 *    → Easy but NOT secure (XSS risk)
 *    → Rejected for production use
 *
 * 4. Client-side auth check only
 *    → Works but causes UI flicker and poor UX
 *
 *
 * Final Solution (Best Approach):
 * -------------------------------
 * Used Next.js rewrites as a proxy layer.
 *
 * Flow:
 * Browser → /api → Next.js (Vercel server) → Backend
 *
 * Benefits:
 * - Requests appear as SAME-ORIGIN to the browser
 * - Cookies are stored as FIRST-PARTY cookies
 * - No third-party cookie blocking
 * - No complex CORS issues
 * - Secure httpOnly cookie works properly
 *
 * Result:
 * - accessToken cookie is now available in middleware
 * - Login state persists after refresh
 * - Server-side route protection is possible
 *
 *
 * Conclusion:
 * ------------
 * Next.js proxy (rewrites) is the most practical and production-friendly
 * solution when frontend and backend are on different domains.
 */

export function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // Public routes
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/api",
    "/",
    "/courses",
  ];

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Check cookie
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/auth/login", request.url);

    const redirectPath = pathname + (search || "");
    loginUrl.searchParams.set("from", redirectPath);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|temp/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|mp4|webm)$).*)",
  ],
};