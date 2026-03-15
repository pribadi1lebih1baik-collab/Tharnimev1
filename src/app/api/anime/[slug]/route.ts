import { NextRequest, NextResponse } from 'next/server'
import { animeAPI, normalizeAnime } from '@/lib/api/anime'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const [detailRaw, episodesRaw] = await Promise.allSettled([
      animeAPI.getDetail(params.slug),
      animeAPI.getEpisodes(params.slug),
    ])

    if (detailRaw.status === 'rejected') {
      return NextResponse.json({ error: String(detailRaw.reason) }, { status: 500 })
    }

    // AniWatch v2: { success, data: { anime: { info, moreInfo }, ... } }
    const d = (detailRaw.value.data as Record<string, unknown>) || {}
    const animeObj = (d.anime as Record<string, unknown>) || {}
    const info     = (animeObj.info as Record<string, unknown>) || {}
    const moreInfo = (animeObj.moreInfo as Record<string, unknown>) || {}
    const stats    = (info.stats as Record<string, unknown>) || {}

    const anime = normalizeAnime({
      id:          params.slug,
      name:        info.name || '',
      poster:      info.poster || '',
      description: info.description || '',
      status:      moreInfo.status || '',
      type:        stats.type || '',
      rating:      stats.rating || 0,
      duration:    stats.duration || '',
      quality:     stats.quality || '',
      genres:      moreInfo.genres || [],
      episodes: {
        sub: (stats.episodes as Record<string,unknown>)?.sub || 0,
        dub: (stats.episodes as Record<string,unknown>)?.dub || 0,
      },
    })

    // Episodes
    let episodes: Record<string, unknown>[] = []
    if (episodesRaw.status === 'fulfilled') {
      const epData = (episodesRaw.value.data as Record<string, unknown>) || {}
      episodes = (epData.episodes as Record<string, unknown>[]) || []
    }

    return NextResponse.json({
      anime,
      episodes: episodes.map(ep => ({
        id:             String(ep.episodeId || ep.id || ''),
        episode_id:     String(ep.episodeId || ep.id || ''),
        title:          String(ep.title || ep.name || `Episode ${ep.number}`),
        episode_number: Number(ep.number || ep.episode || 0),
        is_filler:      Boolean(ep.isFiller),
      })),
      related:      (d.relatedAnimes as Record<string,unknown>[]) || [],
      recommended:  (d.recommendedAnimes as Record<string,unknown>[]) || [],
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
