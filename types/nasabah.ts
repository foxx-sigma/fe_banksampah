export interface NasabahUser {
  id: string;
  username: string;
}

export interface NasabahItem {
  id: string;
  userId: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  tanggalLahir: string | null;
  foto: string | null;
  saldoPoin: number;
  createdAt: string;
  user: NasabahUser;
}

export interface NasabahListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NasabahListResponse {
  items: NasabahItem[];
  meta: NasabahListMeta;
}

export interface CreateNasabahPayload {
  username: string;
  password: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  tanggalLahir?: string;
  foto?: File;
}

export interface UpdateNasabahPayload {
  username?: string;
  password?: string;
  namaNasabah?: string;
  alamat?: string;
  telp?: string;
  tanggalLahir?: string;
  foto?: File;
}
