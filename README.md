# Ilkom Forum (Next.js + PocketBase)

Forum sederhana bergaya Reddit menggunakan Next.js App Router, PocketBase (Google OAuth), React Query, dan Tailwind CSS.

## Prasyarat

- PocketBase berjalan lokal di http://127.0.0.1:8090 atau gunakan URL host dan set `NEXT_PUBLIC_PB_URL`.
- Aktifkan Google OAuth di PocketBase → Settings → Auth providers, tambahkan allowed redirect: `http://localhost:3000/login`.
- Skema koleksi sesuai `pb_schema.json`.

## Konfigurasi

Salin `.env.example` menjadi `.env.local` lalu sesuaikan:

```
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090
```

## Menjalankan secara lokal

```powershell
pnpm install
pnpm dev
```

Aplikasi akan berjalan di http://localhost:3000.

## Rute utama

- `/login` – Google sign-in dan callback
- `/forum` – daftar post; mode: Terbaru (sort -created) dan Populer (3 hari terakhir, urut komentar); dukungan `?q=` untuk pencarian
- `/forum/[id]` – detail post dan komentar
- `/new` – membuat post baru
- `/profile` – set username dan avatar

Semua rute dilindungi middleware kecuali `/login`.

## Catatan

- Sesi disimpan di cookie `pb_auth` dan diperbarui oleh middleware.
- Mode Populer membatasi post 3 hari terakhir, menghitung komentar secara batched, lalu mengurutkan berdasarkan jumlah komentar.

## Deploy

- Set `NEXT_PUBLIC_PB_URL` ke URL PocketBase publik (gunakan HTTPS di produksi).
