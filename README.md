# AnimaVerse 🎌

Platform streaming anime & donghua + baca manga/manhwa/webtoon dengan subtitle Indonesia.

## Tech Stack (Semua versi terbaru & aman)
| Package | Versi | Catatan |
|---|---|---|
| **Next.js** | 15.1.0 | Patched security fix |
| **React** | 19.0.0 | Latest stable |
| **Supabase SSR** | 0.5.x | Next.js 15 compatible |
| **TanStack Query** | 5.56.x | Latest |
| **Zustand** | 5.0.x | Latest |
| **TypeScript** | 5.6.x | Latest |
| **ESLint** | 9.x | Flat config |
| **Tailwind CSS** | 3.4.x | Latest v3 |

## Setup

### 1. Clone & Install
```bash
unzip animaverse.zip
cd animaverse
npm install
```

### 2. Environment Variables
```bash
cp .env.local.example .env.local
# Edit .env.local dengan nilai dari Supabase dashboard kamu
```

### 3. Setup Supabase
1. Buat project baru di https://supabase.com
2. Buka **SQL Editor** → jalankan seluruh isi file `src/lib/supabase/schema.sql`
3. Buka **Authentication → Providers** → aktifkan **Google**
4. Set redirect URL: `https://your-domain.vercel.app/auth/callback`
5. Copy **Project URL** dan **anon key** ke `.env.local`

### 4. Jalankan Development
```bash
npm run dev
# Buka http://localhost:3000
```

### 5. Deploy ke Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set env vars di Vercel Dashboard → Settings → Environment Variables:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY (opsional, untuk admin)
```

## Isi .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Fitur Platform
- 🎌 Streaming anime dari 12+ sumber (Otakudesu, Samehadaku, dll)
- 🐉 Streaming donghua (Anichin API)
- 📖 Baca manga global dari MangaDex (ribuan judul)
- 📚 Baca komik lokal Indonesia (Sanka Vollerei Comic API)
- 👤 Akun pengguna lengkap (Email + Google OAuth)
- 📋 Watchlist & Reading List dengan status tracker
- ⏱️ Riwayat tonton & baca otomatis
- ⭐ Rating & review per judul
- 🔍 Pencarian global (anime + manga + komik)
- 📱 Responsive mobile-first + dark mode
- 🔐 Row Level Security (RLS) di Supabase
- ⚡ Caching otomatis dengan TanStack Query

## Struktur Folder
```
src/
├── app/                    # Next.js App Router pages
│   ├── anime/              # Halaman anime
│   ├── donghua/            # Halaman donghua
│   ├── manga/              # Halaman manga (MangaDex)
│   ├── comic/              # Halaman komik lokal
│   ├── search/             # Pencarian global
│   ├── profile/            # Profil + watchlist + reading list
│   ├── login/ register/    # Auth pages
│   └── api/                # API Routes (proxy ke external APIs)
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── player/             # VideoPlayer, EpisodeList
│   ├── reader/             # MangaReader
│   ├── home/               # HeroBanner, ContentRow
│   └── ui/                 # ContentCard, Badge, dll
├── hooks/                  # useAuth, useWatchlist
├── lib/
│   ├── api/                # Wrapper fungsi untuk tiap external API
│   ├── supabase/           # Client, server, schema.sql
│   └── utils.ts            # Helper functions
├── store/                  # Zustand stores
└── types/                  # TypeScript types
```

## Catatan API
- **Sanka Vollerei** & **Anichin** adalah API pihak ketiga — bisa berubah sewaktu-waktu
- **MangaDex** adalah API resmi & stabil
- Semua konten video diambil dari sumber eksternal via iframe/stream URL
# Tharnimev1
