import Navbar from "@/components/landing/Navbar";
import AboutSection from "@/components/landing/AboutSection";
import LoadingScreen from "@/components/landing/LoadingScreen";
import Footer from "@/components/landing/Footer";

export default function TentangPage() {
  return (
    <main className="landing-page relative flex flex-1 flex-col bg-white text-black">
      <LoadingScreen />
      <div className="relative flex flex-1 flex-col">
        <Navbar />
        <AboutSection />
        <Footer />
      </div>
    </main>
  );
}
