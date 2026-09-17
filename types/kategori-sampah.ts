export type JenisSampah = "plastik" | "kertas" | "logam" | "kaca";

export interface KategoriSampahItem {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: JenisSampah;
  foto: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface KategoriSampahListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KategoriSampahListResponse {
  items: KategoriSampahItem[];
  meta: KategoriSampahListMeta;
}
