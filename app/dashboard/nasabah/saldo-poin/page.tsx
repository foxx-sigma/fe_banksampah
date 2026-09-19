"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Coins,
  Package,
  CalendarBlank,
  ArrowClockwise,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import SetorDetailDialog from "@/components/nasabah/SetorDetailDialog";
import type { SetorSampahItem, StatusSetor } from "@/types/setor-sampah";

interface DashboardSummary {
  saldoPoinSaatIni: number;
  totalSampahDisetorKg: number;
  totalPoinDidapat: number;
  totalPoinDitukar: number;
}

const STATUS_BADGE: Record<StatusSetor, string> = {
  menunggu_konfirmasi: "bg-amber-50 text-amber-700 border border-amber-200",
  diverifikasi: "bg-sky-50 text-sky-700 border border-sky-200",
  selesai: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ditolak: "bg-rose-50 text-rose-700 border border-rose-200",
};

const STATUS_LABEL: Record<StatusSetor, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diverifikasi: "Diverifikasi",
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

  const [allItems, setAllItems] = useState<SetorSampahItem[]>([]);
  const [bulanFilter, setBulanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SetorSampahItem | null>(null);

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

  // Fetch histori penyetoran
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (bulanFilter) params.set("bulan", bulanFilter);

        const query = params.toString() ? `?${params}` : "";
        const res = await fetch(`/api/nasabah/setor-sampah${query}`, {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal memuat data histori penyetoran.");
          setAllItems([]);
          return;
        }

        const data = json.data;
        if (Array.isArray(data)) {
          setAllItems(data);
        } else if (data && Array.isArray(data.items)) {
          setAllItems(data.items);
        } else if (data && Array.isArray(data.data)) {
          setAllItems(data.data);
        } else {
          setAllItems([]);
        }
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan.");
          setAllItems([]);
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

  function openDetail(item: SetorSampahItem) {
    setSelectedItem(item);
    setDialogOpen(true);
  }

  // Monthly stats calculated from items
  const monthlyStats = useMemo(() => {
    const verifiedItems = allItems.filter(
      (item) => item.status === "selesai" || item.status === "diverifikasi"
    );
    const totalBerat = verifiedItems.reduce(
      (acc, cur) => acc + (cur.totalBeratKgReal ?? cur.totalBeratKg),
      0
    );
    const totalPoin = verifiedItems.reduce(
      (acc, cur) => acc + (cur.totalPoinReal ?? cur.estimasiTotalPoin),
      0
    );
    return {
      totalBerat: Math.round(totalBerat * 100) / 100,
      totalPoin,
      totalSetoran: allItems.length,
      totalSelesai: verifiedItems.length,
    };
  }, [allItems]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Saldo & Histori Penyetoran
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Pantau saldo poin aktif dan riwayat seluruh transaksi penyetoran sampah Anda.
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle size={24} weight="fill" className="text-emerald-600" />
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
                {formatNumber(summary?.totalPoinDidapat ?? 0)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">akumulasi perolehan</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Coins size={24} weight="fill" className="text-emerald-600" />
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
                {formatNumber(summary?.totalPoinDitukar ?? 0)}
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

      {/* Filter & Tabel Histori Penyetoran */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-semibold text-zinc-900 text-base">
              Histori Penyetoran Sampah
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {bulanFilter ? `Menampilkan data bulan ${bulanFilter}` : "Seluruh riwayat transaksi"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
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
            {bulanFilter && (
              <button
                onClick={() => setBulanFilter("")}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan Filter Bulan Aktif jika dipilih */}
        {bulanFilter && !loading && allItems.length > 0 && (
          <div className="bg-teal-50/60 border-b border-teal-100 px-4 py-3 flex flex-wrap gap-4 text-xs sm:text-sm text-teal-800">
            <div>
              <span className="font-medium text-teal-900">Total Setoran: </span>
              {monthlyStats.totalSetoran} transaksi
            </div>
            <div>
              <span className="font-medium text-teal-900">Berat Timbang: </span>
              {formatWeight(monthlyStats.totalBerat)} kg
            </div>
            <div>
              <span className="font-medium text-teal-900">Poin Diperoleh: </span>
              {formatNumber(monthlyStats.totalPoin)} poin
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
                <th className="font-medium text-zinc-500 px-4 py-3">Kode Setor</th>
                <th className="font-medium text-zinc-500 px-4 py-3">Tanggal</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-right">Berat Estimasi</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-right">Berat Aktual</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-right">Perolehan Poin</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-center">Status</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-50">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24 mx-auto rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-10 mx-auto" /></td>
                  </tr>
                ))
              ) : allItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 font-sans">
                    {bulanFilter
                      ? "Tidak ada histori penyetoran pada bulan yang dipilih."
                      : "Belum ada histori penyetoran sampah."}
                  </td>
                </tr>
              ) : (
                allItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    onClick={() => openDetail(item)}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {item.kodeSetor}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600 tabular-nums">
                      {formatWeight(item.totalBeratKg)} kg
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-900 font-medium tabular-nums">
                      {item.totalBeratKgReal !== null
                        ? `${formatWeight(item.totalBeratKgReal)} kg`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-teal-700 font-medium tabular-nums">
                      {item.totalPoinReal !== null
                        ? formatNumber(item.totalPoinReal)
                        : formatNumber(item.estimasiTotalPoin)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGE[item.status]
                        }`}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(item);
                          }}
                          className="p-2 text-zinc-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Lihat Detail Transaksi"
                        >
                          <Eye size={18} />
                        </button>
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
          ) : allItems.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm">
              {bulanFilter
                ? "Tidak ada histori penyetoran pada bulan yang dipilih."
                : "Belum ada histori penyetoran sampah."}
            </div>
          ) : (
            allItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="border border-zinc-200 rounded-xl p-4 shadow-sm hover:border-teal-300 transition-colors cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">
                      {item.kodeSetor}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatDate(item.tanggal)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      STATUS_BADGE[item.status]
                    }`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-sm">
                  <div className="text-zinc-600">
                    <span className="text-xs text-zinc-400 block mb-0.5">Berat Aktual</span>
                    <span className="font-medium text-zinc-900 tabular-nums">
                      {item.totalBeratKgReal !== null
                        ? `${formatWeight(item.totalBeratKgReal)} kg`
                        : `${formatWeight(item.totalBeratKg)} kg (est)`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block mb-0.5">Perolehan Poin</span>
                    <span className="font-medium text-teal-700 tabular-nums">
                      {item.totalPoinReal !== null
                        ? formatNumber(item.totalPoinReal)
                        : formatNumber(item.estimasiTotalPoin)}
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
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
}
