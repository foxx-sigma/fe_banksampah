import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const params = new URLSearchParams();
    if (searchParams.get("status")) params.set("status", searchParams.get("status")!);
    if (searchParams.get("bulan")) params.set("bulan", searchParams.get("bulan")!);

    const query = params.toString() ? `?${params}` : "";
    const backendRes = await fetch(
      `${BASE_URL}/api/v1/penukaran-poin/my-penukaran${query}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

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
      message: json.message || "Histori penukaran berhasil dimuat",
      data: json.data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data penukaran poin";
    return NextResponse.json(
      { success: false, message, data: null },
      { status: 500 },
    );
  }
}
