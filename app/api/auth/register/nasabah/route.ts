import { NextRequest, NextResponse } from "next/server";
import { apiPost } from "@/lib/api-client";
import type { UserProfile } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const backendFormData = new FormData();

    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const result = await apiPost<UserProfile>(
      "/api/v1/auth/nasabah/register",
      backendFormData,
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
        : "Terjadi kesalahan saat registrasi nasabah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
