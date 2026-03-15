# 🚀 AnimaVerse v4 — Panduan Setup

## Status API (Setelah Diverifikasi)

| Konten | API | Status | Perlu Setup? |
|---|---|---|---|
| 🎌 Anime streaming | AniWatch (HiAnime) | ✅ Aktif | ✅ Deploy dulu |
| 📖 Manga baca | MangaDex | ✅ Aktif | ❌ Langsung jalan |
| 📚 Komik Indonesia | Komikku API (komiku.id) | ✅ Aktif | ❌ Langsung jalan |
| 🐉 Donghua | @zhadev/anichin | ⚠️ Coba dulu | ❌ Tidak perlu setup |

---

## Step 1: Deploy AniWatch API (WAJIB untuk nonton anime)

1. Buka → https://github.com/ghoshRitesh12/aniwatch-api
2. Klik **"Deploy with Vercel"** di README
3. **PENTING:** Saat deploy, tambahkan env variable:
   ```
   ANIWATCH_API_DEPLOYMENT_ENV = vercel
   ```
4. Selesai deploy → catat URL-nya

---

## Step 2: Setup Supabase (WAJIB untuk login & fitur user)

1. Buka → https://supabase.com → New Project
2. Catat **Project URL** dan **anon key** dari Settings > API
3. SQL Editor → paste isi `src/lib/supabase/schema.sql` → Run

---

## Step 3: Set Env Variables di Vercel

**Vercel Dashboard → Project → Settings → Environment Variables**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | dari Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | dari Supabase |
| `ANIWATCH_API_BASE` | URL AniWatch dari Step 1 |
| `NEXT_PUBLIC_ANIWATCH_API_BASE` | URL yang sama |

Klik **Save** → **Redeploy**

---

## Yang Langsung Berjalan (Tanpa Setup Tambahan)

- ✅ **Baca Manga** via MangaDex API (langsung aktif)
- ✅ **Baca Komik Indonesia** via Komikku API/komiku.id (langsung aktif)
- ✅ **Donghua** via @zhadev/anichin npm package
