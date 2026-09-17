"use client";

import { useState, useEffect } from "react";
import {
  Scales,
  CurrencyDollar,
  Coins,
  ArrowsCounterClockwise,
  CalendarBlank,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import type {
  RekapitulasiBulananResponse,
  BreakdownJenisItem,
} from "@/types/rekapitulasi";

const JENIS_LABELS: Record<string, string> = {
  plastik: "Plastik",
  kertas: "Kertas",
  logam: "Logam",
  kaca: "Kaca",
};

const JENIS_COLORS: Record<string, string> = {
  plastik: "bg-teal-600",
  kertas: "bg-teal-500",
  logam: "bg-teal-700",
  kaca: "bg-teal-400",
};

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatKg(value: number): string {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value)} kg`;
}

export default function RekapitulasiPage() {
  const [bulan, setBulan] = useState(getCurrentMonth);
  const [data, setData] = useState<RekapitulasiBulananResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/rekapitulasi?bulan=${bulan}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal mengambil data rekapitulasi.");
          setData(null);
          return;
        }

        setData(json.data as RekapitulasiBulananResponse);
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bulan]);

  const breakdown = data?.breakdownJenisSampah || {};
  const breakdownEntries = Object.entries(breakdown) as [string, BreakdownJenisItem][];
  const maxTonase = Math.max(...breakdownEntries.map(([, v]) => v.tonaseKg), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-3xl text-zinc-900">
            Rekapitulasi Bulanan
          </h1>
          <p className="font-sans text-zinc-500 text-sm">
            Rekap tonase sampah, estimasi pembayaran, dan penukaran poin per bulan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarBlank size={20} className="text-zinc-400" />
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6">
              <Skeleton className="h-5 w-48 mb-6" />
              <div className="flex items-end justify-around gap-2 h-[200px]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-full max-w-[60px] h-24" />
                ))}
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <Skeleton className="h-5 w-40 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-teal-500/10 text-teal-600 rounded-lg">
                <Scales size={28} weight="duotone" />
              </div>
              <div>
                <p className="text-zinc-500 font-sans text-sm mb-1">Total Tonase</p>
                <h3 className="font-heading font-semibold text-zinc-900 text-2xl tracking-wide">
                  {formatKg(data.rekapitulasiTonase.totalKg)}
                </h3>
                <p className="text-zinc-400 font-sans text-xs mt-2">
                  {formatNumber(data.rekapitulasiTonase.totalTon)} ton
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-teal-500/10 text-teal-600 rounded-lg">
                <CurrencyDollar size={28} weight="duotone" />
              </div>
              <div>
                <p className="text-zinc-500 font-sans text-sm mb-1">Estimasi Pembayaran</p>
                <h3 className="font-heading font-semibold text-zinc-900 text-2xl tracking-wide">
                  {formatRupiah(data.rekapitulasiTonase.totalEstimasiPembayaranRupiah)}
                </h3>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-teal-500/10 text-teal-600 rounded-lg">
                <Coins size={28} weight="duotone" />
              </div>
              <div>
                <p className="text-zinc-500 font-sans text-sm mb-1">Poin Diterbitkan</p>
                <h3 className="font-heading font-semibold text-zinc-900 text-2xl tracking-wide">
                  {formatNumber(data.rekapitulasiTonase.totalPoinDiterbitkan)}
                </h3>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-teal-500/10 text-teal-600 rounded-lg">
                <ArrowsCounterClockwise size={28} weight="duotone" />
              </div>
              <div>
                <p className="text-zinc-500 font-sans text-sm mb-1">Penukaran Poin</p>
                <h3 className="font-heading font-semibold text-zinc-900 text-2xl tracking-wide">
                  {formatNumber(data.rekapitulasiPenukaranPoin.totalTransaksiPenukaran)}
                </h3>
                <p className="text-zinc-400 font-sans text-xs mt-2">
                  {formatNumber(data.rekapitulasiPenukaranPoin.totalPoinTerpakai)} poin terpakai
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 flex flex-col min-h-[350px]">
              <h3 className="font-heading font-semibold text-lg text-zinc-900 mb-6">
                Tonase per Jenis Sampah
              </h3>
              <div className="flex-1 flex items-end justify-around gap-2 mt-auto pt-6 border-b border-zinc-200 pb-2 relative">
                <div className="absolute left-0 right-0 top-0 border-t border-dashed border-zinc-200/50" />
                <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-zinc-200/50" />
                {breakdownEntries.map(([jenis, item]) => {
                  const heightPercentage = (item.tonaseKg / maxTonase) * 100;
                  return (
                    <div key={jenis} className="flex flex-col items-center group relative w-full px-1 sm:px-2 md:px-4">
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-zinc-900 text-white text-xs py-1 px-2 rounded font-sans shadow-lg z-10 whitespace-nowrap">
                        {formatKg(item.tonaseKg)}
                      </div>
                      <div className="w-full flex justify-center h-[200px] items-end">
                        <div
                          className={`w-full max-w-[60px] rounded-t-sm transition-all duration-500 ease-in-out ${JENIS_COLORS[jenis] || "bg-teal-500"} hover:brightness-110`}
                          style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                        />
                      </div>
                      <span className="text-zinc-600 font-sans text-xs mt-3 truncate w-full text-center">
                        {JENIS_LABELS[jenis] || jenis}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h3 className="font-heading font-semibold text-lg text-zinc-900 mb-4">
                Rincian per Jenis
              </h3>
              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                      <th className="text-left font-medium text-zinc-500 px-3 py-2">Jenis</th>
                      <th className="text-right font-medium text-zinc-500 px-3 py-2">Kg</th>
                      <th className="text-right font-medium text-zinc-500 px-3 py-2">Rupiah</th>
                      <th className="text-right font-medium text-zinc-500 px-3 py-2">Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownEntries.map(([jenis, item]) => (
                      <tr key={jenis} className="border-b border-zinc-50">
                        <td className="px-3 py-2 font-medium text-zinc-900">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${JENIS_COLORS[jenis] || "bg-teal-500"}`} />
                            {JENIS_LABELS[jenis] || jenis}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-600 tabular-nums">
                          {formatKg(item.tonaseKg)}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-600 tabular-nums">
                          {formatRupiah(item.rupiah)}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-600 tabular-nums">
                          {formatNumber(item.poin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-200 bg-zinc-50/50">
                      <td className="px-3 py-2 font-medium text-zinc-700">Total</td>
                      <td className="px-3 py-2 text-right font-medium text-zinc-900 tabular-nums">
                        {formatKg(data.rekapitulasiTonase.totalKg)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-zinc-900 tabular-nums">
                        {formatRupiah(data.rekapitulasiTonase.totalEstimasiPembayaranRupiah)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-zinc-900 tabular-nums">
                        {formatNumber(data.rekapitulasiTonase.totalPoinDiterbitkan)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : !error ? (
        <div className="text-center py-12 text-zinc-500 font-sans">
          Tidak ada data rekapitulasi untuk bulan ini.
        </div>
      ) : null}
    </div>
  );
}
