"use client";

// Background animasi recycle icon untuk landing page.
// Ref: task "Revisi background recycle - fixed di tengah layar + loop siklus".
//
// Pendekatan teknis:
// - File aslinya (public/assets/recycle-icon-animation.svg) memakai animasi
//   SMIL native (<animateTransform>/<animate> dengan repeatCount="indefinite")
//   yang autoplay sendiri dan tidak bisa dikontrol dari luar secara langsung.
// - SVG dimuat lewat elemen <object> (bukan inline JSX) karena filenya besar
//   (144 animateTransform + 71 animate path-morph/visibility di 28 mask) dan
//   supaya kita dapat referensi DOM SVGSVGElement asli via contentDocument.
// - Begitu SVG selesai load, native clock-nya langsung di-pause lewat
//   svg.pauseAnimations(). Sejak itu, satu-satunya yang menggerakkan seluruh
//   koreografi rotasi/morph adalah svg.setCurrentTime(t) yang dipanggil dari
//   GSAP -> tidak ada animasi yang autoplay independen.
//
// POSITIONING (revisi):
// - Background ini sekarang `position: fixed` + `inset-0` + flex-center, jadi
//   ikonnya SELALU berada di tengah VIEWPORT dan secara visual DIAM di tempat
//   sepanjang user scroll dari Hero ke section-section berikutnya.
// - Versi sebelumnya memakai `absolute inset-0` yang direntangkan setinggi
//   total halaman lalu di-tile per viewport; hasilnya background ikut
//   discroll bersama konten sehingga terlihat "berpindah"/terbagi antar
//   section. Pendekatan tiling itu DIHAPUS total.
// - z-index 0 (di belakang konten yang memakai z-10), `pointer-events-none`
//   supaya tidak pernah menghalangi klik.
//
// LOOPING SIKLUS (revisi):
// - Progress animasi tetap 100% terikat ke posisi scroll (scrub), tapi
//   sekarang berbentuk siklus yang berulang. Satu siklus animasi penuh
//   (SVG_CYCLE_DURATION = 2.3s) dipetakan ke SCROLL_PER_CYCLE_VH = 100vh
//   jarak scroll.
// - Frame saat ini dihitung dengan MODULO dari jarak scroll terhadap panjang
//   satu siklus:
//       scrolled       = progress ScrollTrigger * total jarak scroll halaman
//       cycleLength    = window.innerHeight * (SCROLL_PER_CYCLE_VH / 100)
//       t              = (scrolled % cycleLength) / cycleLength * 2.3
//   Jadi kalau satu siklus habis sementara halaman masih bisa discroll,
//   animasi otomatis mengulang dari awal dan lanjut mengikuti scroll -
//   bukan freeze di frame terakhir sampai halaman habis.
// - Karena `t` murni FUNGSI DARI POSISI SCROLL (bukan akumulasi/counter),
//   perilaku lama tetap terjaga:
//     * scroll berhenti  -> nilai scroll tidak berubah -> animasi freeze;
//     * scroll ke atas   -> nilai scroll mengecil -> animasi mundur, dan saat
//       mundur melewati batas siklus ia masuk ke akhir siklus sebelumnya
//       (kontinu), bukan lompat ke frame acak.
// - `scrub: true` (boolean, tanpa smoothing) dipakai supaya mapping
//   scroll -> frame benar-benar 1:1 tanpa easing/lag.
// - Trigger-nya adalah document.documentElement ("top top" -> "bottom bottom")
//   karena elemen background ini sendiri sudah `fixed` sehingga tidak punya
//   rentang scroll yang bisa diukur.
// - Desain visual ikon TIDAK diubah sama sekali; hanya opacity diturunkan
//   sedikit karena sekarang background selalu ada di tengah layar (termasuk
//   saat section "Pentingnya Recycle" terlihat), agar konten tetap terbaca.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Durasi satu siklus penuh animasi pada file SVG asli (semua
// <animateTransform>/<animate> di file sumber memakai dur="2.3s").
const SVG_CYCLE_DURATION = 2.3;

// Jarak scroll (dalam satuan vh) untuk menyelesaikan SATU siklus animasi
// penuh. 100 = tiap user scroll sejauh satu tinggi layar, ikon menyelesaikan
// satu putaran penuh lalu mengulang. Turunkan angkanya kalau mau animasi
// terasa lebih cepat, naikkan kalau mau lebih lambat.
const SCROLL_PER_CYCLE_VH = 100;

