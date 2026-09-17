"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Coins,
  ArrowClockwise,
  UploadSimple,
  Trash,
  CheckCircle,
  Warning,
  CaretDown,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Dialog from "@/components/ui/Dialog";
import type { KategoriSampahItem } from "@/types/kategori-sampah";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

interface FormErrors {
  kategori?: string;
  berat?: string;
  foto?: string;
}

export default function SetorSampahPage() {
  const router = useRouter();

  const [kategoriList, setKategoriList] = useState<KategoriSampahItem[]>([]);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [errorKategori, setErrorKategori] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedKategoriId, setSelectedKategoriId] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [catatan, setCatatan] = useState("");

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    kodeSetor: string;
    estimasiPoin: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingKategori(true);
      setErrorKategori("");
      try {
        const res = await fetch("/api/nasabah/kategori-sampah", {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setErrorKategori(json.message || "Gagal mengambil data kategori sampah.");
          setKategoriList([]);
          return;
        }

        const data = json.data;
        if (Array.isArray(data)) {
          setKategoriList(data);
        } else if (data && Array.isArray(data.items)) {
          setKategoriList(data.items);
        } else if (data && Array.isArray(data.data)) {
          setKategoriList(data.data);
        } else {
          setKategoriList([]);
        }
      } catch {
        if (!cancelled) {
          setErrorKategori("Terjadi kesalahan jaringan.");
          setKategoriList([]);
        }
      } finally {
        if (!cancelled) setLoadingKategori(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const selectedKategori = useMemo(
    () => kategoriList.find((k) => k.id === selectedKategoriId) || null,
    [kategoriList, selectedKategoriId],
  );

  const beratNum = useMemo(() => {
    const n = parseFloat(beratKg);
    return isNaN(n) ? 0 : n;
  }, [beratKg]);

  const estimasiPoin = useMemo(() => {
    if (!selectedKategori || beratNum <= 0) return 0;
    return Math.round(beratNum * selectedKategori.poinPerKg);
  }, [selectedKategori, beratNum]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          foto: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.",
        }));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          foto: "Ukuran file terlalu besar. Maksimal 5MB.",
        }));
        return;
      }

      setFotoFile(file);
      setErrors((prev) => ({ ...prev, foto: undefined }));

      const reader = new FileReader();
      reader.onload = (ev) => {
        setFotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const removeFoto = useCallback(() => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedKategoriId) {
      newErrors.kategori = "Pilih kategori sampah terlebih dahulu.";
    }

    if (!beratKg.trim()) {
      newErrors.berat = "Masukkan estimasi berat.";
    } else {
      const n = parseFloat(beratKg);
      if (isNaN(n) || n <= 0) {
        newErrors.berat = "Berat harus angka lebih dari 0.";
      } else if (n > 9999) {
        newErrors.berat = "Berat tidak boleh lebih dari 9999 kg.";
      }
    }

    if (!fotoFile) {
      newErrors.foto = "Foto bukti sampah wajib diunggah.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedKategoriId, beratKg, fotoFile]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError("");

      if (!validate()) return;

      setSubmitting(true);

      try {
        const formData = new FormData();

        const items = [
          {
            kategoriSampahId: selectedKategoriId,
            beratKg: parseFloat(beratKg),
          },
        ];
        formData.append("items", JSON.stringify(items));

        if (catatan.trim()) {
          formData.append("catatan", catatan.trim());
        }

        if (fotoFile) {
          formData.append("foto", fotoFile);
        }

        const res = await fetch("/api/nasabah/setor-sampah", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          setSubmitError(json.message || "Gagal mengajukan penyetoran sampah.");
          return;
        }

        setSuccessData({
          kodeSetor: json.data?.kodeSetor || "-",
          estimasiPoin: json.data?.estimasiTotalPoin || estimasiPoin,
        });
        setSuccessOpen(true);
      } catch {
        setSubmitError("Terjadi kesalahan jaringan saat mengirim pengajuan.");
      } finally {
        setSubmitting(false);
      }
    },
    [selectedKategoriId, beratKg, catatan, fotoFile, estimasiPoin, validate],
  );

  const handleSuccessClose = useCallback(() => {
    setSuccessOpen(false);
    router.push("/dashboard/nasabah/status-pengajuan");
  }, [router]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Ajukan Penyetoran Sampah
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Isi form di bawah untuk mengajukan penyetoran sampah. Pastikan foto bukti sampah terlampir.
        </p>
      </div>

      {errorKategori && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Package size={24} className="text-red-500" />
            </div>
            <p className="text-red-700 text-sm font-medium">{errorKategori}</p>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
            >
              <ArrowClockwise size={16} weight="bold" />
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {loadingKategori ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : !errorKategori && kategoriList.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
              <Package size={28} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 text-sm font-sans">
              Belum ada data kategori sampah. Hubungi admin untuk menambahkan kategori.
            </p>
          </div>
        </div>
      ) : !errorKategori ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="kategori"
                className="block text-sm font-medium text-zinc-700"
              >
                Kategori Sampah
              </label>
              <div className="relative">
                <select
                  id="kategori"
                  value={selectedKategoriId}
                  onChange={(e) => {
                    setSelectedKategoriId(e.target.value);
                    setErrors((prev) => ({ ...prev, kategori: undefined }));
                  }}
                  className={`w-full rounded-lg border pl-4 pr-10 py-2.5 text-sm outline-none transition bg-white appearance-none ${
                    errors.kategori
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  }`}
                >
                  <option value="">-- Pilih Kategori Sampah --</option>
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKategori} ({k.jenis}) - {formatNumber(k.poinPerKg)} poin/Kg
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
              </div>
              {errors.kategori && (
                <p className="text-red-600 text-xs mt-1">{errors.kategori}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="berat"
                className="block text-sm font-medium text-zinc-700"
              >
                Estimasi Berat (Kg)
              </label>
              <input
                id="berat"
                type="number"
                step="0.1"
                min="0.01"
                max="9999"
                value={beratKg}
                onChange={(e) => {
                  setBeratKg(e.target.value);
                  setErrors((prev) => ({ ...prev, berat: undefined }));
                }}
                placeholder="Contoh: 2.5"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                  errors.berat
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                }`}
              />
              {errors.berat && (
                <p className="text-red-600 text-xs mt-1">{errors.berat}</p>
              )}
            </div>

            {selectedKategori && beratNum > 0 && (
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                <Coins size={24} weight="fill" className="text-teal-600 shrink-0" />
                <div>
                  <p className="text-xs text-teal-600">Estimasi Poin yang Didapat</p>
                  <p className="font-semibold text-teal-700 text-xl tabular-nums">
                    {formatNumber(estimasiPoin)} poin
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700">
                Foto Bukti Sampah (Wajib)
              </label>
              {!fotoPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition cursor-pointer ${
                    errors.foto
                      ? "border-red-300 bg-red-50 hover:border-red-400"
                      : "border-zinc-300 bg-zinc-50 hover:border-teal-400 hover:bg-teal-50/50"
                  }`}
                >
                  <UploadSimple
                    size={32}
                    className={errors.foto ? "text-red-400" : "text-zinc-400"}
                  />
                  <span
                    className={`text-sm ${errors.foto ? "text-red-500" : "text-zinc-500"}`}
                  >
                    Klik untuk unggah foto (JPG, PNG, WEBP, maks 5MB)
                  </span>
                </button>
              ) : (
                <div className="relative rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50">
                  <div className="relative w-full h-64">
                    <Image
                      src={fotoPreview}
                      alt="Preview foto sampah"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              {errors.foto && (
                <p className="text-red-600 text-xs mt-1">{errors.foto}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="catatan"
                className="block text-sm font-medium text-zinc-700"
              >
                Catatan (Opsional)
              </label>
              <textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Kardus sudah diikat rapi, botol sudah dibersihkan"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 resize-none"
              />
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <Warning size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <LoadingSpinner size={18} className="text-white" />
                Mengirim Pengajuan...
              </>
            ) : (
              <>
                <Package size={18} weight="bold" />
                Ajukan Penyetoran
              </>
            )}
          </button>
        </form>
      ) : null}

      <Dialog
        open={successOpen}
        onClose={handleSuccessClose}
        className="max-w-md mx-4"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
            <CheckCircle size={36} weight="fill" className="text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Pengajuan Berhasil Dikirim
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Pengajuan penyetoran sampah kamu sudah diterima dan menunggu verifikasi admin.
            </p>
          </div>
          {successData && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Kode Setor</span>
                <span className="font-medium text-zinc-900 tabular-nums">
                  {successData.kodeSetor}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Estimasi Poin</span>
                <span className="font-medium text-teal-700 tabular-nums">
                  {formatNumber(successData.estimasiPoin)} poin
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleSuccessClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
          >
            Lihat Status Pengajuan
          </button>
        </div>
      </Dialog>
    </div>
  );
}
