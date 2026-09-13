// Section "Pentingnya Recycle" - Landing Page Bank Sampah Digital
// Ref: PRD-LANDING.md section 5.2
//
// Catatan scope:
// - Section ini murni narasi edukatif tentang pentingnya daur ulang, TIDAK
//   memuat data statistik/angka dampak lingkungan sama sekali (keputusan
//   eksplisit sesuai PRD, jangan ditambahkan di iterasi berikutnya).
// - Tahapan yang ditampilkan adalah tahapan UMUM daur ulang (pisahkan,
//   kumpulkan, olah, manfaatkan kembali) - bukan alur khusus aplikasi Bank
//   Sampah (setor, tukar poin, dsb).
// - Ilustrasi per tahapan memakai PLACEHOLDER (belum ada aset dari
//   storyset.com/recycle). Sesuai instruksi, aset TIDAK di-fetch/scrape
//   otomatis dari storyset.com - menunggu aset diunduh manual lalu ditaruh
//   di /public/assets dan komponen ini diupdate untuk memakainya.
// - TODO (langkah selanjutnya, setelah aset asli storyset tersedia):
//   1. Pilih satu gaya ilustrasi Storyset (Rafiki/Bro/Amico/Pana/Cuate) dan
//      pakai gaya yang SAMA untuk seluruh ilustrasi di section ini.
//   2. Custom warna ilustrasi via color customizer Storyset supaya memakai
//      palet landing page: primary teal (#0D9488) + putih + hitam saja.
//   3. Ganti blok placeholder di RECYCLE_STAGES (illustrationPlaceholder)
//      dengan <Image>/SVG aset asli.
// - Tidak ada emoji dipakai di file ini (sesuai aturan mutlak PRD section 2).

type RecycleStage = {
  title: string;
  description: string;
  illustrationPlaceholder: string;
};

// Tahapan umum daur ulang (generik, bukan flow khusus aplikasi).
const RECYCLE_STAGES: RecycleStage[] = [
  {
    title: "Pisahkan",
    description:
      "Pisahkan sampah berdasarkan jenisnya sejak dari sumbernya, misalnya organik, plastik, kertas, dan logam, supaya proses daur ulang berikutnya lebih mudah dan efektif.",
    illustrationPlaceholder: "Pisahkan Sampah",
  },
  {
    title: "Kumpulkan",
    description:
      "Kumpulkan sampah yang sudah dipisahkan di satu tempat yang layak, lalu salurkan ke pihak yang tepat seperti bank sampah atau fasilitas pengumpulan daur ulang terdekat.",
    illustrationPlaceholder: "Kumpulkan Sampah",
  },
  {
    title: "Olah",
    description:
      "Sampah yang terkumpul diolah melalui proses seperti pembersihan, penghancuran, atau peleburan sehingga bisa diubah menjadi bahan baku baru yang siap dipakai kembali.",
    illustrationPlaceholder: "Olah Sampah",
  },
  {
    title: "Manfaatkan Kembali",
    description:
      "Bahan hasil olahan dipakai kembali menjadi produk baru, sehingga siklus daur ulang berjalan berkelanjutan dan mengurangi kebutuhan bahan baku baru dari alam.",
    illustrationPlaceholder: "Manfaatkan Kembali",
  },
];

function StageIllustrationPlaceholder({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder ilustrasi storyset - ${label}`}
      className="flex h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 text-center font-sans text-sm font-medium text-primary/70 sm:h-48"
    >
      ilustrasi storyset - {label}
      <br />
      (placeholder, aset asli menyusul)
    </div>
  );
}

export default function RecycleImportanceSection() {
  return (
    <section className="w-full px-6 py-20 sm:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        {/* Judul section */}
        <h2 className="font-heading text-3xl leading-tight text-black sm:text-4xl">
          Pentingnya Daur Ulang
        </h2>

        {/* Narasi pentingnya recycle - murni edukatif, tanpa statistik/angka */}
        <div className="max-w-2xl space-y-4 font-sans text-base text-black/70 sm:text-lg">
          <p>
            Daur ulang adalah salah satu cara sederhana namun berdampak besar
            untuk menjaga kelestarian lingkungan. Dengan mengolah kembali
            barang yang sudah tidak terpakai, kita membantu mengurangi
            penumpukan sampah dan memperpanjang manfaat dari setiap material
            yang sudah diproduksi.
          </p>
          <p>
            Kebiasaan memilah dan mendaur ulang sampah juga menumbuhkan
            kesadaran akan pentingnya menjaga bumi untuk generasi mendatang.
            Ini bukan hanya tanggung jawab industri atau pemerintah, tetapi
            juga kebiasaan kecil yang bisa dimulai dari setiap rumah tangga.
          </p>
        </div>
      </div>

      {/* Tahapan umum daur ulang */}
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {RECYCLE_STAGES.map((stage, index) => (
          <div
            key={stage.title}
            className="flex flex-col items-center gap-4 text-center"
          >
            <StageIllustrationPlaceholder label={stage.illustrationPlaceholder} />

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
