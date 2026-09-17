import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { KategoriSampahListResponse } from "@/types/kategori-sampah";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const jenis = searchParams.get("jenis") || "";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  try {
    let query = `/api/v1/kategori-sampah?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
    if (jenis) query += `&jenis=${encodeURIComponent(jenis)}`;

    const result = await apiGet<KategoriSampahListResponse>(query, {
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
      error instanceof Error ? error.message : "Gagal mengambil data kategori sampah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Tidak terautentikasi", data: null },
      { status: 401 },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const backendRes = await fetch(
        `${BASE_URL}/api/v1/kategori-sampah`,
        {
          method: "POST",
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
        message: json.message || "Kategori sampah berhasil ditambahkan",
        data: json.data,
      });
    }

    const body = await req.json();
    const backendRes = await fetch(
      `${BASE_URL}/api/v1/kategori-sampah`,
      {
        method: "POST",
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
      message: json.message || "Kategori sampah berhasil ditambahkan",
      data: json.data,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error ? error.message : "Gagal menambahkan kategori sampah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
