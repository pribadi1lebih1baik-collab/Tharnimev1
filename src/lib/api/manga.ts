// ============================================================
// MANGA API - MangaDex Official API
// Docs: https://api.mangadex.org/docs
// ============================================================

const BASE = process.env.MANGADEX_API_BASE || 'https://api.mangadex.org'
const UPLOADS = process.env.MANGADEX_UPLOADS_BASE || 'https://uploads.mangadex.org'

async function fetchAPI(endpoint: string, revalidate = 300) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`MangaDex API error: ${res.status}`)
  return res.json()
}

export const mangaAPI = {
  getList: (params?: {
    limit?: number
    offset?: number
    title?: string
    status?: string[]
    contentRating?: string[]
    genres?: string[]
    order?: Record<string, string>
    availableTranslatedLanguage?: string[]
  }) => {
    const p = new URLSearchParams()
    p.set('limit', String(params?.limit || 20))
    p.set('offset', String(params?.offset || 0))
    p.set('includes[]', 'cover_art')
    p.set('includes[]', 'author')
    p.set('includes[]', 'artist')
    if (params?.title) p.set('title', params.title)
    if (params?.status) params.status.forEach(s => p.append('status[]', s))
    if (params?.genres) params.genres.forEach(g => p.append('includedTags[]', g))
    const cr = params?.contentRating || ['safe', 'suggestive']
    cr.forEach(r => p.append('contentRating[]', r))
    const lang = params?.availableTranslatedLanguage || ['id', 'en']
    lang.forEach(l => p.append('availableTranslatedLanguage[]', l))
    if (params?.order) {
      Object.entries(params.order).forEach(([k, v]) => p.set(`order[${k}]`, v))
    } else {
      p.set('order[followedCount]', 'desc')
    }
    return fetchAPI(`/manga?${p.toString()}`)
  },

  getDetail: (id: string) =>
    fetchAPI(`/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist&includes[]=tag`),

  getChapterList: (mangaId: string, params?: {
    limit?: number
    offset?: number
    translatedLanguage?: string[]
  }) => {
    const p = new URLSearchParams()
    p.set('limit', String(params?.limit || 100))
    p.set('offset', String(params?.offset || 0))
    const lang = params?.translatedLanguage || ['id', 'en']
    lang.forEach(l => p.append('translatedLanguage[]', l))
    p.set('order[chapter]', 'desc')
    return fetchAPI(`/manga/${mangaId}/feed?${p.toString()}`)
  },

  getChapterPages: async (chapterId: string): Promise<{ baseUrl: string; chapter: { hash: string; data: string[]; dataSaver: string[] } }> => {
    return fetchAPI(`/at-home/server/${chapterId}`, 60)
  },

  getPageUrl: (baseUrl: string, hash: string, filename: string, quality: 'data' | 'data-saver' = 'data') =>
    `${baseUrl}/${quality}/${hash}/${filename}`,

  getTags: () => fetchAPI('/manga/tag'),

  getCoverUrl: (mangaId: string, filename: string, size: 256 | 512 | undefined = 512) =>
    `${UPLOADS}/covers/${mangaId}/${filename}.${size}.jpg`,

  getStatistics: (mangaId: string) => fetchAPI(`/statistics/manga/${mangaId}`, 600),

  search: (query: string, limit = 20) =>
    fetchAPI(`/manga?title=${encodeURIComponent(query)}&limit=${limit}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`),
}

export function parseMangaFromAPI(item: Record<string, unknown>) {
  const attrs = item.attributes as Record<string, unknown>
  const rels = (item.relationships as Array<Record<string, unknown>>) || []

  const coverRel = rels.find((r) => r.type === 'cover_art')
  const coverAttrs = coverRel?.attributes as Record<string, unknown> | undefined
  const coverFile = coverAttrs?.fileName as string | undefined

  const authorRel = rels.find((r) => r.type === 'author')
  const authorAttrs = authorRel?.attributes as Record<string, unknown> | undefined

  const title = (attrs.title as Record<string, string>)?.en ||
    Object.values(attrs.title as Record<string, string>)[0] || 'Unknown'

  const tags = ((attrs.tags as Array<Record<string, unknown>>) || []).map((tag) => {
    const tagAttrs = tag.attributes as Record<string, unknown>
    return (tagAttrs?.name as Record<string, string>)?.en || ''
  }).filter(Boolean)

  return {
    id: item.id as string,
    title,
    cover: coverFile ? `https://uploads.mangadex.org/covers/${item.id}/${coverFile}.512.jpg` : '/placeholder-cover.jpg',
    synopsis: (attrs.description as Record<string, string>)?.en ||
      (attrs.description as Record<string, string>)?.id || '',
    status: attrs.status as string,
    type: (attrs.publicationDemographic as string) || 'manga',
    genres: tags.slice(0, 6),
    author: (authorAttrs?.name as string) || '',
    year: attrs.year as number,
    source: 'mangadex' as const,
  }
}
