import { NextRequest, NextResponse } from "next/server";

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const exp = payload.exp as number | undefined;
  if (!exp || exp * 1000 < Date.now()) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = payload.role as string | undefined;
  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/dashboard/nasabah") && role !== "NASABAH") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
    if (role === "NASABAH") {
      return NextResponse.redirect(new URL("/dashboard/nasabah", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
