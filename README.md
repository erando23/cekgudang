# Cek Gudang Cafe

Aplikasi web responsif untuk cek stok gudang cafe berdasarkan `prd.md`.

## Cara Menjalankan

Mode backend lokal:

```bash
npm install
npm start
```

Lalu buka `http://localhost:3000`.

Login dan data operasional membutuhkan backend; membuka `index.html` langsung hanya menampilkan UI tanpa login aktif.

## Database SQLite / Turso

Backend memakai `@libsql/client`.

Mode lokal default:

```text
file:data/cekgudang.db
```

Untuk deploy ke Turso, set environment berikut di hosting:

```text
TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
SESSION_SECRET=nilai-random-panjang
ADMIN_PASSWORD=password-admin-kuat
ACCOUNTANT_PASSWORD=password-akuntan-kuat
STAFF_PASSWORD=password-staff-kuat
```

Pada development, jika `TURSO_DATABASE_URL` tidak diisi, server memakai SQLite lokal di `data/cekgudang.db`.
Saat `NODE_ENV=production`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET`, dan ketiga password akun wajib diisi; server akan berhenti jika salah satunya belum ada. Sesi login disimpan dalam cookie `HttpOnly` dan berakhir setelah 6 jam.
Setiap penyimpanan state memakai revision check. Jika data sudah berubah di browser lain, penyimpanan ditolak dan data terbaru dimuat agar perubahan lama tidak menimpa data baru.

## Akun Login Development Lokal

- Admin: `erando23` / `erando23`
- Akuntan: `vivi` / `vivi2468`
- Staff: `lusi` / `lusi1357`

Password development di atas tidak dipakai pada production ketika environment password sudah diisi.

## Deploy Docker

Salin `.env.example` menjadi `.env`, isi seluruh secret dan kredensial Turso, lalu jalankan:

```bash
docker build -t cekgudang .
docker run --env-file .env -p 3000:3000 cekgudang
```

Health check tersedia di `GET /health` dan memeriksa koneksi database.
Dengan server berjalan, integration smoke test dapat dijalankan melalui `npm run test:integration`.
Server hanya melayani aset frontend yang diizinkan; source, database, env, dan file deployment selalu `404`. Login dibatasi 10 kegagalan per username/IP dalam 15 menit, dan setiap perubahan state divalidasi berdasarkan operasi serta role pengguna.

## Fitur Tahap 1-6

- Login role Admin, Staff, dan Akuntan.
- Dashboard total barang, low stock, dan transaksi terbaru.
- Master Data dengan tambah barang single item untuk Admin dan Staff.
- Admin dapat nonaktifkan barang dan import Excel.
- Staff dapat mengakses semua halaman kecuali Belanja dan bulk input Excel.
- Akuntan dapat mengakses semua halaman kecuali bulk input Excel dan Dashboard Belanja.
- Barang Masuk multi-item dalam satu ID transaksi.
- Barang Keluar multi-item dengan validasi stok cukup.
- Riwayat transaksi per card dan histori per barang 30 hari terakhir.
- Share transaksi dan stok ke WhatsApp.
- Setiap barang hanya boleh berada di satu lokasi penyimpanan.
- Modul Belanja untuk catatan pengeluaran harian per outlet tanpa mengubah stok.
- Dashboard akuntansi Admin berisi total harian, bulanan, tren 7 hari, top outlet, dan top item.
- Harga beli terakhir barang dihitung dari catatan belanja yang terhubung ke master barang.

## Fitur Tahap 7-9

- UI dipoles menjadi dashboard SaaS dark futuristik dengan glassmorphism, neon teal/green, noise texture halus, dan motion CSS.
- Halaman Master Data dibuat data-first: tabel stok tampil sebagai fokus utama.
- Form tambah barang dipindahkan ke modal dari tombol `Tambah Barang`.
- Role Staff tetap dapat menambahkan barang single item dari modal.
- Role Admin tetap dapat import Excel dan nonaktifkan barang.
- Layout responsif untuk desktop dan mobile.

## Tahap 10 - MVP 1 dan MVP 2

MVP 1 Fondasi Aplikasi:

- Struktur aplikasi web siap pakai melalui `index.html`, `styles.css`, dan `app.js`.
- Login sederhana untuk Admin, Staff, dan Akuntan.
- Seed lokasi awal: Gudang Utama, Freezer A, Freezer B, Freezer C, Dapur Produksi, SUGI Ramen, dan Garam Resto.
- Data awal tersimpan di `localStorage` browser saat memakai mode file statis.
- Backend lokal tersedia melalui `server.js` dan menyimpan data ke SQLite/libSQL `data/cekgudang.db`.

MVP 2 Master Data & Stok:

- Daftar barang dengan kolom nama barang, jumlah, min stok, lokasi, dan status.
- Tambah barang single item oleh Admin dan Staff.
- Edit barang hanya Admin.
- Nonaktifkan barang hanya Admin.
- Import Excel hanya Admin.
- Filter low stock.
- Satu barang hanya boleh berada di satu lokasi penyimpanan.

MVP 3 Barang Masuk:

- Input barang masuk multi-item dalam satu transaksi.
- Validasi jumlah lebih dari 0.
- Validasi barang hanya bisa masuk ke lokasi penyimpanannya.
- Dropdown barang difilter berdasarkan lokasi yang dipilih.
- Konfirmasi sebelum transaksi disimpan.

MVP 4 Barang Keluar:

- Input barang keluar multi-item dalam satu transaksi.
- Validasi barang hanya bisa keluar dari lokasi penyimpanannya.
- Dropdown barang difilter berdasarkan lokasi asal yang dipilih.
- Validasi stok tidak boleh minus.
- Konfirmasi sebelum transaksi disimpan.

MVP 5 Riwayat & WhatsApp:

- Riwayat transaksi tampil per ID transaksi dalam card.
- Histori per barang untuk 30 hari terakhir.
- Share transaksi ke WhatsApp.
- Share stok ke WhatsApp berdasarkan lokasi asli barang.

MVP 6 Import Excel:

- Admin dapat download template Excel master data.
- Admin dapat upload file Excel `.xlsx` master data.
- Sistem menampilkan preview sebelum import.
- Validasi nama/satuan kosong, min stok invalid, lokasi tidak ada, dan duplikat.
- Hanya baris valid yang dapat diimport.

MVP 7 Polishing:

- UI dark SaaS responsif.
- Empty state untuk data kosong.
- Toast feedback untuk aksi penting.
- Tombol disabled untuk import invalid.
- Pembatasan role Admin, Staff, dan Akuntan di halaman dan fitur sensitif.

## Import Data

Admin dapat download template dari tombol `Download Template` di halaman Master Data. File template berformat `.xlsx` dengan sheet `Template Barang` dan kolom berikut:

```text
Nama Barang | Satuan | Min Stok | Stok Saat Ini | Lokasi
Saus Tare   | liter  | 5        | 12             | Gudang Utama
Nori        | pack   | 10       | 25             | Freezer A
```

Jika kolom lokasi kosong, barang otomatis masuk ke lokasi penyimpanan pertama.

## Catatan Implementasi

Versi backend saat ini memakai Node.js + `@libsql/client`. Lokal memakai SQLite/libSQL file `data/cekgudang.db`; production dapat memakai Turso dengan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN`.
