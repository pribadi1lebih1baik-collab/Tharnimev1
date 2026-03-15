import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const anichin = await import('@zhadev/anichin')
    const { getDetail } = anichin
    const data = await getDetail(params.slug)

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const episodes = (data.episodeList || data.episodes || []).map(
      (ep: Record<string, unknown>) => ({
        id: String(ep.slug || ep.id || ''),
        slug: String(ep.slug || ep.id || ''),
        title: String(ep.title || `Episode ${ep.episode || ''}`),
        episode_number: Number(ep.episode || ep.episode_number) || 0,
      })
    )

    return NextResponse.json({
      detail: {
        id: String(data.slug || params.slug),
        slug: String(data.slug || params.slug),
        title: String(data.title || ''),
        poster: String(data.poster || data.image || ''),
        synopsis: String(data.synopsis || data.description || ''),
        status: String(data.status || ''),
        genres: data.genres || [],
        episodes_count: episodes.length,
      },
      episodes,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
