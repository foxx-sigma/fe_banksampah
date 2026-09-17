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
  ImageSquare,
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
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: ClockCounterClockwise,
  },
  diverifikasi: {
    label: "Diverifikasi",
    badge: "bg-sky-50 text-sky-700 border border-sky-200",
    icon: CheckCircle,
  },
  selesai: {
    label: "Selesai",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: SealCheck,
  },
  ditolak: {
    label: "Ditolak",
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
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

export default function SetorDetailDialog({
  open,
  onClose,
  item,
}: SetorDetailDialogProps) {
  if (!item) return null;

  const cfg = STATUS_CONFIG[item.status];
  const StatusIcon = cfg.icon;
  const hasTimbangUlang =
    item.totalBeratKgReal !== null && item.totalBeratKgReal !== item.totalBeratKg;
  const hasPoinReal =
    item.totalPoinReal !== null && item.totalPoinReal !== item.estimasiTotalPoin;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg mx-4">
      <div className="p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900 pr-8">
            Detail Pengajuan
          </h2>
          <p className="text-sm text-zinc-500 tabular-nums">{item.kodeSetor}</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}
          >
            <StatusIcon size={14} weight="fill" />
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <ImageSquare size={16} />
            Foto Bukti
          </div>
          <div className="rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 h-52">
            <FallbackImage
              src={item.foto || undefined}
              alt="Foto bukti setoran"
              className="w-full h-full object-contain"
              fallbackClassName="flex h-full w-full items-center justify-center p-6"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
        >
          Tutup
        </button>
      </div>
    </Dialog>
  );
}
