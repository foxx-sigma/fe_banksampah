"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  House,
  Recycle,
  Package,
  ClockCounterClockwise,
  Coins,
  Gift,
  Receipt,
  SignOut,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/dashboard/nasabah",
    icon: House,
  },
  {
    name: "Jenis Sampah",
    href: "/dashboard/nasabah/kategori-sampah",
    icon: Recycle,
  },
  {
    name: "Ajukan Setoran",
    href: "/dashboard/nasabah/setor-sampah",
    icon: Package,
  },
  {
    name: "Status Pengajuan",
    href: "/dashboard/nasabah/status-pengajuan",
    icon: ClockCounterClockwise,
  },
  {
    name: "Saldo & Histori",
    href: "/dashboard/nasabah/saldo-poin",
    icon: Coins,
  },
  {
    name: "Tukar Poin",
    href: "/dashboard/nasabah/tukar-poin",
    icon: Gift,
  },
  {
    name: "Cetak Bukti",
    href: "/dashboard/nasabah/cetak-bukti",
    icon: Receipt,
  },
];

export default function NasabahSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 md:w-20 bg-white border-r border-zinc-200 flex flex-col items-center py-6 gap-4 z-40">
      <div className="mb-4 text-teal-600">
        <Recycle size={32} weight="fill" />
      </div>

      <nav className="flex flex-col gap-3 w-full flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard/nasabah"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center justify-center w-full py-3 transition-colors ${
                isActive
                  ? "text-teal-600 bg-teal-500/10"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r" />
              )}

              <Icon size={24} weight={isActive ? "fill" : "regular"} />

              <div className="absolute left-full ml-3 hidden group-hover:flex items-center z-50">
                <div className="bg-white text-zinc-900 border border-zinc-200 text-sm font-sans px-3 py-1.5 rounded-md whitespace-nowrap shadow-md">
                  {item.name}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="w-full mt-auto">
        <button
          onClick={() => logout()}
          className="group relative flex items-center justify-center w-full py-3 transition-colors text-zinc-500 hover:text-red-600 hover:bg-red-50"
        >
          <SignOut size={24} />

          <div className="absolute left-full ml-3 hidden group-hover:flex items-center z-50">
            <div className="bg-white text-zinc-900 border border-zinc-200 text-sm font-sans px-3 py-1.5 rounded-md whitespace-nowrap shadow-md">
              Keluar
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
