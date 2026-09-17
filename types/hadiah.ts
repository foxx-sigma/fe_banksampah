export interface HadiahItem {
  id: string;
  namaHadiah: string;
  deskripsi: string | null;
  poinDibutuhkan: number;
  stok: number;
  foto: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HadiahListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HadiahListResponse {
  items: HadiahItem[];
  meta: HadiahListMeta;
}
