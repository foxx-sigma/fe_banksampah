import { NextRequest, NextResponse } from "next/server";
import { apiGet, apiPut } from "@/lib/api-client";
import type { SetorSampahItem } from "@/types/setor-sampah";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    const result = await apiGet<SetorSampahItem>(
      `/api/v1/setor-sampah/${id}`,
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
      error instanceof Error ? error.message : "Gagal mengambil detail setoran";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const result = await apiPut<SetorSampahItem>(
      `/api/v1/setor-sampah/admin/verify/${id}`,
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
      error instanceof Error ? error.message : "Gagal memverifikasi setoran";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
