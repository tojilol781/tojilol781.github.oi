# KiosPanel project: whyu (Nano, Node.js 20)

## Ringkasan
- Web microlearning SMP dalam satu file `micro smp.html`. Entry: `index.js` (Node http, tanpa dependency).
- Port 10260 (PORT dan SERVER_PORT), listen 0.0.0.0. Domain whymicrolearning.kiospanel.my.id belum dicek di Domain tab.

## index.js
- Melayani `/`, `/index.html`, file PWA (`STATIC_FILES`), dan `/supabase-config.js` (dari `.env`: SUPABASE_URL, SUPABASE_ANON_KEY).
- Endpoint admin: POST `/api/admin/materi` (simpan materi ke tabel pengaturan_app key 'materi') dan POST `/api/admin/reset` (hapus nilai_siswa, naikkan version key 'reset'). Keduanya cek header `x-admin-pin` terhadap ADMIN_PIN (default 1234) dan menulis ke Supabase pakai SUPABASE_SERVICE_ROLE_KEY dari `.env`. Service role key tidak pernah dikirim ke browser.

## Supabase
- SQL yang harus dijalankan user: `supabase_nilai.sql` (nilai_siswa, simpan_nilai) dan `supabase_admin.sql` (pengaturan_app).
- Tabel `pengaturan_app`: baca publik, tulis hanya lewat server.
- Browser memanggil `syncRemoteData()` saat buka: ambil materi dari server dan cek versi reset (localStorage key smp_pgri_sumberagung_reset_seen).

## Materi di `micro smp.html`
- `DEFAULT_MODULES` sekitar baris 113. `saveModules()` menyimpan ke localStorage dan `pushMateriRemote()` ke server. Admin PIN dikirim dari STATE.adminPin (masih 1234 di kode).
- Reset progres siswa (`resetStudentProgress`) sekarang juga menghapus nilai di Supabase dan menaikkan version reset, sehingga semua perangkat ikut reset.

## Preferensi kerja
- User pakai bahasa Indonesia santai, kata "codingan", "wpa" = PWA, "mapel".
- Jangan tampilkan PIN, nilai rahasia, atau isi .env. Jangan hapus file atau akun tanpa izin.
- Setiap perubahan HTML: ekstrak `<script>` ke /tmp/imgtool/u*.js lalu `node --check`.
- Pending: user belum menjalankan kedua SQL; belum diuji end-to-end; ADMIN_PIN masih di kode.
