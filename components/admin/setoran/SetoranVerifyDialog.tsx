"use client";

import { useState, useEffect } from "react";
import Dialog from "@/components/ui/Dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Skeleton from "@/components/ui/Skeleton";
import FallbackImage from "@/components/ui/FallbackImage";
import type {
  SetorSampahItem,
  StatusSetor,
  VerifySetorPayload,
} from "@/types/setor-sampah";

interface SetoranVerifyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  setoranId: string | null;
}

const STATUS_OPTIONS: { value: StatusSetor; label: string }[] = [
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

export default function SetoranVerifyDialog({
  open,
  onClose,
  onSuccess,
  setoranId,
}: SetoranVerifyDialogProps) {
  const [detail, setDetail] = useState<SetorSampahItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");

  const [selectedStatus, setSelectedStatus] = useState<StatusSetor>("diverifikasi");
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [itemsReal, setItemsReal] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function resetState() {
    setDetail(null);
    setErrorDetail("");
    setSelectedStatus("diverifikasi");
    setCatatanAdmin("");
    setItemsReal({});
    setSubmitError("");
  }

  useEffect(() => {
    if (!open || !setoranId) return;

    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      setErrorDetail("");
      try {
        const res = await fetch(`/api/admin/setor-sampah/${setoranId}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok || !json.success) {
          setErrorDetail(json.message || "Gagal mengambil detail setoran.");
          return;
        }

        const data = json.data as SetorSampahItem;
        setDetail(data);
        setCatatanAdmin(data.catatanAdmin || "");

        const realMap: Record<string, string> = {};
        for (const d of data.detailSetor) {
          realMap[d.kategoriSampahId] =
            d.beratKgReal !== null && d.beratKgReal !== undefined
              ? String(d.beratKgReal)
              : String(d.beratKg);
        }
        setItemsReal(realMap);
      } catch {
        if (!cancelled) setErrorDetail("Terjadi kesalahan jaringan.");
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, setoranId]);

  function handleClose() {
    resetState();
    onClose();
  }

  const isFinal =
    detail?.status === "selesai" || detail?.status === "ditolak";

  function handleBeratChange(kategoriSampahId: string, value: string) {
    setItemsReal((prev) => ({ ...prev, [kategoriSampahId]: value }));
  }

  async function handleSubmit() {
    if (!detail) return;
    setSubmitError("");

    if (selectedStatus === "ditolak" && !catatanAdmin.trim()) {
      setSubmitError("Catatan admin wajib diisi saat menolak setoran.");
      return;
    }

    const payload: VerifySetorPayload = {
      status: selectedStatus,
      catatanAdmin: catatanAdmin.trim() || undefined,
    };

    if (selectedStatus !== "ditolak") {
      payload.itemsReal = detail.detailSetor.map((d) => ({
        kategoriSampahId: d.kategoriSampahId,
        beratKgReal: parseFloat(itemsReal[d.kategoriSampahId] || "0") || 0,
      }));
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/setor-sampah/${detail.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setSubmitError(json.message || "Gagal memverifikasi setoran.");
        return;
      }

      onSuccess();
      handleClose();
    } catch {
      setSubmitError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const calcTotalReal = () => {
    if (!detail) return { berat: 0, poin: 0 };
    let berat = 0;
    let poin = 0;
    for (const d of detail.detailSetor) {
      const real = parseFloat(itemsReal[d.kategoriSampahId] || "0") || 0;
      berat += real;
      poin += Math.round(real * d.poinPerKg);
    }
    return { berat: Number(berat.toFixed(2)), poin };
  };

  const totals = detail ? calcTotalReal() : { berat: 0, poin: 0 };

   return (
     <Dialog open={open} onClose={handleClose} className="max-w-3xl mx-4">
       <div className="p-6">
         <h2 className="font-heading font-semibold text-xl text-zinc-900 mb-4">
           Detail Setoran
         </h2>

         {loadingDetail ? (
           <div className="space-y-4">
             <Skeleton className="h-5 w-48" />
             <Skeleton className="h-4 w-36" />
             <Skeleton className="h-32 w-full" />
           </div>
         ) : errorDetail ? (
           <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
             {errorDetail}
           </div>
         ) : detail ? (
           <div className="space-y-6">
             {/* Two-column layout for visual balance */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Left: Photo */}
               <div className="flex flex-col items-center">
                 <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm">
                   {detail.foto ? (
                     <FallbackImage
                       src={`${process.env.NEXT_PUBLIC_BASE_API_URL}/${detail.foto}`}
                       alt="Foto Setoran"
                       className="w-full h-full object-cover"
                       fallbackClassName="flex items-center justify-center p-6"
                     />
                   ) : (
                     <div className="flex items-center justify-center h-full p-6 text-zinc-400">
                       <span className="text-center">Tidak ada foto</span>
                     </div>
                   )}
                 </div>
               </div>

               {/* Right: Details */}
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                   <div>
                     <span className="text-zinc-500">Kode Setor</span>
                     <p className="font-medium text-zinc-900">{detail.kodeSetor}</p>
                   </div>
                   <div>
                     <span className="text-zinc-500">Nasabah</span>
                     <p className="font-medium text-zinc-900">
                       {detail.nasabah.namaNasabah}
                     </p>
                   </div>
                   <div>
                     <span className="text-zinc-500">Tanggal</span>
                     <p className="font-medium text-zinc-900">
                       {formatDate(detail.tanggal)}
                     </p>
                   </div>
                   <div>
                     <span className="text-zinc-500">Status</span>
                     <p>
                       <span
                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[detail.status]}`}
                       >
                         {STATUS_LABEL[detail.status]}
                       </span>
                     </p>
                   </div>
                 </div>

                 {detail.catatan && (
                   <div className="pt-3 border-t border-zinc-100">
                     <span className="text-zinc-500 block mb-1">Catatan Nasabah</span>
                     <p className="text-zinc-700 text-sm">{detail.catatan}</p>
                   </div>
                 )}

                 <div className="pt-3 border-t border-zinc-100">
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                     <div>
                       <span className="text-zinc-500">Total Berat (Estimasi)</span>
                       <p className="font-medium text-zinc-900">{detail.totalBeratKg} kg</p>
                     </div>
                     <div>
                       <span className="text-zinc-500">Estimasi Poin</span>
                       <p className="font-medium text-zinc-900">{detail.estimasiTotalPoin} poin</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <div>
               <h3 className="text-sm font-medium text-zinc-700 mb-2">
                 Daftar Item Sampah
               </h3>
              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                      <th className="text-left font-medium text-zinc-500 px-3 py-2">
                        Kategori
                      </th>
                      <th className="text-right font-medium text-zinc-500 px-3 py-2">
                        Berat Estimasi
                      </th>
                      <th className="text-right font-medium text-zinc-500 px-3 py-2">
                        Poin/Kg
                      </th>
                      <th className="text-right font-medium text-zinc-500 px-3 py-2">
                        {isFinal ? "Berat Real" : "Berat Real (kg)"}
                      </th>
                      <th className="text-right font-medium text-zinc-500 px-3 py-2">
                        Subtotal Poin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.detailSetor.map((d) => {
                      const realVal =
                        parseFloat(itemsReal[d.kategoriSampahId] || "0") || 0;
                      const subtotalPoinReal = Math.round(
                        realVal * d.poinPerKg,
                      );
                      return (
                        <tr
                          key={d.id}
                          className="border-b border-zinc-50"
                        >
                          <td className="px-3 py-2 font-medium text-zinc-900">
                            {d.kategoriSampah.namaKategori}
                          </td>
                          <td className="px-3 py-2 text-right text-zinc-600 tabular-nums">
                            {d.beratKg} kg
                          </td>
                          <td className="px-3 py-2 text-right text-zinc-600 tabular-nums">
                            {d.poinPerKg}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {isFinal ? (
                              <span className="text-zinc-900 tabular-nums">
                                {d.beratKgReal ?? "-"} kg
                              </span>
                            ) : (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={itemsReal[d.kategoriSampahId] || ""}
                                onChange={(e) =>
                                  handleBeratChange(
                                    d.kategoriSampahId,
                                    e.target.value,
                                  )
                                }
                                disabled={submitting}
                                className="w-24 text-right rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 tabular-nums"
                              />
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-zinc-900 font-medium tabular-nums">
                            {isFinal
                              ? (d.subtotalPoinReal ?? d.subtotalPoin)
                              : subtotalPoinReal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-200 bg-zinc-50/50">
                      <td
                        colSpan={3}
                        className="px-3 py-2 text-right font-medium text-zinc-700"
                      >
                        Total
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-zinc-900 tabular-nums">
                        {isFinal
                          ? `${detail.totalBeratKgReal ?? detail.totalBeratKg} kg`
                          : `${totals.berat} kg`}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-zinc-900 tabular-nums">
                        {isFinal
                          ? (detail.totalPoinReal ?? detail.estimasiTotalPoin)
                          : totals.poin}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {!isFinal && (
              <div className="space-y-4 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Status Verifikasi
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as StatusSetor)
                    }
                    disabled={submitting}
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Catatan Admin
                    {selectedStatus === "ditolak" && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    value={catatanAdmin}
                    onChange={(e) => setCatatanAdmin(e.target.value)}
                    rows={3}
                    disabled={submitting}
                    placeholder={
                      selectedStatus === "ditolak"
                        ? "Berikan alasan penolakan..."
                        : "Catatan opsional..."
                    }
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 resize-none"
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                    {submitError}
                  </div>
                )}

                 <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-zinc-100">
                   <div className="text-xs text-zinc-500">
                     <span className="block">Total Berat Real: {totals.berat} kg</span>
                     <span className="block">Total Poin Real: {totals.poin}</span>
                   </div>
                   <div className="flex justify-end gap-3 w-full sm:w-auto">
                     <button
                       type="button"
                       onClick={handleClose}
                       disabled={submitting}
                       className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition disabled:opacity-50"
                     >
                       Batal
                     </button>
                     <button
                       type="button"
                       onClick={handleSubmit}
                       disabled={submitting}
                       className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 shadow-sm"
                     >
                       {submitting && (
                         <LoadingSpinner size={16} className="text-white" />
                       )}
                       Simpan Verifikasi
                     </button>
                   </div>
                 </div>
              </div>
            )}

            {isFinal && detail.catatanAdmin && (
              <div className="text-sm pt-2 border-t border-zinc-100">
                <span className="text-zinc-500">Catatan Admin</span>
                <p className="text-zinc-700">{detail.catatanAdmin}</p>
              </div>
            )}

            {isFinal && (
              <div className="flex justify-center pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
