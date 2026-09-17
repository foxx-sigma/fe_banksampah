import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const backendRes = await fetch(`${BASE_URL}/api/v1/kategori-sampah`, {
      method: "GET",
      headers,
    });

    const json = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      const msg = json?.message
        ? Array.isArray(json.message) ? json.message.join(", ") : json.message
        : `Request gagal dengan status ${backendRes.status}`;
      return NextResponse.json(
        { success: false, message: msg, data: null },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: json.message || "Daftar kategori sampah berhasil dimuat",
      data: json.data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data kategori sampah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status: 500 },
    );
  }
}
