"use client";

import type { PendingSetorItem } from "@/types/dashboard-admin";
import FallbackImage from "@/components/ui/FallbackImage";
import { Clock } from "@phosphor-icons/react";

interface PendingSetoranListProps {
  items: PendingSetorItem[];
}

export default function PendingSetoranList({ items }: PendingSetoranListProps) {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl flex flex-col h-full min-h-[350px]">
      <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
        <h3 className="font-heading font-semibold text-lg text-zinc-900">
          Menunggu Konfirmasi
        </h3>
        {items.length > 0 && (
          <span className="bg-teal-500/10 text-teal-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
             <div className="w-32 h-32 mb-4 opacity-70">
                {/* Fallback image with explicit size to maintain layout */}
                <FallbackImage 
                  src="/step/petugas mendata.svg" 
                  alt="Empty Data" 
                  className="w-full h-full object-contain grayscale opacity-50"
                  fallbackClassName="flex h-full w-full items-center justify-center p-4 bg-zinc-50 rounded-lg text-zinc-500 text-sm"
                />
             </div>
             <p className="text-zinc-500 font-sans text-sm">Yah, data belum ada nih:(</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="p-3 hover:bg-zinc-50 rounded-lg transition-colors cursor-default"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-sans font-medium text-zinc-900 line-clamp-1">
                    {item.namaNasabah}
                  </span>
                  <span className="text-xs font-sans text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                    {item.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-sans text-zinc-600 mb-2 truncate">
                  {item.jenisSampah}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-sans">
                  <Clock size={14} />
                  <span>{formatDate(item.tanggal)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
