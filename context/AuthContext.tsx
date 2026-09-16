"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  UserProfile,
  AuthState,
  LoginPayload,
  RegisterNasabahPayload,
  RegisterAdminPayload,
} from "@/types/auth";

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  registerNasabah: (payload: RegisterNasabahPayload) => Promise<void>;
  registerAdmin: (payload: RegisterAdminPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchBff<T>(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json.success) {
    if (res.status === 401 && typeof window !== "undefined") {
      // Avoid redirect loop if already on login page
      if (!window.location.pathname.includes("/login")) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login?expired=1";
      }
    }
    const error = new Error(json.message || `Request gagal (${res.status})`);
    (error as Error & { status: number }).status = res.status;
    throw error;
  }

  return json.data as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await fetchBff<UserProfile>("/api/auth/me");
        if (mounted) setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        if (mounted) {
          setState({ user: null, isLoading: false, isAuthenticated: false });
          // If we fail on initial load with 401, we might need to redirect if they are on a protected route.
          // But since we can't assume which route is protected without middleware, we only redirect
          // if they are clearly doing an action that gets 401. Or, we can let individual pages handle it.
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await fetchBff<UserProfile>("/api/auth/me");
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const user = await fetchBff<UserProfile>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setState({ user, isLoading: false, isAuthenticated: true });

      if (user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/nasabah");
      }
    },
    [router],
  );

  const registerNasabah = useCallback(async (payload: RegisterNasabahPayload) => {
    const formData = new FormData();
    formData.append("username", payload.username);
    formData.append("password", payload.password);
    formData.append("namaNasabah", payload.namaNasabah);
    formData.append("alamat", payload.alamat);
    formData.append("telp", payload.telp);
    if (payload.foto) {
      formData.append("foto", payload.foto);
    }

    await fetchBff("/api/auth/register/nasabah", {
      method: "POST",
      body: formData,
    });
  }, []);

  const registerAdmin = useCallback(async (payload: RegisterAdminPayload) => {
    await fetchBff("/api/auth/register/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }, []);

  const logout = useCallback(async () => {
    await fetchBff("/api/auth/logout", { method: "POST" });
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, registerNasabah, registerAdmin, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
