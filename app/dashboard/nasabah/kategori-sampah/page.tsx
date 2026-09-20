"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MagnifyingGlass,
  Funnel,
  Coins,
  ArrowClockwise,
  Package,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import FallbackImage from "@/components/ui/FallbackImage";
import type {
  KategoriSampahItem,
  JenisSampah,
} from "@/types/kategori-sampah";

const JENIS_BADGE: Record<JenisSampah, string> = {
  plastik: "bg-teal-50 text-teal-700 border-teal-200",
  kertas: "bg-amber-50 text-amber-700 border-amber-200",
  logam: "bg-slate-100 text-slate-700 border-slate-200",
  kaca: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const JENIS_LABEL: Record<JenisSampah, string> = {
  plastik: "Plastik",
  kertas: "Kertas",
  logam: "Logam",
  kaca: "Kaca",
};

const JENIS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Jenis" },
  { value: "plastik", label: "Plastik" },
  { value: "kertas", label: "Kertas" },
  { value: "logam", label: "Logam" },
  { value: "kaca", label: "Kaca" },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function KategoriSampahNasabahPage() {
  const [allItems, setAllItems] = useState<KategoriSampahItem[]>([]);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/nasabah/kategori-sampah", {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal mengambil data kategori sampah.");
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
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleRetry = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const filteredItems = useMemo(() => {
    let result = allItems;

    if (jenisFilter) {
      result = result.filter((item) => item.jenis === jenisFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) =>
        item.namaKategori.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allItems, search, jenisFilter]);

  const hasActiveFilter = search.trim() !== "" || jenisFilter !== "";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Daftar Jenis Sampah & Poin
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Lihat kategori sampah yang bisa disetorkan beserta nilai poin per kilogram.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kategori..."
            className="w-full rounded-lg border border-zinc-300 pl-10 pr-4 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
        <div className="relative">
          <Funnel
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 pl-10 pr-8 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white appearance-none"
          >
            {JENIS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm"
            >
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : !error && filteredItems.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
              <Package size={28} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 text-sm font-sans">
              {hasActiveFilter
                ? "Tidak ada kategori sampah yang cocok dengan pencarian."
                : "Belum ada data kategori sampah."}
            </p>
            {hasActiveFilter && (
              <button
                onClick={() => {
                  setSearch("");
                  setJenisFilter("");
                }}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      ) : !error ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-44 bg-zinc-50/80 border-b border-zinc-100 flex items-center justify-center p-2">
                <FallbackImage
                  src={item.foto || undefined}
                  alt={item.namaKategori}
                  className="max-h-full max-w-full object-contain rounded-lg"
                  fallbackClassName="flex h-full w-full items-center justify-center p-6"
                />
              </div>

              <div className="p-4 space-y-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${JENIS_BADGE[item.jenis] || "bg-zinc-100 text-zinc-700 border-zinc-200"}`}
                >
                  {JENIS_LABEL[item.jenis] || item.jenis}
                </span>

                <h3 className="font-medium text-zinc-900 text-base">
                  {item.namaKategori}
                </h3>

                <p className="text-zinc-500 text-sm">
                  Harga: {formatRupiah(item.hargaPerKg)}/Kg
                </p>

                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
                  <Coins size={20} weight="fill" className="text-teal-600 shrink-0" />
                  <span className="font-semibold text-teal-700 text-lg tabular-nums">
                    {formatNumber(item.poinPerKg)}
                  </span>
                  <span className="text-teal-600 text-sm">poin/Kg</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
