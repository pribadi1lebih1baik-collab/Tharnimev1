import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const anichin = await import('@zhadev/anichin')
    const { getEpisode } = anichin
    const data = await getEpisode(params.slug)

    if (!data) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }

    const streams = (data.streamUrl || data.sources || data.streams || []).map(
      (s: Record<string, unknown>) => ({
        quality: String(s.quality || s.label || 'HD'),
        url: String(s.url || s.src || ''),
        provider: String(s.provider || 'Default'),
      })
    ).filter((s: { url: string }) => s.url)

    // If direct stream URLs not available, try embed
    if (streams.length === 0 && (data.embed || data.embedUrl)) {
      streams.push({
        quality: 'HD',
        url: String(data.embed || data.embedUrl),
        provider: 'Anichin',
      })
    }

    return NextResponse.json({
      donghua_slug: String(data.seriesSlug || data.donghuaSlug || ''),
      title: String(data.title || `Episode ${params.slug}`),
      episode_number: Number(data.episode || 0),
      poster: String(data.poster || data.thumbnail || ''),
      streams,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
