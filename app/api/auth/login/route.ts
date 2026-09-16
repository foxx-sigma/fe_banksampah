import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/lib/api-client";
import type { LoginResponseData } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await apiPost<LoginResponseData>("/api/v1/auth/login", body);

    const token = result.data.accessToken || result.data.token;
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: result.message,
      data: result.data.user,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 jam
    });

    return response;
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat login";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
