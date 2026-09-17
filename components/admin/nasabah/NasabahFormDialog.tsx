"use client";

import { useState, useRef, type FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import PasswordInput from "@/components/ui/PasswordInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { NasabahItem } from "@/types/nasabah";

interface NasabahFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: NasabahItem | null;
}

export default function NasabahFormDialog({
  open,
  onClose,
  onSuccess,
  editData,
}: NasabahFormDialogProps) {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = formRef.current!;
      const formData = new FormData();

      const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
      const password = (form.elements.namedItem("password") as HTMLInputElement).value;
      const namaNasabah = (form.elements.namedItem("namaNasabah") as HTMLInputElement).value.trim();
      const alamat = (form.elements.namedItem("alamat") as HTMLTextAreaElement).value.trim();
      const telp = (form.elements.namedItem("telp") as HTMLInputElement).value.trim();
      const tanggalLahir = (form.elements.namedItem("tanggalLahir") as HTMLInputElement).value;
      const fotoInput = form.elements.namedItem("foto") as HTMLInputElement;
      const foto = fotoInput.files?.[0];

      if (!username || !namaNasabah || !alamat || !telp) {
        setError("Username, nama, alamat, dan telepon wajib diisi.");
        setLoading(false);
        return;
      }

      if (!isEdit && !password) {
        setError("Password wajib diisi saat menambah nasabah baru.");
        setLoading(false);
        return;
      }

      formData.append("username", username);
      if (password) formData.append("password", password);
      formData.append("namaNasabah", namaNasabah);
      formData.append("alamat", alamat);
      formData.append("telp", telp);
      if (tanggalLahir) formData.append("tanggalLahir", tanggalLahir);
      if (foto) formData.append("foto", foto);

      const url = isEdit
        ? `/api/admin/nasabah/${editData.id}`
        : "/api/admin/nasabah";
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
    <Dialog open={open} onClose={onClose} className="max-w-lg mx-4">
      <div className="p-6">
        <h2 className="font-heading font-semibold text-xl text-zinc-900 mb-4">
          {isEdit ? "Edit Nasabah" : "Tambah Nasabah"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              defaultValue={editData?.user?.username || ""}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Password{isEdit ? " (kosongkan jika tidak diubah)" : ""}
            </label>
            <PasswordInput
              name="password"
              placeholder={isEdit ? "Kosongkan jika tidak diubah" : ""}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nama Nasabah
            </label>
            <input
              name="namaNasabah"
              type="text"
              defaultValue={editData?.namaNasabah || ""}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Alamat
            </label>
            <textarea
              name="alamat"
              rows={2}
              defaultValue={editData?.alamat || ""}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 resize-none"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                No. Telepon
              </label>
              <input
                name="telp"
                type="text"
                defaultValue={editData?.telp || ""}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                name="tanggalLahir"
                type="date"
                defaultValue={editData?.tanggalLahir?.split("T")[0] || ""}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Foto (opsional)
            </label>
            <input
              name="foto"
              type="file"
              accept="image/*"
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
              {isEdit ? "Simpan Perubahan" : "Tambah Nasabah"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
