import { cookies } from "next/headers";
import {
  Users,
  CheckCircle,
  Swap,
  Wallet,
} from "@phosphor-icons/react/dist/ssr"; // Use SSR imports for Server Components

import StatCard from "@/components/admin/StatCard";
import PendingSetoranList from "@/components/admin/PendingSetoranList";
import { apiGet } from "@/lib/api-client";
import type {
  AdminOverviewStats,
  PendingSetorItem,
} from "@/types/dashboard-admin";

interface StatsApiResponse {
  totalNasabah?: number;
}

interface RekapApiResponse {
  breakdownJenisSampah?: {
    plastik?: { tonaseKg: number };
    kertas?: { tonaseKg: number };
    logam?: { tonaseKg: number };
    kaca?: { tonaseKg: number };
  };
  rekapitulasiTonase?: {
    totalEstimasiPembayaranRupiah?: number;
  };
  rekapitulasiPenukaranPoin?: {
    totalPoinTerpakai?: number;
  };
}

interface SetorItemApiResponse {
  id: string;
  nasabah?: { namaNasabah?: string };
  detailSetor?: Array<{ kategoriSampah?: { jenis?: string } }>;
  createdAt?: string;
  status: string;
}

async function fetchDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const stats: AdminOverviewStats = {
    totalNasabah: 0,
    setoranMasukBulanIni: 0,
    totalPoinDitukarBulanIni: 0,
    estimasiPembayaranBulanIni: 0,
  };
  let pendingSetoran: PendingSetorItem[] = [];

  try {
    // 1. Fetch Agregat Stats
    const statsRes = await apiGet<StatsApiResponse>("/api/v1/dashboard/stats", headers);
    if (statsRes && statsRes.data) {
      stats.totalNasabah = statsRes.data.totalNasabah || 0;
      // You can map other fields if they exist
    }

    // 2. Fetch Rekapitulasi (e.g. Current Month)
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const rekapRes = await apiGet<RekapApiResponse>(
      `/api/v1/rekapitulasi/bulanan?bulan=${monthStr}`,
      headers
    );
    
    if (rekapRes && rekapRes.data) {
      stats.estimasiPembayaranBulanIni = rekapRes.data.rekapitulasiTonase?.totalEstimasiPembayaranRupiah || 0;
      stats.totalPoinDitukarBulanIni = rekapRes.data.rekapitulasiPenukaranPoin?.totalPoinTerpakai || 0;
    }

    // 3. Fetch List Setor Sampah
    const listRes = await apiGet<SetorItemApiResponse[]>(
      "/api/v1/setor-sampah/admin/list?status=menunggu_konfirmasi",
      headers
    );
    
    if (listRes && Array.isArray(listRes.data)) {
      pendingSetoran = listRes.data.slice(0, 5).map((item) => ({
        id: item.id,
        namaNasabah: item.nasabah?.namaNasabah || "Unknown",
        jenisSampah: item.detailSetor?.map((d) => d.kategoriSampah?.jenis || "").join(", ") || "",
        tanggal: item.createdAt || new Date().toISOString(),
        status: item.status,
      }));
    }

  } catch (error) {
    console.error("Gagal fetch data dashboard admin:", error);
    // Don't use dummy data - return empty arrays/objects instead
    // This allows the component to render empty state instead of misleading data
  }

  return { stats, pendingSetoran };
}

export default async function AdminOverviewPage() {
  const { stats, pendingSetoran } = await fetchDashboardData();

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Overview Dashboard
        </h1>
        <p className="font-sans text-zinc-500 text-sm">
          Pantau ringkasan performa dan aktivitas Loopera terbaru.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Nasabah Aktif"
          value={formatNumber(stats.totalNasabah)}
          icon={Users}
        />
        <StatCard
          title="Setoran Masuk (Bulan Ini)"
          value={formatNumber(stats.setoranMasukBulanIni)}
          icon={CheckCircle}
        />
        <StatCard
          title="Poin Ditukar (Bulan Ini)"
          value={formatNumber(stats.totalPoinDitukarBulanIni)}
          icon={Swap}
        />
        <StatCard
          title="Estimasi Pembayaran (Bulan Ini)"
          value={formatRupiah(stats.estimasiPembayaranBulanIni)}
          icon={Wallet}
        />
      </div>

      {/* Main Panel Content - full width pending list */}
      <div className="w-full">
        <PendingSetoranList items={pendingSetoran} />
      </div>
    </div>
  );
}
