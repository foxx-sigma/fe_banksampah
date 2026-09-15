"use client";

import { useMemo } from "react";
import { useSectionStagger } from "@/hooks/useSectionStagger";
import FallbackImage from "@/components/ui/FallbackImage";

type Step = {
  title: string;
  description: string;
  imageSrc: string;
};

const STEPS: Step[] = [
  {
    title: "Daftar & Verifikasi Akun",
    description:
      "Buat akun di aplikasi Bank Sampah Digital, lalu verifikasi identitasmu agar bisa mulai menyetor sampah dan mengumpulkan poin.",
    imageSrc: "/step/step-1.svg",
  },
  {
    title: "Setor Sampah Terpilah ke Titik Bank Sampah",
    description:
      "Bawa sampah yang sudah dipilah ke titik pengumpulan bank sampah terdekat sesuai lokasi yang tersedia di aplikasi.",
    imageSrc: "/step/step-2.svg",
  },
  {
    title: "Petugas Menimbang & Mencatat Sampah",
    description:
      "Petugas bank sampah akan menimbang dan mencatat jenis serta berat sampah yang kamu setorkan secara digital.",
    imageSrc: "/step/step-3.svg",
  },
  {
    title: "Saldo/Poin Otomatis Masuk ke Dashboard",
    description:
      "Setelah pencatatan selesai, saldo atau poin langsung masuk ke dashboard akunmu secara otomatis dan real-time.",
    imageSrc: "/step/step-4.svg",
  },
  {
    title: "Tukar Poin Jadi Saldo atau Hadiah",
    description:
      "Gunakan poin yang terkumpul untuk ditukar menjadi saldo tunai atau hadiah menarik yang tersedia di aplikasi.",
    imageSrc: "/step/step-5.svg",
  },
];

export default function HowItWorksSection() {
  const staggerOptions = useMemo(
    () => ({
      triggerStart: "top 75%",
      groups: [
        {
          selector: ".how-it-works-heading",
          fromVars: { opacity: 0, y: 30 },
          toVars: { opacity: 1, y: 0, duration: 0.6 },
          position: "<",
        },
        {
          selector: ".how-it-works-step",
          fromVars: { opacity: 0, y: 40, scale: 0.92 },
          toVars: { opacity: 1, y: 0, scale: 1, duration: 0.5 },
          position: "-=0.2",
        },
      ],
    }),
    [],
  );

  const sectionRef = useSectionStagger(staggerOptions);

  return (
    <section
      ref={sectionRef}
      id="cara-kerja"
      className="w-full px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="how-it-works-heading mb-16 text-center font-heading text-3xl font-bold text-black opacity-0 sm:text-4xl md:text-5xl">
          Cara Kerja
        </h2>

        <div className="flex flex-col gap-16 md:gap-20">
          {STEPS.map((step, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.title}
                className="how-it-works-step flex flex-col items-center gap-8 opacity-0 md:flex-row md:gap-12"
              >
                <div
                  className={`w-full md:w-1/2 ${
                    isEven ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
                    <FallbackImage
                      src={step.imageSrc}
                      alt={`Ilustrasi ${step.title}`}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                </div>

                <div
                  className={`flex w-full flex-col gap-3 md:w-1/2 ${
                    isEven ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-sans text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="font-heading text-xl font-semibold text-black sm:text-2xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="font-sans text-base leading-relaxed text-black/70">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
