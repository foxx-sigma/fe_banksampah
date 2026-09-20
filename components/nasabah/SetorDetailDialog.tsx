"use client";

import Dialog from "@/components/ui/Dialog";
import FallbackImage from "@/components/ui/FallbackImage";
import {
  ClockCounterClockwise,
  CheckCircle,
  XCircle,
  SealCheck,
  Scales,
  Coins,
  CalendarBlank,
  Tag,
  ChatText,
  Printer,
} from "@phosphor-icons/react";
import type { SetorSampahItem, StatusSetor } from "@/types/setor-sampah";

interface SetorDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: SetorSampahItem | null;
}

const STATUS_CONFIG: Record<
  StatusSetor,
  { label: string; badge: string; icon: typeof ClockCounterClockwise }
> = {
  menunggu_konfirmasi: {
    label: "Menunggu Konfirmasi",
    badge: "bg-zinc-100 text-zinc-700 border border-zinc-200",
    icon: ClockCounterClockwise,
  },
  diverifikasi: {
    label: "Diverifikasi",
    badge: "bg-zinc-100 text-zinc-700 border border-zinc-200",
    icon: CheckCircle,
  },
  selesai: {
    label: "Selesai",
    badge: "bg-teal-50 text-teal-700 border border-teal-200",
    icon: SealCheck,
  },
  ditolak: {
    label: "Ditolak",
    badge: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
  },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

const formatWeight = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export default function SetorDetailDialog({
  open,
  onClose,
  item,
}: SetorDetailDialogProps) {
  if (!item) return null;

  const handlePrint = () => {
    const title = "BUKTI SETORAN SAMPAH";
    const headerColor = "#0d9488"; // teal-600

    const itemsRows = item.detailSetor && item.detailSetor.length > 0
      ? item.detailSetor.map((d) => {
          const berat = d.beratKgReal !== null && d.beratKgReal !== undefined ? d.beratKgReal : d.beratKg;
          const subtotal = d.subtotalPoinReal !== null && d.subtotalPoinReal !== undefined ? d.subtotalPoinReal : d.subtotalPoin;
          return `
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px dashed #eee;">${d.kategoriSampah?.namaKategori || 'Sampah'}</td>
              <td style="padding: 6px 0; text-align: right; border-bottom: 1px dashed #eee;">${formatWeight(berat)} kg</td>
              <td style="padding: 6px 0; text-align: right; border-bottom: 1px dashed #eee;">${formatNumber(subtotal)} poin</td>
            </tr>
          `;
        }).join('')
      : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nota Transaksi - ${item.kodeSetor}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 24px;
            max-width: 420px;
            margin: 0 auto;
            color: #18181b;
            font-size: 13px;
            line-height: 1.5;
          }
          .header {
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 2px dashed #d4d4d8;
            padding-bottom: 16px;
          }
          .title {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            color: ${headerColor};
            letter-spacing: 0.5px;
          }
          .subtitle {
            font-size: 12px;
            color: #71717a;
            margin-top: 4px;
          }
          .info-table {
            width: 100%;
            margin-bottom: 14px;
          }
          .info-table td {
            padding: 3px 0;
          }
          .label {
            color: #71717a;
            width: 40%;
          }
          .value {
            font-weight: 600;
            text-align: right;
            color: #18181b;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 12px;
          }
          .items-table th {
            text-align: left;
            padding: 6px 0;
            border-bottom: 1px solid #e4e4e7;
            color: #71717a;
            font-weight: 600;
          }
          .items-table th:nth-child(2), .items-table th:nth-child(3) {
            text-align: right;
          }
          .summary-box {
            background: #f4f4f5;
            border-radius: 8px;
            padding: 12px;
            margin-top: 14px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .summary-row:last-child {
            margin-bottom: 0;
          }
          .highlight {
            font-size: 15px;
            font-weight: 700;
            color: ${headerColor};
          }
          .footer {
            text-align: center;
            margin-top: 24px;
            font-size: 11px;
            color: #a1a1aa;
            border-top: 2px dashed #d4d4d8;
            padding-top: 16px;
          }
          @media print {
            body { padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title}</h1>
          <p class="subtitle">Bank Sampah Digital</p>
        </div>
        
        <table class="info-table">
          <tr>
            <td class="label">No. Transaksi</td>
            <td class="value">${item.kodeSetor}</td>
          </tr>
          <tr>
            <td class="label">Waktu Transaksi</td>
            <td class="value">${formatDate(item.tanggal)}</td>
          </tr>
          <tr>
            <td class="label">Status</td>
            <td class="value" style="color: ${item.status === 'selesai' ? '#059669' : '#0284c7'};">
              ${item.status === 'selesai' ? 'Selesai' : 'Diverifikasi'}
            </td>
          </tr>
        </table>

        ${itemsRows ? `
        <div style="font-weight: 600; font-size: 12px; color: #71717a; margin-top: 10px;">Rincian Item Setoran:</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Berat</th>
              <th>Poin</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        ` : ''}

        <div class="summary-box">
          <div class="summary-row">
            <span style="color: #71717a;">Total Berat Real</span>
            <span style="font-weight: 600;">${formatWeight(item.totalBeratKgReal ?? item.totalBeratKg)} kg</span>
          </div>
          <div class="summary-row" style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e4e4e7;">
            <span class="highlight">Total Poin Diperoleh</span>
            <span class="highlight">+${formatNumber(item.totalPoinReal ?? item.estimasiTotalPoin)} Poin</span>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 4px 0;">Terima kasih atas kontribusi Anda menjaga lingkungan!</p>
          <p style="margin: 0;">Nota ini adalah bukti transaksi yang sah dari Bank Sampah.</p>
        </div>

        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 100);
          });
        </script>
      </body>
      </html>
    `;

    // Remove any existing print iframes
    const oldIframe = document.getElementById('print-receipt-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-receipt-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();
      
      // Secondary fallback to trigger print if onload doesn't fire inside iframe
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          // Ignore if already triggered
        }
      }, 300);

      // Clean up after 30 seconds
      setTimeout(() => {
        if (document.getElementById('print-receipt-iframe')) {
          iframe.remove();
        }
      }, 30000);
    }
  };

  const cfg = STATUS_CONFIG[item.status];
  const StatusIcon = cfg.icon;
  const hasTimbangUlang =
    item.totalBeratKgReal !== null && item.totalBeratKgReal !== item.totalBeratKg;
  const hasPoinReal =
    item.totalPoinReal !== null && item.totalPoinReal !== item.estimasiTotalPoin;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-3xl mx-4">
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900 pr-8">
            Detail Pengajuan
          </h2>
          <p className="text-sm text-zinc-500 tabular-nums">{item.kodeSetor}</p>
        </div>

        {/* Two-column layout for visual balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Photo */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-zinc-100/80 border border-zinc-200 shadow-sm flex items-center justify-center p-2">
              <FallbackImage
                src={
                  item.foto
                    ? item.foto.startsWith("http")
                      ? item.foto
                      : `${(process.env.NEXT_PUBLIC_BASE_API_URL ?? "").replace(/\/$/, "")}/${item.foto.replace(/^\//, "")}`
                    : undefined
                }
                alt="Foto bukti setoran"
                className="max-h-full max-w-full object-contain rounded-lg"
                fallbackClassName="flex h-full w-full items-center justify-center p-6"
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}
              >
                <StatusIcon size={14} weight="fill" />
                {cfg.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                  <CalendarBlank size={16} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Tanggal Pengajuan</p>
                  <p className="text-sm font-medium text-zinc-900">
                    {formatDate(item.tanggal)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                  <Scales size={16} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Berat Diajukan</p>
                  <p className="text-sm font-medium text-zinc-900 tabular-nums">
                    {item.totalBeratKg} kg
                  </p>
                  {hasTimbangUlang && (
                    <p className="text-xs text-teal-600 tabular-nums mt-0.5">
                      Hasil timbang: {item.totalBeratKgReal} kg
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                  <Coins size={16} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Estimasi Poin</p>
                  <p className="text-sm font-medium text-zinc-900 tabular-nums">
                    {formatNumber(item.estimasiTotalPoin)} poin
                  </p>
                  {hasPoinReal && (
                    <p className="text-xs text-teal-600 tabular-nums mt-0.5">
                      Poin final: {formatNumber(item.totalPoinReal!)} poin
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
</div>
        {item.detailSetor.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <Tag size={16} />
              Rincian Kategori Sampah
            </div>
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 overflow-hidden">
              {item.detailSetor.map((d) => {
                const hasItemReal =
                  d.beratKgReal !== null && d.beratKgReal !== d.beratKg;
                return (
                  <div
                    key={d.id}
                    className="px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {d.kategoriSampah.namaKategori}
                      </p>
                      <p className="text-xs text-zinc-500 tabular-nums">
                        {d.beratKg} kg
                        {hasItemReal && (
                          <span className="text-teal-600 ml-1">
                            (real: {d.beratKgReal} kg)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-zinc-900 tabular-nums">
                        {formatNumber(d.subtotalPoin)} poin
                      </p>
                      {d.subtotalPoinReal !== null &&
                        d.subtotalPoinReal !== d.subtotalPoin && (
                          <p className="text-xs text-teal-600 tabular-nums">
                            real: {formatNumber(d.subtotalPoinReal)} poin
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {item.catatanAdmin && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <ChatText size={16} />
              Catatan Admin
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <p className="text-sm text-zinc-700">{item.catatanAdmin}</p>
            </div>
          </div>
        )}

        {item.catatan && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <ChatText size={16} />
              Catatan Nasabah
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <p className="text-sm text-zinc-700">{item.catatan}</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100 flex gap-3 justify-end">
          {(item.status === 'selesai' || item.status === 'diverifikasi') && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
            >
              <Printer size={16} />
              <span>Cetak Nota</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Dialog>
  );
}
