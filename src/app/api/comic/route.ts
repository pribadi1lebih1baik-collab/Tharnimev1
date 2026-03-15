import { NextRequest, NextResponse } from 'next/server'
import { comicAPI, normalizeComic } from '@/lib/api/comic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type')   || 'newest'
  const page   = parseInt(searchParams.get('page') || '1')
  const filter = searchParams.get('filter') || ''   // manga | manhwa | manhua

  try {
    let raw: Record<string, unknown>
    switch (type) {
      case 'popular':    raw = await comicAPI.getPopular(page);     break
      case 'recommended':raw = await comicAPI.getRecommended(page); break
      case 'list':       raw = await comicAPI.getList(filter || undefined); break
      default:           raw = await comicAPI.getNewest(page);      break
    }

    const items = (raw.data as Record<string, unknown>[]) || []
    return NextResponse.json({ data: items.map(normalizeComic) })
  } catch (e) {
    return NextResponse.json({ error: String(e), data: [] }, { status: 500 })
  }
}
