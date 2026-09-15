import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { UserProfile } from "@/types/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  try {
    const result = await apiGet<UserProfile>("/api/v1/auth/me", {
      Authorization: `Bearer ${token}`,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengambil data pengguna";

    if (status === 401) {
      const response = NextResponse.json(
        { success: false, message, data: null },
        { status: 401 },
      );
      response.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
