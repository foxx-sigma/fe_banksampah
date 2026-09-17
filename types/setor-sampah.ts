export type StatusSetor = "menunggu_konfirmasi" | "diverifikasi" | "ditolak" | "selesai";

export interface KategoriSampahRef {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
}

export interface DetailSetorItem {
  id: string;
  kategoriSampahId: string;
  beratKg: number;
  poinPerKg: number;
  subtotalPoin: number;
  beratKgReal: number | null;
  subtotalPoinReal: number | null;
  kategoriSampah: KategoriSampahRef;
}

export interface NasabahSummary {
  id: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin: number;
}

export interface SetorSampahItem {
  id: string;
  kodeSetor: string;
  nasabahId: string;
  tanggal: string;
  totalBeratKg: number;
  totalBeratKgReal: number | null;
  estimasiTotalPoin: number;
  totalPoinReal: number | null;
  status: StatusSetor;
  catatan: string | null;
  catatanAdmin: string | null;
  createdAt: string;
  nasabah: NasabahSummary;
  detailSetor: DetailSetorItem[];
}

export interface VerifyItemPayload {
  kategoriSampahId: string;
  beratKgReal: number;
}

export interface VerifySetorPayload {
  status: StatusSetor;
  catatanAdmin?: string;
  itemsReal?: VerifyItemPayload[];
}
