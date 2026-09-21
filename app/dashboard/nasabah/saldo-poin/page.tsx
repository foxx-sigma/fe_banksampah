"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Coins,
  Package,
  CalendarBlank,
  ArrowClockwise,
  Eye,
  CheckCircle,
  Gift,
  Funnel,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import SetorDetailDialog from "@/components/nasabah/SetorDetailDialog";
import PenukaranDetailDialog, {
  type PenukaranDetailItem,
} from "@/components/nasabah/PenukaranDetailDialog";
import type { SetorSampahItem, StatusSetor } from "@/types/setor-sampah";

interface DashboardSummary {
  saldoPoinSaatIni: number;
  totalSampahDisetorKg: number;
  totalPoinDidapat: number;
  totalPoinDitukar: number;
}

interface PenukaranItem {
  id: string;
  kodePenukaran: string;
  tanggal: string;
  status: "diproses" | "selesai";
  poinDigunakan: number;
  catatan: string | null;
  hadiah: {
    id: string;
    namaHadiah: string;
    poinDibutuhkan: number;
  };
}

type UnifiedTransaction =
  | {
      type: "setoran";
      id: string;
      kode: string;
      tanggal: string;
      status: StatusSetor;
      beratEstimasi: number;
      beratReal: number | null;
      poin: number;
      isPositive: true;
      rawSetor: SetorSampahItem;
    }
  | {
      type: "penukaran";
      id: string;
      kode: string;
      tanggal: string;
      status: "diproses" | "selesai";
      namaHadiah: string;
      poin: number;
      isPositive: false;
      rawPenukaran: PenukaranItem;
    };

