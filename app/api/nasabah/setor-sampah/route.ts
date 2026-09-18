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
      `${BASE_URL}/api/v1/setor-sampah/my-setor${query}`,
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
      message: json.message || "Histori setor sampah berhasil dimuat",
      data: json.data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data setor sampah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status: 500 },
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
        `${BASE_URL}/api/v1/setor-sampah/pengajuan`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const json = await backendRes.json().catch(() => ({}));
      if (!backendRes.ok) {
        const detail = Array.isArray(json?.errors) && json.errors.length > 0
          ? json.errors.join(", ")
          : null;
        const msg = detail
          || (json?.message ? (Array.isArray(json.message) ? json.message.join(", ") : json.message) : null)
          || `Request gagal dengan status ${backendRes.status}`;
        return NextResponse.json(
          { success: false, message: msg, data: null },
          { status: backendRes.status },
        );
      }

      return NextResponse.json({
        success: true,
        message: json.message || "Pengajuan setor sampah berhasil dibuat",
        data: json.data,
      });
    }

    const body = await req.json();
    const backendRes = await fetch(
      `${BASE_URL}/api/v1/setor-sampah/pengajuan`,
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
      const detail = Array.isArray(json?.errors) && json.errors.length > 0
        ? json.errors.join(", ")
        : null;
      const msg = detail
        || (json?.message ? (Array.isArray(json.message) ? json.message.join(", ") : json.message) : null)
        || `Request gagal dengan status ${backendRes.status}`;
      return NextResponse.json(
        { success: false, message: msg, data: null },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: json.message || "Pengajuan setor sampah berhasil dibuat",
      data: json.data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mengajukan setor sampah";
    return NextResponse.json(
      { success: false, message, data: null },
      { status: 500 },
    );
  }
}
