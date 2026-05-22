import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { isAdmin, canViewAnalytics } from "@/lib/roles";

export default async function middleware(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = new URL(req.url);

  const isLoggedIn = !!token;
  const role = token?.role || "";

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return;
  }

  if (!isLoggedIn) {
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return;
  }

  if (
    (pathname === "/admin" && role !== "OWNER") ||
    (pathname.startsWith("/admin/games") && !isAdmin(role)) ||
    (pathname.startsWith("/admin/analytics") && !canViewAnalytics(role)) ||
    (pathname.startsWith("/admin") && pathname !== "/admin" && !pathname.startsWith("/admin/games") && !pathname.startsWith("/admin/analytics") && role !== "OWNER")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/login", "/register"],
};
