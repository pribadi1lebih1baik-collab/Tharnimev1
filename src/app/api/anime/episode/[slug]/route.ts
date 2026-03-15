import { NextRequest, NextResponse } from 'next/server'
import { animeAPI } from '@/lib/api/anime'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url)
  const server   = searchParams.get('server')   || 'hd-1'
  const category = searchParams.get('category') || 'sub'

  // episodeId e.g. "steinsgate-3?ep=213" (URL-encoded in path)
  const episodeId = decodeURIComponent(params.slug)

  try {
    // Get servers list and sources in parallel
    const [serversRaw, sourcesRaw] = await Promise.allSettled([
      animeAPI.getServers(episodeId),
      animeAPI.getEpisodeSources(episodeId, server, category),
    ])

    let streams: { quality: string; url: string; isM3U8: boolean }[] = []
    let subtitles: { label: string; url: string; default: boolean }[] = []
    let intro: { start: number; end: number } | null = null
    let outro: { start: number; end: number } | null = null

    if (sourcesRaw.status === 'fulfilled') {
      const sd = (sourcesRaw.value.data as Record<string, unknown>) || {}

      streams = ((sd.sources as Record<string, unknown>[]) || [])
        .map(s => ({
          quality: String(s.quality || 'AUTO'),
          url:     String(s.url || ''),
          isM3U8:  Boolean(s.isM3U8 || String(s.url || '').includes('.m3u8')),
        }))
        .filter(s => s.url)

      subtitles = ((sd.tracks as Record<string, unknown>[]) || [])
        .filter(t => t.kind === 'captions')
        .map(t => ({
          label:   String(t.label || ''),
          url:     String(t.file  || ''),
          default: Boolean(t.default) || String(t.label || '').toLowerCase().includes('indo'),
        }))

      const introData = sd.intro as Record<string, number> | undefined
      const outroData = sd.outro as Record<string, number> | undefined
      if (introData?.start !== undefined) intro = { start: introData.start, end: introData.end }
      if (outroData?.start !== undefined) outro = { start: outroData.start, end: outroData.end }
    }

    let serversList = { sub: [], dub: [] }
    if (serversRaw.status === 'fulfilled') {
      const sv = (serversRaw.value.data as Record<string, unknown>) || {}
      serversList = {
        sub: (sv.sub as []) || [],
        dub: (sv.dub as []) || [],
      }
    }

    return NextResponse.json({ streams, subtitles, intro, outro, servers: serversList })
  } catch (e) {
    return NextResponse.json({ error: String(e), streams: [] }, { status: 500 })
  }
}
