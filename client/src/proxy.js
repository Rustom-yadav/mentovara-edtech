import { NextResponse } from "next/server";

/**
 * Proxy runs on Vercel server. By default, browsers only send cookies
 * for the current domain. When frontend is on Vercel 
 * and backend is on Render , the accessToken cookie
 * (set by backend) is NOT sent to Vercel in proxy requests.
 *
 * Currently, we cannot reliably check auth in proxy because the cookie is missing.
 * We let all matched routes through (NextResponse.next()).
 *
 * Authentication is enforced client-side via checkAuth() which calls the backend API
 * (with withCredentials: true), so the cookie is sent to the backend domain correctly.
 *
 * Future improvement:
 * - Use SameSite=None + Secure + domain=.yourdomain.com on cookie (requires custom domain)
 * - Or move frontend + backend under same root domain/subdomain
 * - Or add a client-side redirect + loading guard on protected pages
 * - or we can send a cookie from the frontend to the browser like document.cookie = "proxyToken=123" and read it in the proxy, but this is a bit hacky and not recommended for production
 */
export function proxy(_req) {
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
