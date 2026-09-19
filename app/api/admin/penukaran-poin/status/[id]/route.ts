import { NextRequest, NextResponse } from "next/server";
import { apiPut } from "@/lib/api-client";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const result = await apiPut<any>(
      `/api/v1/penukaran-poin/admin/status/${id}`,
      body,
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
      error instanceof Error ? error.message : "Gagal memperbarui status penukaran";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
