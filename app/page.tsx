import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import RecycleImportanceSection from "@/components/landing/RecycleImportanceSection";
import LoadingScreen from "@/components/landing/LoadingScreen";
import Footer from "@/components/landing/Footer";

// Landing page - Bank Sampah Digital
// Ref: PRD-LANDING.md section 5 (Struktur Halaman)
export default function Home() {
  return (
    <main className="landing-page relative flex flex-1 flex-col bg-white text-black">
      <LoadingScreen />
      <div className="relative flex flex-1 flex-col">
        <Navbar />
        <HeroSection />
        <RecycleImportanceSection />

        <div id="tentang" />
        <div id="cara-kerja" />
        <div id="daftar" />
        <Footer />
      </div>
    </main>
  );
}
