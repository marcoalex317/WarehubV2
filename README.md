# WareHub

WareHub adalah marketplace sewa gudang untuk UMKM — penyewa (tenant) bisa mencari dan booking gudang, pemilik (owner) bisa listing gudangnya dan mengelola booking yang masuk.

## Stack

- Frontend: HTML/CSS/JS statis (tanpa framework/build step)
- Backend: Node.js + Express
- Database: SQLite lewat `sql.js` (disimpan sebagai file `backend/database/warehub.db`, di-load ke memori dan ditulis ulang ke disk setiap ada perubahan)
- Auth: JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
- Upload foto gudang: `multer`

## Cara menjalankan

1. Install dependencies:
   ```
   npm install
   ```
2. Salin `.env.example` menjadi `.env`, lalu isi `JWT_SECRET` dengan string acak (jangan pakai nilai contoh saat deploy):
   ```
   cp .env.example .env
   ```
3. Jalankan server:
   ```
   npm start
   ```
4. Buka `http://localhost:3000` di browser. Database dan data demo dibuat otomatis saat server pertama kali jalan (lihat `backend/database/seed.js`).

## Akun demo

Dibuat otomatis oleh `backend/database/seed.js` saat server pertama kali jalan:

| Role   | Email                | Password   |
|--------|-----------------------|------------|
| Tenant | tenant@warehub.com    | tenant123  |
| Owner  | owner@warehub.com     | owner123   |
| Admin  | admin@warehub.com     | admin123   |

Akun admin bisa dipakai untuk membuka `admin.html` (database viewer, hanya untuk role `admin`).

## Struktur folder

```
server.js                  entry point Express
backend/
  database/setup.js        koneksi + skema tabel (users, warehouses, bookings)
  database/seed.js         data demo (idempotent, aman dijalankan ulang)
  middleware/auth.js        verifikasi JWT + pengecekan role
  routes/                  auth, warehouses, bookings, admin
  utils/db.js              helper bersama untuk ubah hasil query sql.js
assets/
  css/, js/, icons/, images/
*.html                     tiap halaman berdiri sendiri (bukan SPA)
```

## Known limitations / roadmap

Beberapa fitur di frontend masih pakai data contoh statis (`assets/js/data.js`) karena belum ada endpoint backend-nya:

- Tab "Penghasilan" di dashboard owner
- Tab "Inventaris" dan "Riwayat" di dashboard tenant
- Halaman Pesan (`messages.html`) — percakapan dummy, disimpan di localStorage browser
- Halaman Notifikasi — data statis

Keterbatasan arsitektur yang perlu diketahui sebelum dipakai untuk trafik nyata:

- `sql.js` menyimpan seluruh database di memori dan menulis ulang seluruh file `.db` setiap kali ada perubahan — cukup untuk demo/skala kecil, tapi berisiko race condition kalau ada dua request tulis bersamaan, dan tidak efisien untuk database besar. Untuk produksi sebaiknya migrasi ke `better-sqlite3` atau PostgreSQL.
- Belum ada rate limiting di endpoint login/register.
- Belum ada automated test.
