# Bank Sampah Digital Frontend

## Deskripsi
Proyek ini merupakan antarmuka sisi klien (frontend) dari sistem Bank Sampah Digital yang dikembangkan menggunakan infrastruktur situs modern. Aplikasi ini memfasilitasi tiga layer interaksi: halaman publik untuk memaparkan informasi serta autentikasi, dasbor mandiri bagi nasabah untuk merekam aktivitas penyetoran ataupun penukaran, serta panel kendali bagi pengelola (admin) guna memandu verifikasi aset operasional di lapangan.

## Tech Stack
- Framework: Next.js (App Router, v16.3.5)
- UI Library: React (v19.2.8)
- Styling: Tailwind CSS (v4)
- Animasi: GSAP (v3.15.0)
- Kumpulan Ikon: @phosphor-icons/react (v2.1.10)
- Integrasi API: Fetch API natif dengan proteksi \middleware.ts\ beserta pengalihan melalui \
ext.config.ts\ (Rewrites)

## Alur Penggunaan

### Pengunjung (Halaman Publik)
Langkah-langkah pengunjung di bawah ini dapat diakses bebas tanpa proteksi login awal:
1. Membaca sekilas tujuan dari kampanye digital sampah lewat Beranda (\/\).
2. Berkenalan dengan seluruh prosedur transaksi lapangan melalui halaman Cara Kerja (\/cara-kerja\).
3. Membaca sejarah institusi pengelola di halaman Tentang (\/tentang\).
4. Mengisi lembar biodata perdana di (\/register\) atau langsung mengakses identitas melalui (\/login\). (Catatan: *Middleware* mengamankan kedua rute ini dengan melakukan *redirect* paksa menuju dasbor bagi pengguna yang telah menyimpan token JWT aktif).

### Nasabah
Akses ke rute ini dilindungi oleh *middleware*. Pengguna diwajibkan memiliki *JWT Token* valid dengan *role* akses NASABAH:
1. Memantau rekam jejak poin yang diraih serta rincian deposit terkini pada Dasbor Utama Nasabah (\/dashboard/nasabah\).
2. Meneliti patokan harga beli setiap gramatur atau wujud sampah lewat laman Kategori Sampah (\/dashboard/nasabah/kategori-sampah\).
3. Mengajukan pendaftaran penyerahan kargo fisik sampah kepada bank melaui laman Setor Sampah (\/dashboard/nasabah/setor-sampah\).
4. Mengajukan klaim konversi akumulasi poin ke barang fisik lewat laman Tukar Poin (\/dashboard/nasabah/tukar-poin\).
5. Meninjau riwayat mutasi kredit (tunggu konfirmasi maupun sukses) baik dari aktivitas penyetoran maupun penukaran pada layar Saldo Poin (\/dashboard/nasabah/saldo-poin\). Note: rute (\/dashboard/nasabah/cetak-bukti\) dan (\/dashboard/nasabah/status-pengajuan\) saat ini terdeteksi sebagai sekadar pintu *redirect* menuju laman Saldo Poin.

### Admin
Akses ke rute ini terlindungi oleh *middleware*. Pengguna diwajibkan memiliki *JWT Token* valid dengan *role* otorisasi ADMIN:
1. Mensurvei besaran kapasitas tampung nasabah maupun ringkasan agregat kas dan sampah harian pada Dasbor Utama Admin (\/dashboard/admin\).
2. Menambahkan, mengedit, atau menghapus spesifikasi jenis dan harga sampah dari sistem pangkalan pada laman Kategori Sampah (\/dashboard/admin/kategori-sampah\).
3. Menyeimbangkan ketersediaan suplai dan tarif kupon katalog di laman Hadiah (\/dashboard/admin/hadiah\).
4. Menyelenggarakan manajemen data individu dan mengurus identitas seluruh warga yang tergabung melalui laman Nasabah (\/dashboard/admin/nasabah\).
5. Memverifikasi pengajuan kiriman sampah, mengetikkan angka penimbangan timbangan riil, serta menekan tanda setuju akhir pada laman Setoran (\/dashboard/admin/setoran\).
6. Melancarkan validasi keluarnya barang stok dan mengganti status proses penukaran hingga selesai pada laman Penukaran (\/dashboard/admin/penukaran\).
7. Mencetak nota akumulasi kinerja bulanan (poin, hadiah, sumbangan sampah total) melalui halaman Rekapitulasi (\/dashboard/admin/rekapitulasi\).
