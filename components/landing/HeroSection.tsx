// Hero Section - Landing Page Bank Sampah Digital
// Ref: PRD-LANDING.md section 5.1
//
// Catatan scope:
// - Struktur statis (icon badge -> headline -> subtext -> 2 CTA -> trusted-by).
// - Background animasi recycle icon (scroll-linked via GSAP) TIDAK lagi
//   dipasang di sini. Background itu sekarang ada di level halaman
//   (app/page.tsx) supaya membentang sepanjang tinggi total halaman dan
//   melewati semua section, bukan cuma Hero. Section ini dibuat transparan
//   (tanpa bg-white) supaya background halaman terlihat menembusnya; overlay
//   kontras untuk keterbacaan teks juga sudah ditangani di level halaman.
// - Semua teks di bawah ini masih draft/placeholder, belum copy final.
// - Logo partner belum ada asetnya, memakai placeholder kotak abu-abu + label teks.

const PARTNER_PLACEHOLDERS = [
  "Partner A",
  "Partner B",
  "Partner C",
  "Partner D",
];

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden px-6 py-20 sm:py-28">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
       
        

        {/* 2. Headline besar - font Titan One */}
        <h1 className="font-heading text-4xl leading-tight text-black sm:text-5xl md:text-6xl">
          Kelola Sampah Jadi Lebih Mudah dan Menguntungkan
        </h1>

        {/* 3. Subtext singkat - font sans */}
        <p className="max-w-2xl font-sans text-base text-black/70 sm:text-lg">
          Draft: Catat, tukar, dan pantau sampah daur ulangmu dalam satu
          aplikasi, mendukung lingkungan yang lebih bersih setiap hari.
        </p>

        {/* Aksen pixel art (PRD-LANDING.md section 6) - divider dekoratif
            kecil, blocky/checkered, non-fungsional. Bukan pengganti border
            utama, hanya aksen di antara subtext dan CTA. */}
        <div aria-hidden="true" className="pixel-divider" />

        {/* 4. Dua tombol CTA pill: solid + outline */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            // Cursor pixel kustom TIDAK lagi dipasang per-elemen di sini.
            // Sekarang cursor pixel aktif global di seluruh website (landing
            // page maupun dashboard) lewat rule di app/globals.css.
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

        {/* 5. Baris logo partner (placeholder, belum ada aset asli) */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="font-sans text-xs uppercase tracking-wide text-black/50">
            Dipercaya oleh (placeholder logo, aset asli menyusul)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {PARTNER_PLACEHOLDERS.map((name) => (
              <div
                key={name}
                className="flex h-10 w-28 items-center justify-center rounded-md bg-gray-200 font-sans text-xs text-gray-500"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
