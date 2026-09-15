"use client";

import { useMemo } from "react";
import LayeredExtrudedText from "@/components/landing/LayeredExtrudedText";
import { useSectionStagger } from "@/hooks/useSectionStagger";
import FallbackImage from "@/components/ui/FallbackImage";

type RecycleStage = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

const RECYCLE_STAGES: RecycleStage[] = [
  {
    title: "Pisahkan",
    description:
      "Pisahkan sampah berdasarkan jenisnya sejak dari sumbernya, misalnya organik, plastik, kertas, dan logam, supaya proses daur ulang berikutnya lebih mudah dan efektif.",
    imageSrc: "/pentingnya-recycle/pisahkan.svg",
    imageAlt: "Ilustrasi memisahkan sampah",
  },
  {
    title: "Kumpulkan",
    description:
      "Kumpulkan sampah yang sudah dipisahkan di satu tempat yang layak, lalu salurkan ke pihak yang tepat seperti bank sampah atau fasilitas pengumpulan daur ulang terdekat.",
    imageSrc: "/pentingnya-recycle/kumpulkan.svg",
    imageAlt: "Ilustrasi mengumpulkan sampah",
  },
  {
    title: "Olah",
    description:
      "Sampah yang terkumpul diolah melalui proses seperti pembersihan, penghancuran, atau peleburan sehingga bisa diubah menjadi bahan baku baru yang siap dipakai kembali.",
    imageSrc: "/pentingnya-recycle/olah.svg",
    imageAlt: "Ilustrasi mengolah sampah",
  },
  {
    title: "Manfaatkan Kembali",
    description:
      "Bahan hasil olahan dipakai kembali menjadi produk baru, sehingga siklus daur ulang berjalan berkelanjutan dan mengurangi kebutuhan bahan baku baru dari alam.",
    imageSrc: "/pentingnya-recycle/manfaatkan.svg",
    imageAlt: "Ilustrasi memanfaatkan kembali sampah",
  },
];

export default function RecycleImportanceSection() {
  const staggerOptions = useMemo(
    () => ({
      groups: [
        {
          selector: ".recycle-headline",
          fromVars: { opacity: 0, y: 30, scale: 0.92 },
          toVars: { opacity: 1, y: 0, scale: 1, duration: 0.6 },
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
        {
          selector: ".recycle-narasi",
          fromVars: { opacity: 0, y: 20 },
          toVars: { opacity: 1, y: 0, duration: 0.5 },
          position: "-=0.1",
        },
        {
          selector: ".recycle-stage-card",
          fromVars: { opacity: 0, y: 40, scale: 0.9 },
          toVars: { opacity: 1, y: 0, scale: 1, duration: 0.5 },
          position: "-=0.1",
        },
      ],
    }),
    [],
  );

  const sectionRef = useSectionStagger(staggerOptions);

  return (
    <section ref={sectionRef} className="w-full px-6 py-20 sm:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <h2 className="recycle-headline font-heading font-bold text-3xl leading-tight text-black opacity-0 sm:text-4xl md:text-5xl">
          Pentingnya{"\u00A0"}
          <LayeredExtrudedText text="Daur" />
          {" "}
          <LayeredExtrudedText text="Ulang" />
        </h2>

        <div className="max-w-2xl space-y-4 font-sans text-base text-black/70 sm:text-lg">
          <p className="recycle-narasi opacity-0">
            Daur ulang adalah salah satu cara sederhana namun berdampak besar
            untuk menjaga kelestarian lingkungan. Dengan mengolah kembali
            barang yang sudah tidak terpakai, kita membantu mengurangi
            penumpukan sampah dan memperpanjang manfaat dari setiap material
            yang sudah diproduksi.
          </p>
          <p className="recycle-narasi opacity-0">
            Kebiasaan memilah dan mendaur ulang sampah juga menumbuhkan
            kesadaran akan pentingnya menjaga bumi untuk generasi mendatang.
            Ini bukan hanya tanggung jawab industri atau pemerintah, tetapi
            juga kebiasaan kecil yang bisa dimulai dari setiap rumah tangga.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {RECYCLE_STAGES.map((stage, index) => (
          <div
            key={stage.title}
            className="recycle-stage-card flex flex-col items-center gap-4 text-center opacity-0"
          >
            <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-primary/5 p-4 sm:h-48">
              <FallbackImage
                src={stage.imageSrc}
                alt={stage.imageAlt}
                className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-sans text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="font-sans text-lg font-semibold text-black">
                {stage.title}
              </h3>
            </div>

            <p className="font-sans text-sm text-black/70">
              {stage.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
