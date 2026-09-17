"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Eye,
  Funnel,
  ArrowClockwise,
  Package,
  CalendarBlank,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import SetorDetailDialog from "@/components/nasabah/SetorDetailDialog";
import type { SetorSampahItem, StatusSetor } from "@/types/setor-sampah";

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "diverifikasi", label: "Diverifikasi" },
  { value: "selesai", label: "Selesai" },
  { value: "ditolak", label: "Ditolak" },
];

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

export default function StatusPengajuanPage() {
  const [allItems, setAllItems] = useState<SetorSampahItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [bulanFilter, setBulanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SetorSampahItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/nasabah/setor-sampah", {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal mengambil data status pengajuan.");
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
  }, [refreshKey]);

  const filteredItems = useMemo(() => {
    let result = allItems;

    if (statusFilter) {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (bulanFilter && /^\d{4}-\d{2}$/.test(bulanFilter)) {
      const [yStr, mStr] = bulanFilter.split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      
      const startOfMonth = new Date(y, m - 1, 1).getTime();
      const endOfMonth = new Date(y, m, 1).getTime();
      
      result = result.filter((item) => {
        const t = new Date(item.tanggal).getTime();
        return t >= startOfMonth && t < endOfMonth;
      });
    }

    return result;
  }, [allItems, statusFilter, bulanFilter]);

  const hasActiveFilter = statusFilter !== "" || bulanFilter !== "";

  const handleRetry = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  function openDetail(item: SetorSampahItem) {
    setSelectedItem(item);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Status Pengajuan
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Pantau status pengajuan penyetoran sampah kamu di sini.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Funnel
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-zinc-300 pl-10 pr-8 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white appearance-none"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
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
        {hasActiveFilter && (
          <button
            onClick={() => {
              setStatusFilter("");
              setBulanFilter("");
            }}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 transition self-start sm:self-center px-1"
          >
            Reset Filter
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Package size={24} className="text-red-500" />
            </div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
            >
              <ArrowClockwise size={16} weight="bold" />
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="font-medium text-zinc-500 px-4 py-3">Kode Setor</th>
                <th className="font-medium text-zinc-500 px-4 py-3">Tanggal</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-right">Berat</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-right">Poin</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-center">Status</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-50">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-24 mx-auto rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-10 mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error && filteredItems.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
              <Package size={28} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 text-sm font-sans mt-2">
              {hasActiveFilter
                ? "Tidak ada pengajuan yang cocok dengan filter."
                : "Kamu belum pernah mengajukan penyetoran sampah."}
            </p>
            {hasActiveFilter && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setBulanFilter("");
                }}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      ) : !error ? (
        <>
          {/* Desktop view */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="font-medium text-zinc-500 px-4 py-3">Kode Setor</th>
                  <th className="font-medium text-zinc-500 px-4 py-3">Tanggal</th>
                  <th className="font-medium text-zinc-500 px-4 py-3 text-right">Berat</th>
                  <th className="font-medium text-zinc-500 px-4 py-3 text-right">Poin</th>
                  <th className="font-medium text-zinc-500 px-4 py-3 text-center">Status</th>
                  <th className="font-medium text-zinc-500 px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
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
                    <td className="px-4 py-3 text-right text-zinc-900 tabular-nums">
                      {item.totalBeratKgReal !== null
                        ? `${item.totalBeratKgReal} kg`
                        : `${item.totalBeratKg} kg`}
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
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-3">
            {loading && 
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
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
            }
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:border-teal-300 transition-colors cursor-pointer space-y-3"
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
                    <span className="text-xs text-zinc-400 block mb-0.5">Berat</span>
                    <span className="font-medium text-zinc-900 tabular-nums">
                      {item.totalBeratKgReal !== null
                          ? `${item.totalBeratKgReal} kg`
                          : `${item.totalBeratKg} kg`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block mb-0.5">Poin</span>
                    <span className="font-medium text-teal-700 tabular-nums">
                      {item.totalPoinReal !== null
                          ? formatNumber(item.totalPoinReal)
                          : formatNumber(item.estimasiTotalPoin)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

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
