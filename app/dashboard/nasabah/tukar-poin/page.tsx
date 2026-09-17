"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gift,
  Coins,
  ArrowClockwise,
  Package,
  Warning,
  CheckCircle,
  SpinnerGap,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import FallbackImage from "@/components/ui/FallbackImage";
import Dialog from "@/components/ui/Dialog";
import type { HadiahItem } from "@/types/hadiah";

interface DashboardSummary {
  saldoPoinSaatIni: number;
  totalSampahDisetorKg: number;
  totalPoinDidapat: number;
  totalPoinDitukar: number;
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

export default function TukarPoinPage() {
  const [hadiahList, setHadiahList] = useState<HadiahItem[]>([]);
  const [saldoPoin, setSaldoPoin] = useState<number>(0);
  const [loadingHadiah, setLoadingHadiah] = useState(true);
  const [loadingSaldo, setLoadingSaldo] = useState(true);
  const [errorHadiah, setErrorHadiah] = useState("");
  const [errorSaldo, setErrorSaldo] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedHadiah, setSelectedHadiah] = useState<HadiahItem | null>(null);
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSaldo(true);
      setErrorSaldo("");
      try {
        const res = await fetch("/api/nasabah/dashboard/summary", {
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setErrorSaldo(json.message || "Gagal mengambil data saldo.");
          return;
        }
        const data = json.data as DashboardSummary;
        setSaldoPoin(data.saldoPoinSaatIni ?? 0);
      } catch {
        if (!cancelled) setErrorSaldo("Terjadi kesalahan jaringan.");
      } finally {
        if (!cancelled) setLoadingSaldo(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingHadiah(true);
      setErrorHadiah("");
      try {
        const res = await fetch("/api/nasabah/hadiah", {
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setErrorHadiah(json.message || "Gagal mengambil data hadiah.");
          setHadiahList([]);
          return;
        }
        const data = json.data;
        if (Array.isArray(data)) {
          setHadiahList(data);
        } else if (data && Array.isArray(data.items)) {
          setHadiahList(data.items);
        } else if (data && Array.isArray(data.data)) {
          setHadiahList(data.data);
        } else {
          setHadiahList([]);
        }
      } catch {
        if (!cancelled) {
          setErrorHadiah("Terjadi kesalahan jaringan.");
          setHadiahList([]);
        }
      } finally {
        if (!cancelled) setLoadingHadiah(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleRetry = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const openConfirmDialog = (hadiah: HadiahItem) => {
    setSelectedHadiah(hadiah);
    setCatatan("");
    setSubmitError("");
    setConfirmOpen(true);
  };

  const handleTukar = async () => {
    if (!selectedHadiah) return;
    if (saldoPoin < selectedHadiah.poinDibutuhkan) {
      setSubmitError("Saldo poin Anda tidak mencukupi untuk penukaran ini.");
      return;
    }
    if (selectedHadiah.stok <= 0) {
      setSubmitError("Stok hadiah ini sudah habis.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/nasabah/penukaran-poin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hadiahId: selectedHadiah.id,
          ...(catatan.trim() ? { catatan: catatan.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setSubmitError(json.message || "Gagal mengajukan penukaran poin.");
        return;
      }

      setConfirmOpen(false);
      setSuccessMessage(
        `Penukaran "${selectedHadiah.namaHadiah}" berhasil diajukan! Silakan ambil hadiah di unit Bank Sampah.`,
      );
      setSuccessOpen(true);
      setRefreshKey((k) => k + 1);
    } catch {
      setSubmitError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const getButtonState = (hadiah: HadiahItem) => {
    if (hadiah.stok <= 0) {
      return { disabled: true, label: "Stok Habis", reason: "" };
    }
    if (saldoPoin < hadiah.poinDibutuhkan) {
      const selisih = hadiah.poinDibutuhkan - saldoPoin;
      return {
        disabled: true,
        label: "Poin Tidak Cukup",
        reason: `Kurang ${formatNumber(selisih)} poin`,
      };
    }
    return { disabled: false, label: "Tukar Poin", reason: "" };
  };

  const loading = loadingHadiah || loadingSaldo;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Tukar Poin dengan Hadiah
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Tukarkan poin yang sudah terkumpul dengan hadiah menarik yang tersedia.
        </p>
      </div>

      {loadingSaldo ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-40" />
            </div>
          </div>
        </div>
      ) : errorSaldo ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Warning size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">{errorSaldo}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
            >
              <ArrowClockwise size={14} weight="bold" />
              Coba Lagi
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Coins size={24} weight="fill" className="text-white" />
            </div>
            <div>
              <p className="text-teal-100 text-sm font-sans">Saldo Poin Anda Saat Ini</p>
              <p className="text-white text-2xl font-bold tabular-nums">
                {formatNumber(saldoPoin)} <span className="text-base font-normal text-teal-200">poin</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {errorHadiah && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Package size={24} className="text-red-500" />
            </div>
            <p className="text-red-700 text-sm font-medium">{errorHadiah}</p>
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
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : !errorHadiah && hadiahList.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
              <Gift size={28} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 text-sm font-sans">
              Belum ada hadiah yang tersedia saat ini.
            </p>
          </div>
        </div>
      ) : !errorHadiah ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hadiahList.map((hadiah) => {
            const btn = getButtonState(hadiah);
            return (
              <div
                key={hadiah.id}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-44 bg-zinc-50 border-b border-zinc-100">
                  <FallbackImage
                    src={hadiah.foto || undefined}
                    alt={hadiah.namaHadiah}
                    className="h-full w-full object-cover"
                    fallbackClassName="flex h-full w-full items-center justify-center p-6"
                  />
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <h3 className="font-medium text-zinc-900 text-base">
                    {hadiah.namaHadiah}
                  </h3>

                  {hadiah.deskripsi && (
                    <p className="text-zinc-500 text-sm line-clamp-2">
                      {hadiah.deskripsi}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1.5">
                      <Coins size={16} weight="fill" className="text-teal-600 shrink-0" />
                      <span className="font-semibold text-teal-700 text-sm tabular-nums">
                        {formatNumber(hadiah.poinDibutuhkan)}
                      </span>
                      <span className="text-teal-600 text-xs">poin</span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                        hadiah.stok > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      Stok: {hadiah.stok > 0 ? hadiah.stok : "Habis"}
                    </span>
                  </div>

                  <div className="mt-auto pt-1">
                    <button
                      disabled={btn.disabled || loadingSaldo}
                      onClick={() => openConfirmDialog(hadiah)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                        btn.disabled || loadingSaldo
                          ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                      }`}
                    >
                      <Gift size={18} weight={btn.disabled ? "regular" : "fill"} />
                      {btn.label}
                    </button>
                    {btn.reason && (
                      <p className="text-xs text-zinc-400 text-center mt-1.5">
                        {btn.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <Dialog
        open={confirmOpen}
        onClose={() => { if (!submitting) setConfirmOpen(false); }}
        className="max-w-md mx-4 sm:mx-auto"
      >
        {selectedHadiah && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                <Gift size={24} className="text-teal-600" />
              </div>
              <h2 className="font-heading font-semibold text-lg text-zinc-900">
                Konfirmasi Penukaran
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Yakin ingin menukarkan poin Anda dengan hadiah ini?
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                  <FallbackImage
                    src={selectedHadiah.foto || undefined}
                    alt={selectedHadiah.namaHadiah}
                    className="h-full w-full object-cover"
                    fallbackClassName="flex h-full w-full items-center justify-center p-1"
                  />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 text-sm">{selectedHadiah.namaHadiah}</p>
                  <p className="text-xs text-zinc-500">Stok tersisa: {selectedHadiah.stok}</p>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Saldo poin saat ini</span>
                  <span className="font-medium text-zinc-900 tabular-nums">{formatNumber(saldoPoin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Poin yang ditukar</span>
                  <span className="font-medium text-red-600 tabular-nums">-{formatNumber(selectedHadiah.poinDibutuhkan)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2">
                  <span className="text-zinc-500">Estimasi sisa saldo</span>
                  <span className="font-semibold text-teal-700 tabular-nums">
                    {formatNumber(saldoPoin - selectedHadiah.poinDibutuhkan)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="catatan" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Catatan <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Mis: Tolong siapkan warna hitam jika tersedia"
                maxLength={200}
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition resize-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
                <Warning size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleTukar}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <SpinnerGap size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Konfirmasi Tukar"
                )}
              </button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        className="max-w-sm mx-4 sm:mx-auto"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle size={32} weight="fill" className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-zinc-900">
              Penukaran Berhasil
            </h2>
            <p className="text-sm text-zinc-500 mt-2">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessOpen(false)}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
          >
            Tutup
          </button>
        </div>
      </Dialog>
    </div>
  );
}
