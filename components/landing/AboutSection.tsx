"use client";

import { useMemo } from "react";
import { Target, User, Buildings } from "@phosphor-icons/react";
import { useSectionStagger } from "@/hooks/useSectionStagger";

const ROLE_CARDS = [
  {
    icon: User,
    title: "Untuk Nasabah",
    description:
      "Ajukan penyetoran sampah, pantau status & saldo poin, tukar poin dengan hadiah — semua dari satu dashboard.",
  },
  {
    icon: Buildings,
    title: "Untuk Pengelola Bank Sampah",
    description:
      "Kelola data nasabah, kategori sampah, dan transaksi penukaran dalam satu sistem terintegrasi, lengkap dengan rekapitulasi tonase bulanan.",
  },
] as const;

export default function AboutSection() {
  const staggerOptions = useMemo(
    () => ({
      skipScrollTrigger: true,
      groups: [
        {
          selector: ".about-heading",
          fromVars: { opacity: 0, y: 30 },
          toVars: { opacity: 1, y: 0, duration: 0.6 },
          position: "<",
        },
        {
          selector: ".about-intro",
          fromVars: { opacity: 0, y: 20 },
          toVars: { opacity: 1, y: 0, duration: 0.5 },
          position: "-=0.2",
        },
        {
          selector: ".about-mission-card",
          fromVars: { opacity: 0, y: 40, scale: 0.92 },
          toVars: { opacity: 1, y: 0, scale: 1, duration: 0.5 },
          position: "-=0.1",
        },
        {
          selector: ".about-role-card",
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
      id="tentang"
      className="w-full px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="about-heading font-heading text-3xl font-bold text-black opacity-0 sm:text-4xl md:text-5xl">
            Tentang Loopera
          </h2>
          <p className="about-intro max-w-3xl font-sans text-base leading-relaxed text-black/70 opacity-0 sm:text-lg">
            Platform digital untuk mencatat, menukar, dan memantau sampah daur
            ulang demi lingkungan yang lebih bersih — menghubungkan Nasabah
            (masyarakat/siswa) dengan Loopera secara transparan dan mudah
            diakses.
          </p>
        </div>

        <div className="about-mission-card mx-auto mt-16 max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 opacity-0 sm:p-10">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Target size={28} weight="duotone" className="text-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-xl font-semibold text-black sm:text-2xl">
                Misi Kami
              </h3>
              <p className="font-sans text-base leading-relaxed text-black/70">
                Mendorong kesadaran lingkungan lewat sistem yang membuat menyetor
                sampah daur ulang terasa mudah dan menguntungkan — sampah
                tercatat rapi, poin dihitung otomatis, dan bisa ditukar jadi
                hadiah nyata.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {ROLE_CARDS.map((card) => (
            <div
              key={card.title}
              className="about-role-card flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 opacity-0"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <card.icon
                  size={28}
                  weight="duotone"
                  className="text-primary"
                />
              </div>
              <h3 className="font-heading text-lg font-semibold text-black sm:text-xl">
                {card.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-black/70 sm:text-base">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
