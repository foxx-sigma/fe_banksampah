import Sidebar from "@/components/admin/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Loopera",
  description: "Dashboard panel untuk Administrator",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-20 overflow-x-hidden p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
