"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlass,
  PencilSimple,
  Trash,
  Plus,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FallbackImage from "@/components/ui/FallbackImage";
import HadiahFormDialog from "@/components/admin/hadiah/HadiahFormDialog";
import HadiahDeleteDialog from "@/components/admin/hadiah/HadiahDeleteDialog";
import type { HadiahItem, HadiahListMeta } from "@/types/hadiah";

const LIMIT = 10;

export default function HadiahPage() {
  const [items, setItems] = useState<HadiahItem[]>([]);
  const [meta, setMeta] = useState<HadiahListMeta>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<HadiahItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HadiahItem | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          search: debouncedSearch,
          page: String(page),
          limit: String(LIMIT),
        });

        const res = await fetch(`/api/admin/hadiah?${params}`, {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal mengambil data hadiah.");
          setItems([]);
          return;
        }

        const data = json.data;
        if (Array.isArray(data)) {
          setItems(data);
          setMeta({ total: data.length, page: 1, limit: LIMIT, totalPages: 1 });
        } else if (data && Array.isArray(data.items)) {
          setItems(data.items);
          setMeta(data.meta || { total: data.items.length, page, limit: LIMIT, totalPages: 1 });
        } else if (data && Array.isArray(data.data)) {
          setItems(data.data);
          setMeta(data.meta || { total: data.data.length, page, limit: LIMIT, totalPages: 1 });
        } else {
          setItems([]);
          setMeta({ total: 0, page: 1, limit: LIMIT, totalPages: 0 });
        }
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch, page, refreshKey]);

  function openCreate() {
    setEditData(null);
    setFormOpen(true);
  }

  function openEdit(item: HadiahItem) {
    setEditData(item);
    setFormOpen(true);
  }

  function openDelete(item: HadiahItem) {
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    setRefreshKey((k) => k + 1);
  }

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-3xl text-zinc-900">
            Hadiah
          </h1>
          <p className="font-sans text-zinc-500 text-sm">
            Kelola katalog hadiah penukaran poin nasabah.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
        >
          <Plus size={18} weight="bold" />
          Tambah Hadiah
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama hadiah..."
              className="w-full rounded-lg border border-zinc-300 pl-10 pr-4 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Foto
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Nama Hadiah
                </th>
                <th className="text-right font-medium text-zinc-500 px-4 py-3">
                  Poin Dibutuhkan
                </th>
                <th className="text-right font-medium text-zinc-500 px-4 py-3">
                  Stok
                </th>
                <th className="text-center font-medium text-zinc-500 px-4 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-50">
                    <td className="px-4 py-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-zinc-500 font-sans"
                  >
                    {debouncedSearch
                      ? "Tidak ada hadiah ditemukan."
                      : "Belum ada data hadiah."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center p-0.5">
                        <FallbackImage
                          src={item.foto || undefined}
                          alt={item.namaHadiah}
                          className="max-h-full max-w-full object-contain"
                          fallbackClassName="flex h-full w-full items-center justify-center"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {item.namaHadiah}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-900 font-medium tabular-nums">
                      {formatNumber(item.poinDibutuhkan)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.stok === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          Habis
                        </span>
                      ) : (
                        <span className="text-zinc-900 font-medium tabular-nums">
                          {formatNumber(item.stok)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-zinc-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Edit"
                        >
                          <PencilSimple size={18} />
                        </button>
                        <button
                          onClick={() => openDelete(item)}
                          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">
              Menampilkan {items.length} dari {meta.total} hadiah
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CaretLeft size={18} />
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[36px] h-9 text-sm font-medium rounded-lg transition ${
                      p === page
                        ? "bg-teal-600 text-white"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CaretRight size={18} />
              </button>
            </div>
          </div>
        )}

        {loading && items.length > 0 && (
          <div className="flex items-center justify-center py-3 border-t border-zinc-100">
            <LoadingSpinner size={20} />
          </div>
        )}
      </div>

      <HadiahFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSuccess={handleMutationSuccess}
        editData={editData}
      />

      <HadiahDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onSuccess={handleMutationSuccess}
        hadiah={deleteTarget}
      />
    </div>
  );
}
