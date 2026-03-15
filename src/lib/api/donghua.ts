// ============================================================
// DONGHUA API - Proxy via Anichin
// Package: @zhadev/anichin (npm)
// ============================================================

const BASE = process.env.ANICHIN_API_BASE || 'https://anichin.top'

async function fetchAPI(endpoint: string) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'AnimaVerse/1.0' },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Donghua API error: ${res.status}`)
  return res.json()
}

export const donghuaAPI = {
  getHome: () => fetchAPI('/home'),
  getOngoing: (page = 1) => fetchAPI(`/ongoing?page=${page}`),
  getCompleted: (page = 1) => fetchAPI(`/completed?page=${page}`),
  getDetail: (slug: string) => fetchAPI(`/detail/${slug}`),
  getEpisode: (slug: string) => fetchAPI(`/episode/${slug}`),
  search: (q: string) => fetchAPI(`/search?q=${encodeURIComponent(q)}`),
}
