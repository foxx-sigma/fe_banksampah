export type UserRole = "NASABAH" | "ADMIN";

export interface NasabahProfile {
  id: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  foto: string | null;
  saldoPoin: number;
}

export interface AdminBankProfile {
  id: string;
  namaUnit: string;
  namaPengelola: string;
  telp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  nasabah?: NasabahProfile | null;
  adminBank?: AdminBankProfile | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterNasabahPayload {
  username: string;
  password: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  foto?: File;
}

export interface RegisterAdminPayload {
  username: string;
  password: string;
  namaUnit: string;
  namaPengelola: string;
  telp: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponseData {
  token: string;
  accessToken: string;
  user: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
