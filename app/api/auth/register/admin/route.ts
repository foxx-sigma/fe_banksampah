import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/lib/api-client";
import type { UserProfile } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await apiPost<UserProfile>(
      "/api/v1/auth/admin/register",
      body,
    );

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
        : "Terjadi kesalahan saat registrasi admin";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
