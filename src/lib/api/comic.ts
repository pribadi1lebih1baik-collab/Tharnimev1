// ============================================================
// COMIC API - Komikku API (komiku.id)
// Hosted: https://komiku-api.fly.dev  (LIVE, GRATIS, NO KEY)
// Repo:   https://github.com/Romi666/komikku-api
// Source: komiku.id (manga/manhwa/manhua Indonesia)
// ============================================================

const BASE = 'https://komiku-api.fly.dev'

async function fetchKomiku(endpoint: string, revalidate = 300) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`Komiku API ${res.status}: ${endpoint}`)
  return res.json()
}

export const comicAPI = {
  // List semua komik (bisa filter: manga/manhwa/manhua)
  getList:    (filter?: string)  =>
    fetchKomiku(`/api/comic/list${filter ? `?filter=${filter}` : ''}`),

  // Berdasarkan halaman
  getPopular:  (page = 1) => fetchKomiku(`/api/comic/popular/page/${page}`),
  getNewest:   (page = 1) => fetchKomiku(`/api/comic/newest/page/${page}`),
  getRecommended: (page = 1) => fetchKomiku(`/api/comic/recommended/page/${page}`),

  // Detail komik — endpoint format: "/manga/one-punch-man/"
  getDetail:  (endpoint: string) =>
    fetchKomiku(`/api/comic/info${endpoint}`),

  // Isi chapter (gambar) — endpoint format: "/ch/one-punch-man-chapter-1/"
  getChapter: (endpoint: string) =>
    fetchKomiku(`/api/comic/chapter${endpoint}`),

  // Search
  search:     (q: string)       =>
    fetchKomiku(`/api/comic/search/${encodeURIComponent(q)}`),
}

// Normalize response ke format kita
export function normalizeComic(item: Record<string, unknown>) {
  return {
    id:       String(item.endpoint || '').replace(/^\/manga\/|\/$/g, ''),
    slug:     String(item.endpoint || ''),
    title:    String(item.title || ''),
    poster:   String(item.image || item.thumbnail || ''),
    synopsis: String(item.desc || item.description || ''),
    type:     String(item.type || 'Manga'),
    status:   String(item.status || 'Ongoing'),
    genres:   (item.genre as string[]) || [],
    author:   String(item.author || ''),
    rating:   String(item.rating || ''),
    endpoint: String(item.endpoint || ''),
  }
}
