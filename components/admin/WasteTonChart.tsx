"use client";

import type { CategoryTonData } from "@/types/dashboard-admin";

interface WasteTonChartProps {
  data: CategoryTonData[];
}

export default function WasteTonChart({ data }: WasteTonChartProps) {
  const maxTonase = Math.max(...data.map((d) => d.tonaseKg), 1); // Avoid division by zero

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col h-full min-h-[350px]">
      <h3 className="font-heading font-semibold text-lg text-zinc-900 mb-6">
        Rekapitulasi Tonase per Kategori
      </h3>

      <div className="flex-1 flex items-end justify-around gap-2 mt-auto pt-6 border-b border-zinc-200 pb-2 relative">
        {/* Y-axis indicative lines */}
        <div className="absolute left-0 right-0 top-0 border-t border-dashed border-zinc-200/50" />
        <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-zinc-200/50" />
        
        {data.map((item) => {
          const heightPercentage = (item.tonaseKg / maxTonase) * 100;
          
          return (
            <div key={item.kategori} className="flex flex-col items-center group relative w-full px-1 sm:px-2 md:px-4">
              {/* Tooltip */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-zinc-900 text-white text-xs py-1 px-2 rounded font-sans shadow-lg z-10 whitespace-nowrap">
                {item.tonaseKg.toLocaleString("id-ID")} kg
              </div>
              
              {/* Bar */}
              <div className="w-full flex justify-center h-[200px] items-end">
                <div
                  className={`w-full max-w-[60px] rounded-t-sm transition-all duration-500 ease-in-out ${item.warna} hover:brightness-110`}
                  style={{ height: `${Math.max(heightPercentage, 2)}%` }} // Minimum height so it's visible even at 0 or very small
                />
              </div>
              
              {/* Label */}
              <span className="text-zinc-600 font-sans text-xs mt-3 truncate w-full text-center">
                {item.kategori}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
