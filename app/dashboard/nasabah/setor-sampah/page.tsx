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
  Plus,
  X,
  CalendarBlank,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Dialog from "@/components/ui/Dialog";
import type { KategoriSampahItem } from "@/types/kategori-sampah";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

// Satu baris item di keranjang
interface CartItem {
  id: string; // uuid lokal untuk key React
  kategoriSampahId: string;
  beratKg: string;
}

interface CartItemError {
  kategori?: string;
  berat?: string;
}

// Buat id unik sederhana tanpa library tambahan
let _idCounter = 0;
function genId() {
  return `item-${Date.now()}-${++_idCounter}`;
}

// Tanggal hari ini dalam format YYYY-MM-DD untuk default value input[type=date]
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function SetorSampahPage() {
  const router = useRouter();

  // ── Kategori ───────────────────────────────────────────────────
  const [kategoriList, setKategoriList] = useState<KategoriSampahItem[]>([]);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [errorKategori, setErrorKategori] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Keranjang multi-item ────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([
    { id: genId(), kategoriSampahId: "", beratKg: "" },
  ]);
  const [cartErrors, setCartErrors] = useState<Record<string, CartItemError>>(
    {}
  );

  // ── Field lain ─────────────────────────────────────────────────
  const [tanggal, setTanggal] = useState(todayStr());
  const [tanggalError, setTanggalError] = useState("");
  const [catatan, setCatatan] = useState("");

  // ── Foto ───────────────────────────────────────────────────────
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Submit ─────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    kodeSetor: string;
    estimasiTotalPoin: number;
  } | null>(null);

  // ── Fetch kategori ─────────────────────────────────────────────
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
          setErrorKategori(
            json.message || "Gagal mengambil data kategori sampah."
          );
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

  // ── Helpers kategori ───────────────────────────────────────────
  const getKategori = useCallback(
    (id: string) => kategoriList.find((k) => k.id === id) ?? null,
    [kategoriList]
  );

  // Hitung estimasi poin total dari seluruh keranjang
  const estimasiTotalPoin = useMemo(() => {
    return cart.reduce((acc, item) => {
      const k = getKategori(item.kategoriSampahId);
      const b = parseFloat(item.beratKg);
      if (!k || isNaN(b) || b <= 0) return acc;
      return acc + Math.round(b * k.poinPerKg);
    }, 0);
  }, [cart, getKategori]);

  // Kategori yang sudah dipilih di item lain (untuk disable pilihan duplikat)
  const usedKategoriIds = useMemo(
    () => cart.map((i) => i.kategoriSampahId).filter(Boolean),
    [cart]
  );

  // ── Keranjang CRUD ─────────────────────────────────────────────
  const addCartItem = () => {
    setCart((prev) => [
      ...prev,
      { id: genId(), kategoriSampahId: "", beratKg: "" },
    ]);
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    setCartErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateCartItem = (
    id: string,
    field: keyof Omit<CartItem, "id">,
    value: string
  ) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
    // hapus error field ybs saat user mulai mengetik
    setCartErrors((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field === "kategoriSampahId" ? "kategori" : "berat"]: undefined },
    }));
  };

  // ── Foto ───────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFotoError("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFotoError("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }
      setFotoFile(file);
      setFotoError("");
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  const removeFoto = useCallback(() => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Validasi ───────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    let valid = true;
    const newCartErrors: Record<string, CartItemError> = {};

    cart.forEach((item) => {
      const err: CartItemError = {};
      if (!item.kategoriSampahId) {
        err.kategori = "Pilih kategori sampah.";
        valid = false;
      }
      if (!item.beratKg.trim()) {
        err.berat = "Masukkan estimasi berat.";
        valid = false;
      } else {
        const n = parseFloat(item.beratKg);
        if (isNaN(n) || n <= 0) {
          err.berat = "Berat harus angka lebih dari 0.";
          valid = false;
        } else if (n > 9999) {
          err.berat = "Berat tidak boleh lebih dari 9999 kg.";
          valid = false;
        }
      }
      if (Object.keys(err).length) newCartErrors[item.id] = err;
    });

    setCartErrors(newCartErrors);

    if (!tanggal) {
      setTanggalError("Tanggal penyetoran wajib diisi.");
      valid = false;
    } else {
      setTanggalError("");
    }

    if (!fotoFile) {
      setFotoError("Foto bukti sampah wajib diunggah.");
      valid = false;
    } else {
      setFotoError("");
    }

    return valid;
  }, [cart, tanggal, fotoFile]);

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError("");
      if (!validate()) return;

      setSubmitting(true);
      try {
        const formData = new FormData();

        const items = cart.map((i) => ({
          kategoriSampahId: i.kategoriSampahId,
          beratKg: parseFloat(i.beratKg),
        }));
        formData.append("items", JSON.stringify(items));
        formData.append("tanggal", new Date(tanggal).toISOString());

        if (catatan.trim()) formData.append("catatan", catatan.trim());
        if (fotoFile) formData.append("foto", fotoFile);

        const res = await fetch("/api/nasabah/setor-sampah", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          setSubmitError(
            json.message || "Gagal mengajukan penyetoran sampah."
          );
          return;
        }

        setSuccessData({
          kodeSetor: json.data?.kodeSetor || "-",
          estimasiTotalPoin:
            json.data?.estimasiTotalPoin ?? estimasiTotalPoin,
        });
        setSuccessOpen(true);
      } catch {
        setSubmitError("Terjadi kesalahan jaringan saat mengirim pengajuan.");
      } finally {
        setSubmitting(false);
      }
    },
    [cart, tanggal, catatan, fotoFile, estimasiTotalPoin, validate]
  );

  const handleSuccessClose = useCallback(() => {
    setSuccessOpen(false);
    router.push("/dashboard/nasabah/status-pengajuan");
  }, [router]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-zinc-900">
          Ajukan Penyetoran Sampah
        </h1>
        <p className="font-sans text-zinc-500 text-sm mt-1">
          Tambahkan satu atau lebih jenis sampah, lengkapi foto bukti, lalu kirim pengajuan.
        </p>
      </div>

      {/* Error fetch kategori */}
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

          {/* ── Tanggal Penyetoran ─────────────────────────────────── */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-700">
              Tanggal Penyetoran
            </h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <CalendarBlank size={18} />
              </span>
              <input
                type="date"
                value={tanggal}
                max={todayStr()}
                onChange={(e) => {
                  setTanggal(e.target.value);
                  setTanggalError("");
                }}
                className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none transition bg-white ${
                  tanggalError
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                }`}
              />
            </div>
            {tanggalError && (
              <p className="text-red-600 text-xs">{tanggalError}</p>
            )}
          </div>

          {/* ── Keranjang Item ────────────────────────────────────── */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-700">
                Daftar Sampah yang Disetor
              </h2>
              <span className="text-xs text-zinc-400">
                {cart.length} item
              </span>
            </div>

            <div className="space-y-3">
              {cart.map((item, idx) => {
                const k = getKategori(item.kategoriSampahId);
                const b = parseFloat(item.beratKg);
                const subtotalPoin =
                  k && !isNaN(b) && b > 0
                    ? Math.round(b * k.poinPerKg)
                    : null;
                const err = cartErrors[item.id] ?? {};

                return (
                  <div
                    key={item.id}
                    className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-zinc-50/50"
                  >
                    {/* Header baris */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Item #{idx + 1}
                      </span>
                      {cart.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Hapus item ini"
                        >
                          <X size={16} weight="bold" />
                        </button>
                      )}
                    </div>

                    {/* Pilih Kategori */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-zinc-600">
                        Kategori Sampah
                      </label>
                      <div className="relative">
                        <select
                          value={item.kategoriSampahId}
                          onChange={(e) =>
                            updateCartItem(item.id, "kategoriSampahId", e.target.value)
                          }
                          className={`w-full rounded-lg border pl-3 pr-9 py-2 text-sm outline-none transition bg-white appearance-none ${
                            err.kategori
                              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                          }`}
                        >
                          <option value="">-- Pilih Kategori --</option>
                          {kategoriList.map((kat) => (
                            <option
                              key={kat.id}
                              value={kat.id}
                              disabled={
                                usedKategoriIds.includes(kat.id) &&
                                kat.id !== item.kategoriSampahId
                              }
                            >
                              {kat.namaKategori} ({kat.jenis}) —{" "}
                              {formatNumber(kat.poinPerKg)} poin/kg
                            </option>
                          ))}
                        </select>
                        <CaretDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                        />
                      </div>
                      {err.kategori && (
                        <p className="text-red-600 text-xs">{err.kategori}</p>
                      )}
                    </div>

                    {/* Estimasi Berat */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-zinc-600">
                        Estimasi Berat (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.01"
                        max="9999"
                        value={item.beratKg}
                        onChange={(e) =>
                          updateCartItem(item.id, "beratKg", e.target.value)
                        }
                        placeholder="Contoh: 2.5"
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                          err.berat
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                        }`}
                      />
                      {err.berat && (
                        <p className="text-red-600 text-xs">{err.berat}</p>
                      )}
                    </div>

                    {/* Subtotal Poin per item */}
                    {subtotalPoin !== null && (
                      <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                        <Coins size={16} weight="fill" className="text-teal-600 shrink-0" />
                        <span className="text-xs text-teal-700">
                          Estimasi:{" "}
                          <span className="font-semibold tabular-nums">
                            {formatNumber(subtotalPoin)} poin
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tombol tambah item — hanya jika masih ada kategori tersisa */}
            {cart.length < kategoriList.length && (
              <button
                type="button"
                onClick={addCartItem}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-teal-700 border border-dashed border-teal-300 rounded-lg hover:bg-teal-50 transition"
              >
                <Plus size={16} weight="bold" />
                Tambah Jenis Sampah Lain
              </button>
            )}

            {/* Total estimasi poin seluruh keranjang */}
            {estimasiTotalPoin > 0 && (
              <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-teal-700">
                  <Coins size={20} weight="fill" />
                  <span className="text-sm font-medium">Total Estimasi Poin</span>
                </div>
                <span className="font-semibold text-teal-700 text-lg tabular-nums">
                  {formatNumber(estimasiTotalPoin)}
                </span>
              </div>
            )}
          </div>

          {/* ── Foto Bukti ────────────────────────────────────────── */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-700">
              Foto Bukti Sampah <span className="text-red-500">*</span>
            </h2>
            {!fotoPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition cursor-pointer ${
                  fotoError
                    ? "border-red-300 bg-red-50 hover:border-red-400"
                    : "border-zinc-300 bg-zinc-50 hover:border-teal-400 hover:bg-teal-50/50"
                }`}
              >
                <UploadSimple
                  size={32}
                  className={fotoError ? "text-red-400" : "text-zinc-400"}
                />
                <span
                  className={`text-sm ${fotoError ? "text-red-500" : "text-zinc-500"}`}
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
            {fotoError && (
              <p className="text-red-600 text-xs">{fotoError}</p>
            )}
          </div>

          {/* ── Catatan ───────────────────────────────────────────── */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-700">
              Catatan <span className="text-zinc-400 font-normal">(Opsional)</span>
            </h2>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Kardus sudah diikat rapi, botol sudah dibersihkan"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 resize-none"
            />
          </div>

          {/* Error submit */}
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

      {/* ── Success Dialog ─────────────────────────────────────── */}
      <Dialog open={successOpen} onClose={handleSuccessClose} className="max-w-md mx-4">
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
                <span className="text-zinc-500">Total Estimasi Poin</span>
                <span className="font-medium text-teal-700 tabular-nums">
                  {formatNumber(successData.estimasiTotalPoin)} poin
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
