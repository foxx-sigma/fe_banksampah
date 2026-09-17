"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Funnel,
  CalendarBlank,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SetoranVerifyDialog from "@/components/admin/setoran/SetoranVerifyDialog";
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

export default function SetoranPage() {
  const [items, setItems] = useState<SetorSampahItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [bulanFilter, setBulanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        const res = await fetch(`/api/admin/setor-sampah${query}`, {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal mengambil data setoran.");
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

  function openDetail(id: string) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  function handleMutationSuccess() {
    setRefreshKey((k) => k + 1);
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Kelola Setoran Sampah
        </h1>
        <p className="font-sans text-zinc-500 text-sm">
          Verifikasi dan kelola pengajuan setoran sampah nasabah.
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
          {(statusFilter || bulanFilter) && (
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
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Kode Setor
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Nasabah
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Tanggal
                </th>
                <th className="text-right font-medium text-zinc-500 px-4 py-3">
                  Berat (kg)
                </th>
                <th className="text-right font-medium text-zinc-500 px-4 py-3">
                  Est. Poin
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
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-24 mx-auto rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-10 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-zinc-500 font-sans"
                  >
                    {statusFilter || bulanFilter
                      ? "Tidak ada setoran ditemukan untuk filter ini."
                      : "Belum ada data setoran."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    onClick={() => openDetail(item.id)}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {item.kodeSetor}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {item.nasabah.namaNasabah}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-900 tabular-nums">
                      {item.totalBeratKg}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-900 tabular-nums">
                      {item.estimasiTotalPoin}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[item.status]}`}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(item.id);
                          }}
                          className="p-2 text-zinc-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Detail / Verifikasi"
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

        {loading && items.length > 0 && (
          <div className="flex items-center justify-center py-3 border-t border-zinc-100">
            <LoadingSpinner size={20} />
          </div>
        )}
      </div>

      <SetoranVerifyDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedId(null);
        }}
        onSuccess={handleMutationSuccess}
        setoranId={selectedId}
      />
    </div>
  );
}
