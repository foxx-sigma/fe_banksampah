import Navbar from "@/components/landing/Navbar";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LoadingScreen from "@/components/landing/LoadingScreen";
import Footer from "@/components/landing/Footer";

export default function CaraKerjaPage() {
  return (
    <main className="landing-page relative flex flex-1 flex-col bg-white text-black">
      <LoadingScreen />
      <div className="relative flex flex-1 flex-col">
        <Navbar />
        <HowItWorksSection />
        <Footer />
      </div>
    </main>
  );
}
