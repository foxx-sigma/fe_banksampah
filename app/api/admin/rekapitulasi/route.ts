import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { RekapitulasiBulananResponse } from "@/types/rekapitulasi";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get("bulan") || "";

  if (!bulan || !/^\d{4}-\d{2}$/.test(bulan)) {
    return NextResponse.json(
      { success: false, message: "Parameter bulan wajib diisi dengan format YYYY-MM", data: null },
      { status: 400 },
    );
  }

  try {
    const result = await apiGet<RekapitulasiBulananResponse>(
      `/api/v1/rekapitulasi/bulanan?bulan=${encodeURIComponent(bulan)}`,
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
      error instanceof Error ? error.message : "Gagal mengambil data rekapitulasi";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
