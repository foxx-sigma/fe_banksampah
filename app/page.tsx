import HeroSection from "@/components/landing/HeroSection";
import RecycleIconBackground from "@/components/landing/RecycleIconBackground";
import RecycleImportanceSection from "@/components/landing/RecycleImportanceSection";

// Landing page - Bank Sampah Digital
// Ref: PRD-LANDING.md section 5 (Struktur Halaman)
export default function Home() {
  return (
    <main className="landing-page relative flex flex-1 flex-col bg-white text-black">
      {/*
        Background animasi recycle dipasang di level HALAMAN (bukan di dalam
        Hero Section) supaya berlaku untuk semua section. Elemennya sendiri
        `position: fixed` + flex-center, jadi ikonnya DIAM di tengah layar dan
        tidak ikut bergerak/terbagi saat konten discroll. Progress animasinya
        tetap di-scrub oleh posisi scroll dan MENGULANG tiap 100vh - lihat
        RecycleIconBackground untuk detail teknisnya.
      */}
      <RecycleIconBackground />

      {/*
        Overlay putih semi-transparan di antara background dan konten supaya
        teks di SEMUA section tetap kontras/terbaca. Ikut `fixed` menempel ke
        viewport agar selalu menutupi background yang sekarang selalu berada di
        tengah layar (termasuk saat section "Pentingnya Recycle" terlihat).
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-white/60"
      />

      {/* Konten di atas background + overlay */}
      <div className="relative z-10 flex flex-1 flex-col">
        <HeroSection />
        <RecycleImportanceSection />
      </div>
    </main>
  );
}
