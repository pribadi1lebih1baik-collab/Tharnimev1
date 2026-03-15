import { NextRequest, NextResponse } from 'next/server'
import { animeAPI, normalizeAnime } from '@/lib/api/anime'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'ongoing'
  const page = parseInt(searchParams.get('page') || '1')

  try {
    let raw: Record<string, unknown>

    switch (type) {
      case 'popular':   raw = await animeAPI.getPopular(page);   break
      case 'movies':    raw = await animeAPI.getMovies(page);    break
      case 'upcoming':  raw = await animeAPI.getUpcoming(page);  break
      case 'completed': raw = await animeAPI.getCompleted(page); break
      case 'trending':  raw = await animeAPI.getTrending();      break
      default:          raw = await animeAPI.getOngoing(page);   break
    }

    // AniWatch v2 wraps everything in { success, data: { animes, ... } }
    const d = (raw.data as Record<string, unknown>) || raw
    const list = (
      d.animes ||
      d.topAiringAnimes ||
      d.mostPopularAnimes ||
      d.topUpcomingAnimes ||
      []
    ) as Record<string, unknown>[]

    return NextResponse.json({
      data: list.map(normalizeAnime),
      has_next: Boolean(d.hasNextPage),
      current_page: page,
    })
  } catch (e) {
    const msg = String(e)
    if (msg.includes('ANIWATCH_API_BASE_NOT_SET')) {
      return NextResponse.json({
        error: 'ANIWATCH_API_BASE belum diset',
        setup_required: true,
        data: [],
      }, { status: 503 })
    }
    return NextResponse.json({ error: msg, data: [] }, { status: 500 })
  }
}
