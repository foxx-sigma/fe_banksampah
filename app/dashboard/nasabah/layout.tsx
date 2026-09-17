import NasabahSidebar from "@/components/nasabah/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Nasabah - Bank Sampah Digital",
  description: "Dashboard panel untuk Nasabah",
};

export default function NasabahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row">
      <NasabahSidebar />
      <main className="flex-1 ml-16 md:ml-20 overflow-x-hidden p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
