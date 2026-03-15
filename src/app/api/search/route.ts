import { NextRequest, NextResponse } from 'next/server'
import { animeAPI, normalizeAnime } from '@/lib/api/anime'
import { mangaAPI, parseMangaFromAPI } from '@/lib/api/manga'
import { comicAPI, normalizeComic } from '@/lib/api/comic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  if (!q.trim()) return NextResponse.json({ anime: [], manga: [], comic: [] })

  const results: Record<string, unknown[]> = { anime: [], manga: [], comic: [] }

  await Promise.allSettled([
    (type === 'all' || type === 'anime') &&
      animeAPI.search(q).then(d => {
        const data = (d.data as Record<string,unknown>) || {}
        results.anime = ((data.animes as Record<string,unknown>[]) || []).map(normalizeAnime)
      }),

    (type === 'all' || type === 'manga') &&
      mangaAPI.search(q).then(d => {
        results.manga = (d.data || []).map(parseMangaFromAPI)
      }),

    (type === 'all' || type === 'comic') &&
      comicAPI.search(q).then(d => {
        results.comic = ((d.data as Record<string,unknown>[]) || []).map(normalizeComic)
      }),
  ])

  return NextResponse.json(results)
}
