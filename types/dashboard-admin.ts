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

// Dummy data fallback
export const DUMMY_STATS: AdminOverviewStats = {
  totalNasabah: 142,
  setoranMasukBulanIni: 38,
  totalPoinDitukarBulanIni: 12500,
  estimasiPembayaranBulanIni: 4500000,
};

export const DUMMY_CHART_DATA: CategoryTonData[] = [
  { kategori: "Plastik", tonaseKg: 450.5, warna: "bg-teal-600" },
  { kategori: "Kertas", tonaseKg: 320.2, warna: "bg-teal-500" },
  { kategori: "Logam", tonaseKg: 150.0, warna: "bg-teal-700" },
  { kategori: "Kaca", tonaseKg: 95.8, warna: "bg-teal-400" },
];

export const DUMMY_PENDING_SETORAN: PendingSetorItem[] = [
  {
    id: "TRX-001",
    namaNasabah: "Budi Santoso",
    jenisSampah: "Plastik, Kertas",
    tanggal: new Date().toISOString(),
    status: "menunggu_konfirmasi",
  },
  {
    id: "TRX-002",
    namaNasabah: "Siti Rahma",
    jenisSampah: "Logam",
    tanggal: new Date(Date.now() - 86400000).toISOString(),
    status: "menunggu_konfirmasi",
  },
  {
    id: "TRX-003",
    namaNasabah: "Andi Wijaya",
    jenisSampah: "Campuran",
    tanggal: new Date(Date.now() - 172800000).toISOString(),
    status: "menunggu_konfirmasi",
  },
];
