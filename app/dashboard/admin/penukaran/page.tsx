"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Swap,
  CalendarBlank,
  Funnel,
  ArrowClockwise,
  Gift,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Dialog from "@/components/ui/Dialog";

type StatusPenukaran = "diproses" | "selesai";

interface PenukaranItem {
  id: string;
  kodePenukaran: string;
  tanggal: string;
  status: StatusPenukaran;
  poinDigunakan: number;
  catatan: string | null;
  nasabah: {
    id: string;
    namaNasabah: string;
    telp: string;
    saldoPoin: number;
  };
  hadiah: {
    id: string;
    namaHadiah: string;
    poinDibutuhkan: number;
  };
}

const STATUS_BADGE: Record<StatusPenukaran, string> = {
  diproses: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  selesai: "bg-teal-50 text-teal-700 border border-teal-200",
};

const STATUS_LABEL: Record<StatusPenukaran, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

export default function AdminPenukaranPage() {
  const [items, setItems] = useState<PenukaranItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [bulanFilter, setBulanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PenukaranItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (bulanFilter) params.set("bulan", bulanFilter);

        const query = params.toString() ? `?${params}` : "";
        const res = await fetch(`/api/admin/penukaran-poin${query}`, {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal memuat data penukaran poin.");
          setItems([]);
          return;
        }

        const data = json.data;
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && Array.isArray(data.items)) {
          setItems(data.items);
        } else if (data && Array.isArray(data.data)) {
          setItems(data.data);
        } else {
          setItems([]);
        }
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, bulanFilter, refreshKey]);

  const handleRetry = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  function openConfirm(item: PenukaranItem) {
    setSelectedItem(item);
    setUpdateError("");
    setConfirmDialogOpen(true);
  }

  async function handleSelesai() {
    if (!selectedItem) return;
    setUpdating(true);
    setUpdateError("");
    try {
      const res = await fetch(`/api/admin/penukaran-poin/status/${selectedItem.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "selesai" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setUpdateError(json.message || "Gagal memperbarui status penukaran.");
        return;
      }
      setConfirmDialogOpen(false);
      setSelectedItem(null);
      setRefreshKey((k) => k + 1);
    } catch {
      setUpdateError("Terjadi kesalahan saat memperbarui status.");
    } finally {
      setUpdating(false);
    }
  }

  const hasActiveFilter = statusFilter !== "" || bulanFilter !== "";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Penukaran Poin Hadiah
        </h1>
        <p className="font-sans text-zinc-500 text-sm">
          Kelola dan selesaikan penukaran hadiah yang diajukan oleh nasabah.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Funnel
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 pl-10 pr-8 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white appearance-none"
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
              className="rounded-lg border border-zinc-300 pl-10 pr-4 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
            />
          </div>
          {hasActiveFilter && (
            <button
              onClick={() => {
                setStatusFilter("");
                setBulanFilter("");
              }}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition"
            >
              Reset Filter
            </button>
          )}
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="ml-2 text-xs font-semibold underline hover:no-underline"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Kode Penukaran
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Nasabah
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Hadiah
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Tanggal
                </th>
                <th className="text-right font-medium text-zinc-500 px-4 py-3">
                  Poin
                </th>
                <th className="text-center font-medium text-zinc-500 px-4 py-3">
                  Status
                </th>
                <th className="text-center font-medium text-zinc-500 px-4 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-50">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-24 mx-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-zinc-500 font-sans"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                        <Gift size={24} className="text-zinc-400" />
                      </div>
                      <span>
                        {hasActiveFilter
                          ? "Tidak ada penukaran ditemukan untuk filter ini."
                          : "Belum ada transaksi penukaran poin."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {item.kodePenukaran}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-zinc-900 font-medium">
                          {item.nasabah.namaNasabah}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {item.nasabah.telp}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {item.hadiah.namaHadiah}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium tabular-nums">
                      {formatNumber(item.poinDigunakan)}
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
                        {item.status === "diproses" ? (
                          <button
                            onClick={() => openConfirm(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
                          >
                            <CheckCircle size={14} weight="fill" />
                            <span>Selesaikan</span>
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Lunas</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {loading && items.length > 0 && (
          <div className="flex items-center justify-center py-3 border-t border-zinc-100">
            <LoadingSpinner size={20} />
          </div>
        )}
      </div>

      {/* Dialog konfirmasi selesaikan penukaran */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => {
          if (!updating) {
            setConfirmDialogOpen(false);
            setSelectedItem(null);
            setUpdateError("");
          }
        }}
        className="max-w-md p-6"
      >
        {selectedItem && (
          <div className="space-y-4">
            <h2 className="font-heading font-semibold text-lg text-zinc-900">
              Selesaikan Penukaran Hadiah
            </h2>
            <p className="text-sm text-zinc-600">
              Konfirmasi bahwa hadiah sudah diserahkan kepada nasabah. Status penukaran
              akan diubah menjadi{" "}
              <span className="font-semibold text-teal-700">Selesai</span> dan tidak
              dapat diubah kembali.
            </p>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nasabah</span>
                <span className="font-medium text-zinc-900">
                  {selectedItem.nasabah.namaNasabah}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Hadiah</span>
                <span className="font-medium text-zinc-900">
                  {selectedItem.hadiah.namaHadiah}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Poin Ditukar</span>
                <span className="font-medium text-teal-700">
                  {formatNumber(selectedItem.poinDigunakan)} poin
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Kode</span>
                <span className="font-mono text-xs font-medium text-zinc-700">
                  {selectedItem.kodePenukaran}
                </span>
              </div>
            </div>

            {updateError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {updateError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setConfirmDialogOpen(false);
                  setSelectedItem(null);
                  setUpdateError("");
                }}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSelesai}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <LoadingSpinner size={16} />
                ) : (
                  <CheckCircle size={16} weight="fill" />
                )}
                {updating ? "Menyimpan..." : "Konfirmasi Selesai"}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
