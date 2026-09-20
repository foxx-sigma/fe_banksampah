"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlass,
  PencilSimple,
  Trash,
  Plus,
  CaretLeft,
  CaretRight,
  User,
} from "@phosphor-icons/react";
import Skeleton from "@/components/ui/Skeleton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FallbackImage from "@/components/ui/FallbackImage";
import NasabahFormDialog from "@/components/admin/nasabah/NasabahFormDialog";
import NasabahDeleteDialog from "@/components/admin/nasabah/NasabahDeleteDialog";
import type { NasabahItem, NasabahListMeta } from "@/types/nasabah";

const LIMIT = 10;

export default function NasabahPage() {
  const [items, setItems] = useState<NasabahItem[]>([]);
  const [meta, setMeta] = useState<NasabahListMeta>({
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
  const [editData, setEditData] = useState<NasabahItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NasabahItem | null>(null);

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
        const res = await fetch(`/api/admin/nasabah?${params}`, {
          credentials: "include",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Gagal mengambil data nasabah.");
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

  function openEdit(item: NasabahItem) {
    setEditData(item);
    setFormOpen(true);
  }

  function openDelete(item: NasabahItem) {
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
            Data Nasabah
          </h1>
          <p className="font-sans text-zinc-500 text-sm">
            Kelola data nasabah Bank Sampah.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm"
        >
          <Plus size={18} weight="bold" />
          Tambah Nasabah
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative max-w-sm">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau username..."
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
                  Nama Nasabah
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  Username
                </th>
                <th className="text-left font-medium text-zinc-500 px-4 py-3">
                  No. Telepon
                </th>
                <th className="text-right font-medium text-zinc-500 px-4 py-3">
                  Saldo Poin
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
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-16 ml-auto" />
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
                      ? `Tidak ada nasabah ditemukan untuk "${debouncedSearch}".`
                      : "Belum ada data nasabah."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-50 border border-teal-100 shrink-0 flex items-center justify-center">
                          {item.foto ? (
                            <FallbackImage
                              src={
                                item.foto.startsWith("http")
                                  ? item.foto
                                  : `${(process.env.NEXT_PUBLIC_BASE_API_URL ?? "").replace(/\/$/, "")}/${item.foto.replace(/^\//, "")}`
                              }
                              alt={item.namaNasabah}
                              className="w-full h-full object-cover"
                              fallbackClassName="flex items-center justify-center text-teal-600 font-bold text-xs"
                            />
                          ) : (
                            <User size={16} className="text-teal-600" />
                          )}
                        </div>
                        <span>{item.namaNasabah}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {item.user?.username || "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{item.telp}</td>
                    <td className="px-4 py-3 text-right text-zinc-900 font-medium tabular-nums">
                      {formatNumber(item.saldoPoin ?? 0)}
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
              Menampilkan {items.length} dari {meta.total} nasabah
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

      <NasabahFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSuccess={handleMutationSuccess}
        editData={editData}
      />

      <NasabahDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onSuccess={handleMutationSuccess}
        nasabah={deleteTarget}
      />
    </div>
  );
}
