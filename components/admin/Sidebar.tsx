"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  SquaresFour,
  Users,
  Package,
  Trash,
  Gift,
  Swap,
  FileText,
  SignOut,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/dashboard/admin",
    icon: SquaresFour,
  },
  {
    name: "Nasabah",
    href: "/dashboard/admin/nasabah",
    icon: Users,
  },
  {
    name: "Setoran Sampah",
    href: "/dashboard/admin/setoran",
    icon: Package,
  },
  {
    name: "Kategori Sampah",
    href: "/dashboard/admin/kategori-sampah",
    icon: Trash,
  },
  {
    name: "Hadiah",
    href: "/dashboard/admin/hadiah",
    icon: Gift,
  },
  {
    name: "Rekapitulasi",
    href: "/dashboard/admin/rekapitulasi",
    icon: FileText,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const res = await fetch('/api/admin/setor-sampah?status=menunggu_konfirmasi', {
          credentials: 'include',
        });
        const json = await res.json();
        
        if (cancelled) return;
        
        if (res.ok && json.success) {
          let count = 0;
          
          // Handle different response structures
          if (Array.isArray(json.data)) {
            count = json.data.length;
          } else if (json.data && Array.isArray(json.data.items)) {
            count = json.data.items.length;
          } else if (json.data && Array.isArray(json.data.data)) {
            count = json.data.data.length;
          }
          
          setPendingCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch pending setoran:', error);
      }
    })();
    
    // Refresh every 30 seconds to get updated notification count
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/setor-sampah?status=menunggu_konfirmasi', {
          credentials: 'include',
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
          let count = 0;
          
          if (Array.isArray(json.data)) {
            count = json.data.length;
          } else if (json.data && Array.isArray(json.data.items)) {
            count = json.data.items.length;
          } else if (json.data && Array.isArray(json.data.data)) {
            count = json.data.data.length;
          }
          
          setPendingCount(count);
        }
      } catch (error) {
        // Silently fail for polling
      }
    }, 30000);
    
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 md:w-20 bg-white border-r border-zinc-200 flex flex-col items-center py-6 gap-4 z-40">
      <div className="mb-4 text-teal-600">
        {/* Placeholder Logo / Brand Icon */}
        <SquaresFour size={32} weight="fill" />
      </div>

      <nav className="flex flex-col gap-3 w-full flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isSetoran = item.name === "Setoran Sampah";
          const hasPending = isSetoran && pendingCount > 0;

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
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r" />
              )}
              
              <Icon size={24} weight={isActive ? "fill" : "regular"} />

              {/* Notification Badge */}
              {hasPending && (
                <div className="absolute -top-1 -right-1 bg-red-500 border-2 border-white rounded-full w-3 h-3" />
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-3 hidden group-hover:flex items-center z-50">
                <div className="bg-white text-zinc-900 border border-zinc-200 text-sm font-sans px-3 py-1.5 rounded-md whitespace-nowrap shadow-md">
                  {item.name}
                  {hasPending && <span className="ml-1 text-red-500">({pendingCount})</span>}
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
          
          {/* Tooltip */}
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
