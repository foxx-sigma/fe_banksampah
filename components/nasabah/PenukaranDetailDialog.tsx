"use client";

import Dialog from "@/components/ui/Dialog";
import {
  ClockCounterClockwise,
  SealCheck,
  Coins,
  CalendarBlank,
  Gift,
  Printer,
  ChatText,
} from "@phosphor-icons/react";

export interface PenukaranDetailItem {
  id: string;
  kode: string;
  tanggal: string;
  status: "diproses" | "selesai";
  namaHadiah: string;
  poin: number;
  catatan?: string | null;
}

interface PenukaranDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: PenukaranDetailItem | null;
}

const STATUS_CONFIG = {
  diproses: {
    label: "Sedang Diproses",
    badge: "bg-zinc-100 text-zinc-700 border border-zinc-200",
    icon: ClockCounterClockwise,
  },
  selesai: {
    label: "Selesai",
    badge: "bg-teal-50 text-teal-700 border border-teal-200",
    icon: SealCheck,
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

export default function PenukaranDetailDialog({
  open,
  onClose,
  item,
}: PenukaranDetailDialogProps) {
  if (!item) return null;

  const handlePrint = () => {
    const title = "BUKTI PENUKARAN HADIAH";
    const headerColor = "#0d9488"; // teal-600

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nota Penukaran - ${item.kode}</title>
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
            padding: 4px 0;
          }
          .label {
            color: #71717a;
            width: 42%;
          }
          .value {
            font-weight: 600;
            text-align: right;
            color: #18181b;
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
            color: #dc2626;
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
            <td class="value">${item.kode}</td>
          </tr>
          <tr>
            <td class="label">Waktu Transaksi</td>
            <td class="value">${formatDate(item.tanggal)}</td>
          </tr>
          <tr>
            <td class="label">Hadiah yang Ditukar</td>
            <td class="value">${item.namaHadiah}</td>
          </tr>
          <tr>
            <td class="label">Status</td>
            <td class="value" style="color: ${item.status === 'selesai' ? '#0d9488' : '#71717a'};">
              ${item.status === 'selesai' ? 'Selesai' : 'Sedang Diproses'}
            </td>
          </tr>
        </table>

        <div class="summary-box">
          <div class="summary-row">
            <span style="color: #71717a;">Poin Dikeluarkan</span>
            <span class="highlight">-${formatNumber(item.poin)} Poin</span>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 4px 0;">Tunjukkan nota ini kepada admin/petugas untuk pengambilan hadiah fisik.</p>
          <p style="margin: 0;">Nota ini adalah bukti penukaran poin yang sah.</p>
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

    const oldIframe = document.getElementById('print-receipt-iframe');
    if (oldIframe) oldIframe.remove();

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
      
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {}
      }, 300);

      setTimeout(() => {
        if (document.getElementById('print-receipt-iframe')) {
          iframe.remove();
        }
      }, 30000);
    }
  };

  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.diproses;
  const StatusIcon = cfg.icon;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg mx-4">
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900 pr-8">
            Detail Penukaran Hadiah
          </h2>
          <p className="text-sm text-zinc-500 tabular-nums">{item.kode}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}
            >
              <StatusIcon size={14} weight="fill" />
              {cfg.label}
            </span>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <Gift size={20} weight="fill" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Hadiah yang Ditukar</p>
                <p className="font-semibold text-zinc-900 text-base">
                  {item.namaHadiah}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <CalendarBlank size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Tanggal Penukaran</p>
                <p className="font-medium text-zinc-800 text-sm">
                  {formatDate(item.tanggal)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <Coins size={20} weight="fill" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Poin Dikeluarkan</p>
                <p className="font-semibold text-red-600 text-sm tabular-nums">
                  -{formatNumber(item.poin)} Poin
                </p>
              </div>
            </div>

            {item.catatan && (
              <div className="flex items-start gap-3 pt-2 border-t border-zinc-200">
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-500 shrink-0">
                  <ChatText size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Catatan</p>
                  <p className="text-sm text-zinc-700">{item.catatan}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
          >
            <Printer size={16} />
            <span>Cetak Nota</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Dialog>
  );
}
