import { NextRequest, NextResponse } from "next/server";
import { apiGet, apiDelete } from "@/lib/api-client";
import type { NasabahItem } from "@/types/nasabah";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:3001";

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
    const result = await apiGet<NasabahItem>(
      `/api/v1/admin/nasabah/${id}`,
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
      error instanceof Error ? error.message : "Gagal mengambil data nasabah";
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
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const backendRes = await fetch(
        `${BASE_URL}/api/v1/admin/nasabah/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
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
        message: json.message || "Nasabah berhasil diperbarui",
        data: json.data,
      });
    }

    const body = await req.json();
    const backendRes = await fetch(
      `${BASE_URL}/api/v1/admin/nasabah/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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
      message: json.message || "Nasabah berhasil diperbarui",
      data: json.data,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui nasabah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}

export async function DELETE(
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
    const result = await apiDelete<null>(
      `/api/v1/admin/nasabah/${id}`,
      { Authorization: `Bearer ${token}` },
    );

    return NextResponse.json({
      success: true,
      message: result.message || "Nasabah berhasil dihapus",
      data: null,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error ? error.message : "Gagal menghapus nasabah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
