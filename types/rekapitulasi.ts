export interface BreakdownJenisItem {
  tonaseKg: number;
  rupiah: number;
  poin: number;
}

export interface RekapitulasiTonase {
  totalKg: number;
  totalTon: number;
  totalEstimasiPembayaranRupiah: number;
  totalPoinDiterbitkan: number;
}

export interface RekapitulasiPenukaranPoin {
  totalTransaksiPenukaran: number;
  totalPoinTerpakai: number;
}

export interface RekapitulasiBulananResponse {
  bulan: string;
  rekapitulasiTonase: RekapitulasiTonase;
  breakdownJenisSampah: Record<string, BreakdownJenisItem>;
  rekapitulasiPenukaranPoin: RekapitulasiPenukaranPoin;
}