type RecycleAnimatedSVGElement = SVGSVGElement & {
  pauseAnimations: () => void;
  setCurrentTime: (seconds: number) => void;
};

export default function RecycleIconBackground({
  className = "",
}: {
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const objectRef = useRef<HTMLObjectElement | null>(null);

  useEffect(() => {
    const objectEl = objectRef.current;
    if (!objectEl) return;

    // SVG yang sudah diambil dari <object> dan clock SMIL native-nya sudah
    // di-pause. Ini satu-satunya sumber "frame" animasi.
    let svgEl: RecycleAnimatedSVGElement | null = null;

    // Proxy yang di-scrub GSAP: 0 di paling atas halaman, 1 di paling bawah.
    const proxy = { progress: 0 };

    const cycleLength = () =>
      Math.max(
        1,
        (window.innerHeight || 1) * (SCROLL_PER_CYCLE_VH / 100),
      );

    // Jarak scroll total halaman = scrollHeight - innerHeight, dihitung
    // LANGSUNG dari document (bukan dari bounding-rect elemen trigger).
    //
    // CATATAN PENTING: sebelumnya trigger yang dipakai adalah
    // `document.documentElement` dengan start/end "top top" / "bottom
    // bottom". Ini bug - <html> di app/layout.tsx punya class `h-full`
    // (height: 100%, bukan min-height), jadi rect yang dibaca ScrollTrigger
    // dari elemen itu TERKUNCI setinggi viewport saja, bukan tinggi total
    // halaman yang sebenarnya bisa discroll. Akibatnya `end - start` selalu
    // ~0 dan animasi macet permanen di frame awal. Fix: jangan gunakan
    // `trigger` elemen sama sekali - baca scrollHeight & innerHeight langsung
    // via fungsi `end`, yang GSAP re-evaluasi tiap `ScrollTrigger.refresh()`.
    const maxScroll = () =>
      Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );

    const applyFrame = () => {
      if (!svgEl) return;
      const scrolled = proxy.progress * maxScroll();
      const length = cycleLength();
      const withinCycle = ((scrolled % length) + length) % length;
      const t = (withinCycle / length) * SVG_CYCLE_DURATION;
      svgEl.setCurrentTime(isFinite(t) ? t : 0);
    };

    const initObject = () => {
      if (svgEl) return;
      const root = objectEl.contentDocument?.querySelector("svg") ?? null;
      if (
        !root ||
        typeof (root as RecycleAnimatedSVGElement).setCurrentTime !== "function"
      ) {
        return;
      }
      svgEl = root as RecycleAnimatedSVGElement;
      // Hentikan clock SMIL native supaya animasi tidak autoplay sendiri.
      svgEl.pauseAnimations();
      svgEl.setCurrentTime(0);
      ScrollTrigger.refresh();
      applyFrame();
    };

    // Timeline GSAP yang di-scrub langsung oleh posisi scroll window, dari 0
    // sampai jarak scroll maksimum halaman (tanpa `trigger` elemen apa pun,
    // supaya tidak bergantung pada box model elemen manapun).
    const timeline = gsap.timeline({
      scrollTrigger: {
        start: 0,
        end: maxScroll,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    timeline.to(proxy, {
      progress: 1,
      ease: "none",
      onUpdate: applyFrame,
    });

    const handleLoad = () => initObject();
    objectEl.addEventListener("load", handleLoad);
    // <object> bisa saja sudah selesai load sebelum listener terpasang.
    initObject();

    const handleResize = () => applyFrame();
    window.addEventListener("resize", handleResize);

    const scrollTrigger = timeline.scrollTrigger;

    return () => {
      objectEl.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", handleResize);
      timeline.kill();
      scrollTrigger?.kill();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden ${className}`}
    >
      <object
        ref={objectRef}
        data-recycle-tile=""
        data="/assets/recycle-icon-animation.svg"
        type="image/svg+xml"
        aria-hidden="true"
        className="h-[80%] w-[80%] max-w-none opacity-40 sm:h-[70%] sm:w-[70%] sm:opacity-45"
      />
    </div>
  );
}
