import { NextResponse } from "next/server";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil",
    data: null,
  });

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
