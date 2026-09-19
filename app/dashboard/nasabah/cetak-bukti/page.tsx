"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Receipt,
  Funnel,
  Printer,
  CalendarBlank,
  ArrowClockwise,
  Package,
  Gift,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";

interface TransaksiItem {
  id: string;
  kode: string;
  tanggal: string;
  tipe: "setoran" | "penukaran";
  status: string;
  berat?: number;
  poin: number;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

const formatWeight = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export default function CetakBuktiPage() {
  const [items, setItems] = useState<TransaksiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipeFilter, setTipeFilter] = useState("");
  const [bulanFilter, setBulanFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [cetakUrl, setCetakUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch both setoran and penukaran
        const params = new URLSearchParams();
        if (bulanFilter) params.set("bulan", bulanFilter);
        const query = params.toString() ? `?${params}` : "";

        let setoranData: Array<unknown> = [];
        let penukaranData: Array<unknown> = [];

        if (!tipeFilter || tipeFilter === "setoran") {
          const res1 = await fetch(`/api/nasabah/setor-sampah${query}`, { credentials: "include" });
          const json1 = await res1.json();
          if (res1.ok && json1.success) {
            setoranData = Array.isArray(json1.data?.items) ? json1.data.items : 
                         Array.isArray(json1.data) ? json1.data : [];
          }
        }

        if (!tipeFilter || tipeFilter === "penukaran") {
          const res2 = await fetch(`/api/nasabah/penukaran-poin/my-penukaran${query}`, { credentials: "include" });
          const json2 = await res2.json();
          if (res2.ok && json2.success) {
            penukaranData = Array.isArray(json2.data?.items) ? json2.data.items : 
                           Array.isArray(json2.data) ? json2.data : [];
          }
        }

        if (cancelled) return;

        // Valid transactions that can be printed are those that are finished/verified
        const mappedSetoran: TransaksiItem[] = setoranData
          .filter(item => item.status === "selesai" || item.status === "diverifikasi")
          .map(item => ({
            id: item.id,
            kode: item.kodeSetor,
            tanggal: item.tanggal,
            tipe: "setoran",
            status: item.status,
            berat: item.totalBeratKgReal ?? item.totalBeratKg,
            poin: item.totalPoinReal ?? item.estimasiTotalPoin,
          }));

        const mappedPenukaran: TransaksiItem[] = penukaranData
          .filter(item => item.status === "selesai")
          .map(item => ({
            id: item.id,
            kode: item.kodePenukaran,
            tanggal: item.tanggal,
            tipe: "penukaran",
            status: item.status,
            poin: item.poinDigunakan,
          }));

        const combined = [...mappedSetoran, ...mappedPenukaran].sort(
          (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        );

        setItems(combined);
      } catch {
        if (!cancelled) setError("Terjadi kesalahan jaringan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tipeFilter, bulanFilter, refreshKey]);

  const handleRetry = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Improved printing using iframe instead of document.write to avoid pop-up blockers
  const handlePrint = (item: TransaksiItem) => {
    const isSetoran = item.tipe === "setoran";
    const title = isSetoran ? "Bukti Setoran Sampah" : "Bukti Penukaran Poin";
    const headerColor = isSetoran ? "#0d9488" : "#d97706"; // teal-600 vs amber-600
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nota Transaksi - ${item.kode}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; color: #333; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 20px; }
          .title { font-size: 18px; font-weight: bold; margin: 0; color: ${headerColor}; }
          .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .label { color: #666; }
          .value { font-weight: bold; text-align: right; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; border-top: 2px dashed #ccc; padding-top: 20px; }
          .highlight { font-size: 18px; color: ${headerColor}; margin-top: 15px; }
          @media print {
            body { padding: 0; max-width: 100%; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title}</h1>
          <p class="subtitle">Bank Sampah Digital</p>
        </div>
        <div class="content">
          <div class="row">
            <span class="label">No. Transaksi</span>
            <span class="value">${item.kode}</span>
          </div>
          <div class="row">
            <span class="label">Waktu</span>
            <span class="value">${formatDate(item.tanggal)}</span>
          </div>
          <div class="row">
            <span class="label">Status</span>
            <span class="value">${item.status === 'selesai' ? 'Tuntas / Selesai' : 'Diverifikasi'}</span>
          </div>
          
          ${isSetoran ? `
          <div class="row highlight border-none">
            <span class="label">Total Berat</span>
            <span class="value">${formatWeight(item.berat || 0)} kg</span>
          </div>
          <div class="row highlight border-none" style="margin-top: 5px;">
            <span class="label">Poin Diterima</span>
            <span class="value">+${formatNumber(item.poin)} Poin</span>
          </div>
          ` : `
          <div class="row highlight border-none">
            <span class="label">Poin Ditukar</span>
            <span class="value">-${formatNumber(item.poin)} Poin</span>
          </div>
          `}
        </div>
        <div class="footer">
          <p>Terima kasih telah berpartisipasi menjaga bumi!</p>
          <p>Simpan nota ini sebagai bukti transaksi yang sah.</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: ${headerColor}; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Cetak Nota</button>
        </div>
      </body>
      </html>
    `;

    // Use iframe approach instead of window.open + document.write to avoid pop-up blockers
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '600px';
    iframe.style.height = '600px';
    iframe.style.zIndex = '9999';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(printContent);
    iframe.contentWindow?.document.close();
    
    // Focus the iframe and trigger print
    iframe.contentWindow?.focus();
    
    // Remove iframe after printing (with timeout to ensure print dialog is open)
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Cetak Bukti Transaksi
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Unduh atau cetak struk untuk transaksi setoran dan penukaran yang telah selesai.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Funnel
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <select
                value={tipeFilter}
                onChange={(e) => setTipeFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-zinc-300 pl-10 pr-8 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white appearance-none"
              >
                <option value="">Semua Tipe Transaksi</option>
                <option value="setoran">Setoran Sampah</option>
                <option value="penukaran">Penukaran Hadiah</option>
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
            
            {(tipeFilter || bulanFilter) && (
              <button
                onClick={() => {
                  setTipeFilter("");
                  setBulanFilter("");
                }}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="font-medium text-zinc-500 px-4 py-3">Tipe</th>
                <th className="font-medium text-zinc-500 px-4 py-3">Kode Transaksi</th>
                <th className="font-medium text-zinc-500 px-4 py-3">Waktu Selesai</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-right">Nilai Poin</th>
                <th className="font-medium text-zinc-500 px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-50">
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-24 mx-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-500 font-sans">
                    {tipeFilter || bulanFilter
                      ? "Tidak ada transaksi ditemukan untuk filter tersebut."
                      : "Belum ada riwayat transaksi yang dapat dicetak."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {item.tipe === "setoran" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-700">
                          <Package size={14} weight="fill" /> Setoran
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700">
                          <Gift size={14} weight="fill" /> Penukaran
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {item.kode}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.tipe === "setoran" ? (
                        <span className="text-teal-600 font-semibold tabular-nums">+{formatNumber(item.poin)}</span>
                      ) : (
                        <span className="text-amber-600 font-semibold tabular-nums">-{formatNumber(item.poin)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handlePrint(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition shadow-sm"
                        >
                          <Printer size={16} />
                          <span>Cetak</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
