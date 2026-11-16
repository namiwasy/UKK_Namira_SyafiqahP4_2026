PUSTAKAKU - Perpustakaan Digital (Next.js + Tailwind CSS + Express + MySQL)

STRUKTUR
  app/          halaman Next.js (page.js = beranda/login, admin/, siswa/)
  components/   Navbar, DataTable, FormModal
  lib/          api.js (koneksi ke backend), config.js (kolom tabel), ui.js (class Tailwind)
  tailwind.config.js  warna & font tema pink-matcha
  backend/      server.js (Express), data/perpustakaan.sql, .env

CARA MENJALANKAN
1. Nyalakan MySQL di XAMPP. Di phpMyAdmin: tab Import -> pilih
   backend/data/perpustakaan.sql -> Kirim (membuat database perpustakaan_app).
2. Di CMD, masuk ke folder ini lalu:
     npm install      (otomatis memasang paket backend juga)
     npm run dev      (menjalankan Next.js :3000 dan Express :5000 sekaligus)
3. Buka http://localhost:3000

AKUN
  Admin : admin@perpus.id / admin123
  Siswa : andi@siswa.id / siswa123 (juga siti@siswa.id, budi@siswa.id), atau daftar lewat tab "Daftar"

Jika password MySQL tidak kosong, ubah DB_PASS di backend/.env
Denda keterlambatan diatur lewat DENDA di backend/.env (default Rp1.000/hari)
