# KiosPanel project: whyu (Nano, Node.js 20)

## Ringkasan
- Web microlearning SMP (SPLDV, IPA pencernaan, Bahasa Indonesia) dalam satu file `micro smp.html`, data materi di localStorage.
- Entry: `index.js` (Node http, tanpa dependency). Melayani `/` dan `/index.html` dari `micro smp.html`, plus file PWA lewat `STATIC_FILES`.
- Port 10260 (PORT dan SERVER_PORT), listen 0.0.0.0. Domain: whymicrolearning.kiospanel.my.id (belum dicek di Domain tab).

## PWA
- `manifest.json`, `sw.js` (CACHE_NAME `microlearning-v6`), `icon-192-v2.png`, `icon-512-v2.png`. Icon dibuat dari gambar kiriman user, dilebarkan sampai penuh dan dibuat opaque.
- Setelah ganti icon, aplikasi terpasang harus dihapus lalu install ulang.

## Supabase
- `.env` berisi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` (project oyixsukrqxnabgkmcxoy). Sudah diverifikasi, tabel `sekolah` bisa dibaca.
- `micro smp.html` BELUM memakai Supabase. Pertanyaan ke user belum dijawab: login saja, atau materi/progres juga, dan apakah "tugas baru" disimpan ke Supabase.
- Tabel `profiles` dan `sekolah` ada (dari setup SQL sebelumnya). Setup role guru/admin belum dikonfirmasi.

## Materi di `micro smp.html`
- `DEFAULT_MODULES` (sekitar baris 113): 3 modul, masing-masing kuis 10 soal (sudah diganti, belum diuji di browser).
- Tahap belajar: video -> kuis -> refleksi. Infografis dan contoh kasus sudah dihapus total.
- Form admin masih hanya 1 soal per materi.
- Label "kuis" (bukan "kuis cepat").
- Keterangan durasi video di pojok kanan atas sudah dihapus.
- PIN admin `1234` masih ada di kode (user sudah tahu, hanya tulisan di layar dihapus).

## Preferensi kerja
- User pakai bahasa Indonesia santai, kata "codingan".
- Jangan tampilkan PIN, nilai rahasia, atau buat akun. Jangan hapus file/akun tanpa izin.
- Setiap perubahan HTML: cek syntax script dengan ekstrak `<script>` lalu `node --check`.
