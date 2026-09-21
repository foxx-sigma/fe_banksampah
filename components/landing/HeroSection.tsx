"use client";

import { useMemo } from "react";
import Link from "next/link";
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
          selector: ".stagger-letter",
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
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden px-6 pt-20 pb-40 sm:pt-28 sm:pb-56"
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
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-sans font-semibold text-white transition hover:opacity-90"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/tentang"
            className="inline-flex items-center justify-center rounded-full border-2 border-primary px-6 py-3 font-sans font-semibold text-primary transition hover:bg-primary/10"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>

      </div>
    </section>
  );
}
