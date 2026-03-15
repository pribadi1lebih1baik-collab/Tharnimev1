// ============================================================
// ANIME API - AniWatch (HiAnime) Self-hosted
// Repo: https://github.com/ghoshRitesh12/aniwatch-api
// Deploy ke Vercel → set env ANIWATCH_API_BASE
// Semua endpoint: /api/v2/hianime/...
// ============================================================

const BASE = (
  process.env.ANIWATCH_API_BASE ||
  process.env.NEXT_PUBLIC_ANIWATCH_API_BASE ||
  ''
).replace(/\/$/, '') // hapus trailing slash

async function fetchAW(endpoint: string, revalidate = 300) {
  if (!BASE) throw new Error('ANIWATCH_API_BASE_NOT_SET')
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`AniWatch ${res.status}: ${endpoint}`)
  return res.json()
}

export const animeAPI = {
  getHome:     ()           => fetchAW('/api/v2/hianime/home', 300),
  getOngoing:  (page = 1)  => fetchAW(`/api/v2/hianime/category?name=top-airing&page=${page}`),
  getPopular:  (page = 1)  => fetchAW(`/api/v2/hianime/category?name=most-popular&page=${page}`),
  getUpcoming: (page = 1)  => fetchAW(`/api/v2/hianime/category?name=top-upcoming&page=${page}`),
  getMovies:   (page = 1)  => fetchAW(`/api/v2/hianime/category?name=movie&page=${page}`),
  getCompleted:(page = 1)  => fetchAW(`/api/v2/hianime/category?name=completed&page=${page}`),
  getTrending: ()           => fetchAW('/api/v2/hianime/category?name=most-popular&page=1', 600),

  search:      (q: string, page = 1) =>
    fetchAW(`/api/v2/hianime/search?q=${encodeURIComponent(q)}&page=${page}`),

  getDetail:   (id: string) => fetchAW(`/api/v2/hianime/anime/${id}`),
  getEpisodes: (id: string) => fetchAW(`/api/v2/hianime/anime/${id}/episodes`, 300),

  getEpisodeSources: (episodeId: string, server = 'hd-1', category = 'sub') =>
    fetchAW(`/api/v2/hianime/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&server=${server}&category=${category}`, 60),

  getServers: (episodeId: string) =>
    fetchAW(`/api/v2/hianime/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`, 60),
}

export function normalizeAnime(item: Record<string, unknown>) {
  return {
    id:             String(item.id || ''),
    slug:           String(item.id || ''),
    title:          String(item.name || item.title || ''),
    poster:         String(item.poster || item.image || ''),
    synopsis:       String(item.description || item.synopsis || ''),
    status:         String(item.status || 'ongoing').toLowerCase().includes('airing')
                      ? 'ongoing'
                      : String(item.status || 'ongoing').toLowerCase().includes('finish')
                      ? 'completed'
                      : String(item.status || 'ongoing'),
    type:           String(item.type || ''),
    genres:         (item.genres as string[]) || [],
    rating:         parseFloat(String(item.rating || '0').replace('/10','')) || 0,
    episodes_count: Number(
      (item.episodes as Record<string,unknown>)?.sub ||
      (item.episodes as Record<string,unknown>)?.dub ||
      item.totalEpisodes || 0
    ),
    duration:       String(item.duration || ''),
    quality:        String(item.quality || ''),
  }
}
