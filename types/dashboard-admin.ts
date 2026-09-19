export interface AdminOverviewStats {
  totalNasabah: number;
  setoranMasukBulanIni: number;
  totalPoinDitukarBulanIni: number;
  estimasiPembayaranBulanIni: number;
}

export interface CategoryTonData {
  kategori: string;
  tonaseKg: number;
  warna: string;
}

export interface PendingSetorItem {
  id: string;
  namaNasabah: string;
  jenisSampah: string;
  tanggal: string;
  status: string;
}
