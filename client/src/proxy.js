import { NextResponse } from "next/server";

/**
 * Proxy runs on the server (e.g. Vercel). The browser only sends cookies
 * for the current domain. So when frontend is on Vercel and backend on Render, the accessToken cookie (set by backend) is NOT sent to Vercel. This
 * the accessToken cookie (set by backend) is NEVER sent to Vercel — so we
 * cannot reliably check auth here. We let all routes through; auth is
 * enforced client-side after checkAuth() runs (which calls the API and
 * gets the cookie sent to the backend).
 */
export function proxy(request) {
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
