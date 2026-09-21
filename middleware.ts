import { NextRequest, NextResponse } from "next/server";

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function clearAuthAndRedirectLogin(req: NextRequest): NextResponse {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete("auth_token");
  res.cookies.delete("accessToken");
  return res;
}

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("auth_token")?.value ||
    req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    if (token) {
      const payload = parseJwtPayload(token);
      const exp = payload?.exp as number | undefined;
      const role = payload?.role as string | undefined;

      if (payload && exp && exp * 1000 >= Date.now() && role) {
        if (role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        }
        if (role === "NASABAH") {
          return NextResponse.redirect(new URL("/dashboard/nasabah", req.url));
        }
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return clearAuthAndRedirectLogin(req);
  }

  const exp = payload.exp as number | undefined;
  if (!exp || exp * 1000 < Date.now()) {
    return clearAuthAndRedirectLogin(req);
  }

  const role = payload.role as string | undefined;
  if (!role) {
    return clearAuthAndRedirectLogin(req);
  }

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    if (role === "NASABAH") {
      return NextResponse.redirect(new URL("/dashboard/nasabah", req.url));
    }
    return clearAuthAndRedirectLogin(req);
  }

  if (pathname.startsWith("/dashboard/nasabah") && role !== "NASABAH") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
    return clearAuthAndRedirectLogin(req);
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
    if (role === "NASABAH") {
      return NextResponse.redirect(new URL("/dashboard/nasabah", req.url));
    }
    return clearAuthAndRedirectLogin(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
