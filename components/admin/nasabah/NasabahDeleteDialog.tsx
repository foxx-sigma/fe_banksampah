"use client";

import { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { NasabahItem } from "@/types/nasabah";

interface NasabahDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nasabah: NasabahItem | null;
}

export default function NasabahDeleteDialog({
  open,
  onClose,
  onSuccess,
  nasabah,
}: NasabahDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!nasabah) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/nasabah/${nasabah.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setError(json.message || "Gagal menghapus nasabah.");
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
    <Dialog open={open} onClose={onClose} className="max-w-md mx-4">
      <div className="p-6">
        <h2 className="font-heading font-semibold text-xl text-zinc-900 mb-2">
          Hapus Nasabah
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Data nasabah <span className="font-semibold">{nasabah?.namaNasabah}</span> akan dihapus permanen beserta akun pengguna terkait. Data ini tidak dapat dikembalikan, lanjutkan?
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <LoadingSpinner size={16} className="text-white" />}
            Hapus Permanen
          </button>
        </div>
      </div>
    </Dialog>
  );
}
