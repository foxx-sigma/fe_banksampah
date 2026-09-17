import { NextRequest, NextResponse } from "next/server";
import { apiGet } from "@/lib/api-client";
import type { HadiahItem } from "@/types/hadiah";

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
  const search = (searchParams.get("search") || "").toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.max(1, Number(searchParams.get("limit") || "10"));

  try {
    const result = await apiGet<HadiahItem[]>(`/api/v1/hadiah`, {
      Authorization: `Bearer ${token}`,
    });

    let items: HadiahItem[] = [];
    const raw = result.data as
      | HadiahItem[]
      | { items?: HadiahItem[]; data?: HadiahItem[] }
      | null;
    if (Array.isArray(raw)) {
      items = raw;
    } else if (raw && Array.isArray(raw.items)) {
      items = raw.items;
    } else if (raw && Array.isArray(raw.data)) {
      items = raw.data;
    }

    if (search) {
      items = items.filter((h) =>
        h.namaHadiah.toLowerCase().includes(search),
      );
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        items: paged,
        meta: { total, page, limit, totalPages },
      },
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data hadiah";
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
        `${BASE_URL}/api/v1/hadiah`,
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
        message: json.message || "Hadiah berhasil ditambahkan",
        data: json.data,
      });
    }

    const body = await req.json();
    const backendRes = await fetch(
      `${BASE_URL}/api/v1/hadiah`,
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
      message: json.message || "Hadiah berhasil ditambahkan",
      data: json.data,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message =
      error instanceof Error ? error.message : "Gagal menambahkan hadiah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status },
    );
  }
}
