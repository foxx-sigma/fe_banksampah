"use client";

import { useState, useRef, type FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { HadiahItem } from "@/types/hadiah";

interface HadiahFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: HadiahItem | null;
}

export default function HadiahFormDialog({
  open,
  onClose,
  onSuccess,
  editData,
}: HadiahFormDialogProps) {
  if (!open) return null;

  return (
    <HadiahFormDialogInner
      onClose={onClose}
      onSuccess={onSuccess}
      editData={editData}
    />
  );
}

function HadiahFormDialogInner({
  onClose,
  onSuccess,
  editData,
}: Omit<HadiahFormDialogProps, "open">) {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(editData?.foto || null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = formRef.current!;
      const formData = new FormData();

      const namaHadiah = (form.elements.namedItem("namaHadiah") as HTMLInputElement).value.trim();
      const deskripsi = (form.elements.namedItem("deskripsi") as HTMLTextAreaElement).value.trim();
      const poinDibutuhkan = (form.elements.namedItem("poinDibutuhkan") as HTMLInputElement).value.trim();
      const stok = (form.elements.namedItem("stok") as HTMLInputElement).value.trim();
      const fotoInput = form.elements.namedItem("foto") as HTMLInputElement;
      const foto = fotoInput.files?.[0];

      if (!namaHadiah || !poinDibutuhkan || !stok) {
        setError("Nama hadiah, poin dibutuhkan, dan stok wajib diisi.");
        setLoading(false);
        return;
      }

      const poinNum = Number(poinDibutuhkan);
      const stokNum = Number(stok);

      if (!Number.isInteger(poinNum) || poinNum < 0) {
        setError("Poin dibutuhkan harus berupa angka bulat positif.");
        setLoading(false);
        return;
      }

      if (!Number.isInteger(stokNum) || stokNum < 0) {
        setError("Stok harus berupa angka bulat positif.");
        setLoading(false);
        return;
      }

      formData.append("namaHadiah", namaHadiah);
      if (deskripsi) formData.append("deskripsi", deskripsi);
      formData.append("poinDibutuhkan", poinDibutuhkan);
      formData.append("stok", stok);
      if (foto) formData.append("foto", foto);

      const url = isEdit
        ? `/api/admin/hadiah/${editData.id}`
        : "/api/admin/hadiah";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setError(json.message || "Terjadi kesalahan.");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onClose={onClose} className="max-w-lg mx-4">
      <div className="p-6">
        <h2 className="font-heading font-semibold text-xl text-zinc-900 mb-4">
          {isEdit ? "Edit Hadiah" : "Tambah Hadiah"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nama Hadiah
            </label>
            <input
              name="namaHadiah"
              type="text"
              defaultValue={editData?.namaHadiah || ""}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Deskripsi (opsional)
            </label>
            <textarea
              name="deskripsi"
              rows={3}
              defaultValue={editData?.deskripsi || ""}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 resize-none"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Poin Dibutuhkan
              </label>
              <input
                name="poinDibutuhkan"
                type="number"
                min="0"
                step="1"
                defaultValue={editData?.poinDibutuhkan ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Stok
              </label>
              <input
                name="stok"
                type="number"
                min="0"
                step="1"
                defaultValue={editData?.stok ?? ""}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Foto (opsional)
            </label>
            {previewUrl && (
              <div className="mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-lg border border-zinc-200"
                />
              </div>
            )}
            <input
              name="foto"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <LoadingSpinner size={16} className="text-white" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Hadiah"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
