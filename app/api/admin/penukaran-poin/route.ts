import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const bulan = searchParams.get("bulan") || "";

  try {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (bulan) params.set("bulan", bulan);

    const query = params.toString() ? `?${params}` : "";
    const result = await apiGet<unknown[]>(
      `/api/v1/penukaran-poin/admin/list${query}`,
      { Authorization: `Bearer ${token}` },
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data penukaran poin";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