const STATUS_BADGE: Record<string, string> = {
  menunggu_konfirmasi: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  diverifikasi: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  diproses: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  selesai: "bg-teal-50 text-teal-700 border border-teal-200",
  ditolak: "bg-red-50 text-red-700 border border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diverifikasi: "Diverifikasi",
  diproses: "Sedang Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

const formatWeight = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export default function SaldoPoinPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const [setorItems, setSetorItems] = useState<SetorSampahItem[]>([]);
  const [penukaranItems, setPenukaranItems] = useState<PenukaranItem[]>([]);
  
  const [tipeFilter, setTipeFilter] = useState<"all" | "setoran" | "penukaran">("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [bulanFilter, setBulanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSetorItem, setSelectedSetorItem] =
    useState<SetorSampahItem | null>(null);

  const [penukaranDialogOpen, setPenukaranDialogOpen] = useState(false);
  const [selectedPenukaranItem, setSelectedPenukaranItem] =
    useState<PenukaranDetailItem | null>(null);

  // Fetch summary data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        const res = await fetch("/api/nasabah/dashboard/summary", {
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setSummaryError(json.message || "Gagal memuat ringkasan saldo.");
          return;
        }
        setSummary(json.data);
      } catch {
        if (!cancelled) setSummaryError("Gagal terhubung ke server.");
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Fetch histori transaksi (setoran dan penukaran)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (bulanFilter) params.set("bulan", bulanFilter);

        const query = params.toString() ? `?${params}` : "";

        const [setorRes, penukaranRes] = await Promise.all([
          fetch(`/api/nasabah/setor-sampah${query}`, { credentials: "include" }),
          fetch(`/api/nasabah/penukaran-poin/my-penukaran${query}`, { credentials: "include" }),
        ]);

        const setorJson = await setorRes.json().catch(() => ({}));
        const penukaranJson = await penukaranRes.json().catch(() => ({}));

        if (cancelled) return;

        let loadedSetor: SetorSampahItem[] = [];
        if (setorRes.ok && setorJson.success) {
          const data = setorJson.data;
          loadedSetor = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
            ? data.data
            : [];
        }

        let loadedPenukaran: PenukaranItem[] = [];
        if (penukaranRes.ok && penukaranJson.success) {
          const data = penukaranJson.data;
          loadedPenukaran = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
            ? data.data
            : [];
        }

        setSetorItems(loadedSetor);
        setPenukaranItems(loadedPenukaran);
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan saat memuat histori.");
          setSetorItems([]);
          setPenukaranItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bulanFilter, refreshKey]);

  const handleRetry = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  function openDetailSetor(item: SetorSampahItem) {
    setSelectedSetorItem(item);
    setDialogOpen(true);
  }

  function openDetailPenukaran(item: {
    id: string;
    kode: string;
    tanggal: string;
    status: "diproses" | "selesai";
    namaHadiah: string;
    poin: number;
    rawPenukaran: PenukaranItem;
  }) {
    setSelectedPenukaranItem({
      id: item.id,
      kode: item.kode,
      tanggal: item.tanggal,
      status: item.status,
      namaHadiah: item.namaHadiah,
      poin: item.poin,
      catatan: item.rawPenukaran.catatan,
    });
    setPenukaranDialogOpen(true);
  }

  // Combine and sort transactions chronologically
  const unifiedTransactions = useMemo((): UnifiedTransaction[] => {
    const list: UnifiedTransaction[] = [];

    if (tipeFilter === "all" || tipeFilter === "setoran") {
      for (const s of setorItems) {
        list.push({
          type: "setoran",
          id: s.id,
          kode: s.kodeSetor,
          tanggal: s.tanggal,
          status: s.status,
          beratEstimasi: s.totalBeratKg,
          beratReal: s.totalBeratKgReal,
          poin: s.totalPoinReal !== null && s.totalPoinReal !== undefined ? s.totalPoinReal : s.estimasiTotalPoin,
          isPositive: true,
          rawSetor: s,
        });
      }
    }

    if (tipeFilter === "all" || tipeFilter === "penukaran") {
      for (const p of penukaranItems) {
        list.push({
          type: "penukaran",
          id: p.id,
          kode: p.kodePenukaran,
          tanggal: p.tanggal,
          status: p.status,
          namaHadiah: p.hadiah?.namaHadiah || "Hadiah",
          poin: p.poinDigunakan,
          isPositive: false,
          rawPenukaran: p,
        });
      }
    }

    // Apply status filter if selected
    const filtered = statusFilter
      ? list.filter((item) => item.status === statusFilter)
      : list;

    // Sort descending by date, and fallback to createdAt/id
    return filtered.sort((a, b) => {
      const dateA = new Date(a.tanggal).getTime();
      const dateB = new Date(b.tanggal).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      const createdA = new Date(
        a.type === "setoran" ? a.rawSetor.createdAt : a.rawPenukaran.tanggal
      ).getTime();
      const createdB = new Date(
        b.type === "setoran" ? b.rawSetor.createdAt : b.rawPenukaran.tanggal
      ).getTime();
      return createdB - createdA;
    });
  }, [setorItems, penukaranItems, tipeFilter, statusFilter]);

  // Monthly statistics summary
  const monthlyStats = useMemo(() => {
    const verifiedSetor = setorItems.filter(
      (item) => item.status === "selesai" || item.status === "diverifikasi"
    );
    const totalBerat = verifiedSetor.reduce(
      (acc, cur) => acc + (cur.totalBeratKgReal ?? cur.totalBeratKg),
      0
    );
    const totalPoinMasuk = verifiedSetor.reduce(
      (acc, cur) => acc + (cur.totalPoinReal ?? cur.estimasiTotalPoin),
      0
    );
    const totalPoinKeluar = penukaranItems
      .filter((p) => p.status === "selesai")
      .reduce((acc, cur) => acc + cur.poinDigunakan, 0);

    return {
      totalBerat: Math.round(totalBerat * 100) / 100,
      totalPoinMasuk,
      totalPoinKeluar,
      countSetoran: setorItems.length,
      countPenukaran: penukaranItems.length,
    };
  }, [setorItems, penukaranItems]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Saldo & Histori Transaksi
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Pantau saldo poin aktif, riwayat perolehan setoran sampah, serta penukaran hadiah Anda.
        </p>
      </div>

      {/* Cards ringkasan saldo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <Coins size={24} weight="fill" className="text-teal-600" />
            </div>
            <span className="text-sm font-medium text-zinc-500">
              Saldo Poin Saat Ini
            </span>
          </div>
          {summaryLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : summaryError ? (
            <p className="mt-4 text-sm text-red-600">{summaryError}</p>
          ) : (
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">
                {formatNumber(summary?.saldoPoinSaatIni ?? 0)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">poin siap ditukar</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <CheckCircle size={24} weight="fill" className="text-teal-600" />
            </div>
            <span className="text-sm font-medium text-zinc-500">
              Total Poin Didapat
            </span>
          </div>
          {summaryLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : summaryError ? (
            <p className="mt-4 text-sm text-red-600">{summaryError}</p>
          ) : (
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">
                +{formatNumber(summary?.totalPoinDidapat ?? 0)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">akumulasi perolehan</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <Gift size={24} weight="fill" className="text-teal-600" />
            </div>
            <span className="text-sm font-medium text-zinc-500">
              Total Poin Ditukar
            </span>
          </div>
          {summaryLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : summaryError ? (
            <p className="mt-4 text-sm text-red-600">{summaryError}</p>
          ) : (
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">
                -{formatNumber(summary?.totalPoinDitukar ?? 0)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">poin telah dibelanjakan</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <Package size={24} weight="fill" className="text-teal-600" />
            </div>
            <span className="text-sm font-medium text-zinc-500">
              Total Sampah Terverifikasi
            </span>
          </div>
          {summaryLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : summaryError ? (
            <p className="mt-4 text-sm text-red-600">{summaryError}</p>
          ) : (
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">
                {formatWeight(summary?.totalSampahDisetorKg ?? 0)}{" "}
                <span className="text-lg font-semibold text-zinc-500">kg</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">total berat keseluruhan</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Tabel Histori Transaksi Gabungan */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Tipe Selector Buttons */}
          <div className="flex rounded-lg border border-zinc-200 p-1 bg-zinc-50/50 w-full sm:w-auto">
            <button
              onClick={() => setTipeFilter("all")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition ${
                tipeFilter === "all"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Semua Transaksi
            </button>
            <button
              onClick={() => setTipeFilter("setoran")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition ${
                tipeFilter === "setoran"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Setoran Masuk
            </button>
            <button
              onClick={() => setTipeFilter("penukaran")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition ${
                tipeFilter === "penukaran"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Penukaran Hadiah
            </button>
          </div>

          {/* Filter Status & Bulan */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
              >
                <option value="">Semua Status</option>
                <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                <option value="diverifikasi">Diverifikasi</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <CalendarBlank
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="month"
                value={bulanFilter}
                onChange={(e) => setBulanFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-zinc-300 pl-10 pr-4 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
              />
            </div>
            {(statusFilter || bulanFilter || tipeFilter !== "all") && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setBulanFilter("");
                  setTipeFilter("all");
                }}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan Filter Bulan Aktif */}
        {bulanFilter && !loading && (
          <div className="bg-teal-50/60 border-b border-teal-100 px-4 py-3 flex flex-wrap gap-4 text-xs sm:text-sm text-teal-800">
            <div>
              <span className="font-medium text-teal-900">Total Setoran: </span>
              {monthlyStats.countSetoran} transaksi ({formatWeight(monthlyStats.totalBerat)} kg)
            </div>
            <div>
              <span className="font-medium text-teal-900">Poin Diperoleh: </span>
              +{formatNumber(monthlyStats.totalPoinMasuk)} poin
            </div>
            <div>
              <span className="font-medium text-teal-900">Poin Ditukar: </span>
              -{formatNumber(monthlyStats.totalPoinKeluar)} poin
            </div>
          </div>
        )}

        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="text-xs font-semibold underline hover:no-underline ml-2"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Tabel Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="font-medium text-zinc-500 px-4 py-3">Tipe</th>
                <th className="font-medium text-zinc-500 px-4 py-3">Kode Transaksi</th>
                <th className="font-medium text-zinc-500 px-4 py-3">Tanggal</th>
                <th className="font-medium text-zinc-500 px-4 py-3">Keterangan</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-right">Mutasi Poin</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-center">Status</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-50">
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-md" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24 mx-auto rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-10 mx-auto" /></td>
                  </tr>
                ))
              ) : unifiedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 font-sans">
                    {bulanFilter || statusFilter || tipeFilter !== "all"
                      ? "Tidak ada transaksi ditemukan untuk filter ini."
                      : "Belum ada histori transaksi penyetoran atau penukaran."}
                  </td>
                </tr>
              ) : (
                unifiedTransactions.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {item.type === "setoran" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-700">
                          <Package size={14} weight="fill" /> Setor
                        </span>
                      ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700">
                            <Gift size={14} weight="fill" /> Tukar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {item.kode}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {item.type === "setoran" ? (
                        item.beratReal !== null
                          ? `Timbang: ${formatWeight(item.beratReal)} kg`
                          : `Est: ${formatWeight(item.beratEstimasi)} kg`
                      ) : (
                        item.namaHadiah
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {item.isPositive ? (
                        <span className="text-teal-700">+{formatNumber(item.poin)}</span>
                      ) : (
                        <span className="text-red-600">-{formatNumber(item.poin)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGE[item.status] || "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {STATUS_LABEL[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {item.type === "setoran" ? (
                          <button
                            onClick={() => openDetailSetor(item.rawSetor)}
                            className="p-2 text-zinc-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="Lihat Detail Setoran"
                          >
                            <Eye size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => openDetailPenukaran(item)}
                            className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Lihat Detail Penukaran"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tampilan Mobile */}
        <div className="md:hidden p-4 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="pt-2 border-t border-zinc-100 flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))
          ) : unifiedTransactions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm">
              {bulanFilter || statusFilter || tipeFilter !== "all"
                ? "Tidak ada transaksi ditemukan untuk filter ini."
                : "Belum ada histori transaksi penyetoran atau penukaran."}
            </div>
          ) : (
            unifiedTransactions.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() =>
                  item.type === "setoran"
                    ? openDetailSetor(item.rawSetor)
                    : openDetailPenukaran(item)
                }
                className={`border border-zinc-200 rounded-xl p-4 shadow-sm transition-colors space-y-3 cursor-pointer hover:border-zinc-300 ${
                  item.type === "setoran"
                    ? "hover:border-teal-300"
                    : "hover:border-red-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === "setoran" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700">
                          Setor Sampah
                        </span>
                      ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700">
                            Tukar Hadiah
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-zinc-900 text-sm">
                      {item.kode}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatDate(item.tanggal)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      STATUS_BADGE[item.status] || "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {STATUS_LABEL[item.status] || item.status}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-sm">
                  <div className="text-zinc-600">
                    <span className="text-xs text-zinc-400 block mb-0.5">Keterangan</span>
                    <span className="font-medium text-zinc-900 text-xs sm:text-sm">
                      {item.type === "setoran"
                        ? item.beratReal !== null
                          ? `${formatWeight(item.beratReal)} kg`
                          : `${formatWeight(item.beratEstimasi)} kg (est)`
                        : item.namaHadiah}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block mb-0.5">Poin</span>
                    <span
                      className={`font-medium tabular-nums ${
                        item.isPositive ? "text-teal-700" : "text-red-600"
                      }`}
                    >
                      {item.isPositive ? `+${formatNumber(item.poin)}` : `-${formatNumber(item.poin)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <SetorDetailDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedSetorItem(null);
        }}
        item={selectedSetorItem}
      />

      <PenukaranDetailDialog
        open={penukaranDialogOpen}
        onClose={() => {
          setPenukaranDialogOpen(false);
          setSelectedPenukaranItem(null);
        }}
        item={selectedPenukaranItem}
      />
    </div>
  );
}
