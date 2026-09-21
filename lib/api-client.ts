import type { ApiResponse } from "@/types/auth";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  return headers;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      return body.errors.join(", ");
    }
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(", ") : body.message;
    }
  } catch {
    // ignore parse error
  }
  return `Request gagal dengan status ${res.status}`;
}

async function getServerCookieHeader(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.toString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const isServer = typeof window === "undefined";
  const backendUrl = (process.env.BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

  let url: string;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    url = path;
  } else {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    url = isServer ? `${backendUrl}${cleanPath}` : cleanPath;
  }

  const isFormData = options.body instanceof FormData;
  const headers = buildHeaders(
    isFormData ? undefined : { "Content-Type": "application/json" },
  );

  if (isServer) {
    const serverCookieHeader = await getServerCookieHeader();
    if (serverCookieHeader && !headers.has("Cookie")) {
      headers.set("Cookie", serverCookieHeader);
    }
  }

  if (options.headers) {
    const extra = new Headers(options.headers);
    extra.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const fetchOptions: RequestInit = {
    credentials: isServer ? undefined : "include",
    ...options,
    headers,
  };

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new ApiError(msg, res.status);
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export async function apiGet<T>(path: string, headers?: HeadersInit) {
  return apiFetch<T>(path, { method: "GET", headers });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  headers?: HeadersInit,
) {
  const isFormData = body instanceof FormData;
  return apiFetch<T>(path, {
    method: "POST",
    body: isFormData ? (body as FormData) : JSON.stringify(body),
    headers,
  });
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  headers?: HeadersInit,
) {
  const isFormData = body instanceof FormData;
  return apiFetch<T>(path, {
    method: "PUT",
    body: isFormData ? (body as FormData) : JSON.stringify(body),
    headers,
  });
}

export async function apiDelete<T>(
  path: string,
  headers?: HeadersInit,
) {
  return apiFetch<T>(path, {
    method: "DELETE",
    headers,
  });
}
