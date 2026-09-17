"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Coins,
  Scales,
  Recycle,
  Package,
  ClockCounterClockwise,
  Gift,
  Receipt,
  ArrowClockwise,
  ArrowRight,
  WarningCircle,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import type { SetorSampahItem } from "@/types/setor-sampah";

interface DashboardSummary {
  saldoPoinSaatIni: number;
  totalSampahDisetorKg: number;
  totalPoinDidapat: number;
  totalPoinDitukar: number;
}

const QUICK_ACTIONS = [
  {
    title: "Jenis Sampah & Poin",
    description: "Lihat daftar kategori sampah beserta nilai poin per kg",
    href: "/dashboard/nasabah/kategori-sampah",
    icon: Recycle,
  },
  {
    title: "Ajukan Penyetoran",
    description: "Ajukan penyetoran sampah untuk diverifikasi petugas",
    href: "/dashboard/nasabah/setor-sampah",
    icon: Package,
  },
  {
    title: "Status Pengajuan",
    description: "Pantau progres pengajuan setoran sampah Anda",
    href: "/dashboard/nasabah/status-pengajuan",
    icon: ClockCounterClockwise,
  },
  {
    title: "Saldo & Histori",
    description: "Lihat saldo poin dan riwayat transaksi bulanan",
    href: "/dashboard/nasabah/saldo-poin",
    icon: Coins,
  },
  {
    title: "Tukar Poin",
    description: "Tukarkan poin Anda dengan hadiah yang tersedia",
    href: "/dashboard/nasabah/tukar-poin",
    icon: Gift,
  },
  {
    title: "Cetak Bukti",
    description: "Cetak bukti atau nota transaksi setoran dan penukaran",
    href: "/dashboard/nasabah/cetak-bukti",
    icon: Receipt,
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

const formatWeight = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

async function loadSaldo() {
  const res = await fetch("/api/nasabah/dashboard/summary", {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal memuat data saldo");
  }
  return json.data as DashboardSummary;
}

async function loadSetor() {
  const res = await fetch("/api/nasabah/setor-sampah", {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal memuat data setoran");
  }
  const items: SetorSampahItem[] = json.data || [];
  const verified = items.filter(
    (item) => item.status === "selesai" || item.status === "diverifikasi",
  );
  const berat = verified.reduce(
    (acc, item) => acc + (item.totalBeratKgReal ?? item.totalBeratKg),
    0,
  );
  return {
    totalBerat: Math.round(berat * 100) / 100,
    totalTransaksi: verified.length,
  };
}

export default function NasabahOverviewPage() {
  const { user } = useAuth();
  const namaDisplay = user?.nasabah?.namaNasabah || "Nasabah";

  const [saldoData, setSaldoData] = useState<DashboardSummary | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(true);
  const [errorSaldo, setErrorSaldo] = useState("");
  const [saldoKey, setSaldoKey] = useState(0);

  const [totalBerat, setTotalBerat] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [loadingSetor, setLoadingSetor] = useState(true);
  const [errorSetor, setErrorSetor] = useState("");
  const [setorKey, setSetorKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSaldo(true);
      setErrorSaldo("");
      try {
        const data = await loadSaldo();
        if (!cancelled) setSaldoData(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setErrorSaldo(
            err instanceof Error ? err.message : "Gagal memuat data saldo",
          );
        }
      } finally {
        if (!cancelled) setLoadingSaldo(false);
      }
    })();
    return () => { cancelled = true; };
  }, [saldoKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSetor(true);
      setErrorSetor("");
      try {
        const result = await loadSetor();
        if (!cancelled) {
          setTotalBerat(result.totalBerat);
          setTotalTransaksi(result.totalTransaksi);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setErrorSetor(
            err instanceof Error ? err.message : "Gagal memuat data setoran",
          );
        }
      } finally {
        if (!cancelled) setLoadingSetor(false);
      }
    })();
    return () => { cancelled = true; };
  }, [setorKey]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6 md:p-8">
        <h1 className="text-2xl font-bold text-zinc-900 md:text-3xl">
          Selamat datang, {namaDisplay}!
        </h1>
        <p className="mt-2 text-zinc-600">
          Kelola setoran sampah, pantau poin, dan tukar hadiah dari sini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <Coins size={24} weight="fill" className="text-teal-600" />
            </div>
            <span className="text-sm font-medium text-zinc-500">
              Saldo Poin Saat Ini
            </span>
          </div>

          {loadingSaldo ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : errorSaldo ? (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <WarningCircle size={16} weight="fill" />
                <span>{errorSaldo}</span>
              </div>
              <button
                onClick={() => setSaldoKey((k) => k + 1)}
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                <ArrowClockwise size={14} />
                Coba lagi
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-4xl font-bold text-zinc-900">
                {formatNumber(saldoData?.saldoPoinSaatIni ?? 0)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">poin tersedia</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <Scales size={24} weight="fill" className="text-teal-600" />
            </div>
            <span className="text-sm font-medium text-zinc-500">
              Total Sampah Disetor
            </span>
          </div>

          {loadingSetor ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : errorSetor ? (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <WarningCircle size={16} weight="fill" />
                <span>{errorSetor}</span>
              </div>
              <button
                onClick={() => setSetorKey((k) => k + 1)}
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                <ArrowClockwise size={14} />
                Coba lagi
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-4xl font-bold text-zinc-900">
                {formatWeight(totalBerat)}{" "}
                <span className="text-xl font-semibold text-zinc-500">kg</span>
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                dari {totalTransaksi} setoran terverifikasi
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 transition-colors group-hover:bg-teal-100">
                  <Icon
                    size={22}
                    weight="fill"
                    className="text-teal-600"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900">
                    {action.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="mt-1 shrink-0 text-zinc-300 transition-colors group-hover:text-teal-500"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
