"use client";

import { useMemo } from "react";
import LayeredExtrudedText from "@/components/landing/LayeredExtrudedText";
import { useSectionStagger } from "@/hooks/useSectionStagger";

export default function HeroSection() {
  const staggerOptions = useMemo(
    () => ({
      skipScrollTrigger: true,
      groups: [
        {
          selector: ".headline-word",
          fromVars: { opacity: 0, scale: 0.8, y: 20 },
          toVars: { opacity: 1, scale: 1, y: 0, duration: 0.5 },
          position: "<",
        },
        {
          selector: ".extruded-main-letter",
          fromVars: { opacity: 0, scale: 0, y: 10 },
          toVars: {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "back.out(1.7)",
            stagger: { each: 0.04 },
          },
          position: "-=0.2",
        },
        {
          selector: '.extruded-shadow-letter[data-layer="0"]',
          fromVars: { opacity: 0 },
          toVars: {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            stagger: { each: 0.03 },
          },
          position: "-=0.15",
        },
        {
          selector: '.extruded-shadow-letter[data-layer="1"]',
          fromVars: { opacity: 0 },
          toVars: {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            stagger: { each: 0.03 },
          },
          position: "-=0.2",
        },
        {
          selector: '.extruded-shadow-letter[data-layer="2"]',
          fromVars: { opacity: 0 },
          toVars: {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            stagger: { each: 0.03 },
          },
          position: "-=0.2",
        },
      ],
    }),
    [],
  );

  const sectionRef = useSectionStagger(staggerOptions);

  const headlineWords = ["Kelola", "Sampah", "Jadi", "Lebih", "Mudah", "dan"];
  const extrudedWord = "Menguntungkan";

  return (
    <section
      id="beranda"
      ref={sectionRef}
      className="relative w-full overflow-hidden px-6 py-20 sm:py-28"
    >
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <h1 className="font-heading font-bold text-4xl leading-tight text-black sm:text-5xl md:text-6xl">
          {headlineWords.map((word, i) => (
            <span key={i} className="headline-word inline-block opacity-0">
              {word}
              {"\u00A0"}
            </span>
          ))}
          <LayeredExtrudedText text={extrudedWord} />
        </h1>

        <p className="max-w-2xl font-sans text-base text-black/70 sm:text-lg">
          Catat, tukar, dan pantau sampah daur ulangmu dalam satu aplikasi,
          mendukung lingkungan yang lebih bersih setiap hari.
        </p>

        <div aria-hidden="true" className="pixel-divider" />

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            className="rounded-full bg-primary px-6 py-3 font-sans font-semibold text-white transition hover:opacity-90"
          >
            Daftar Sekarang
          </button>
          <button
            type="button"
            className="rounded-full border-2 border-primary px-6 py-3 font-sans font-semibold text-primary transition hover:bg-primary/10"
          >
            Pelajari Lebih Lanjut
          </button>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="font-sans text-xs uppercase tracking-wide text-black/50">
            Didukung dan Dikembangkan Bersama
          </p>
          <div className="flex items-center justify-center">
            <div className="flex h-14 items-center justify-center rounded-xl bg-gray-50 px-6 py-2 border border-gray-100 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
