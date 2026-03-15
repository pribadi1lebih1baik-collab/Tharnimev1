import { NextRequest, NextResponse } from 'next/server'
import { animeAPI, normalizeAnime } from '@/lib/api/anime'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  if (!q.trim()) return NextResponse.json({ data: [] })

  try {
    const raw  = await animeAPI.search(q, page)
    const d    = (raw.data as Record<string, unknown>) || {}
    const list = (d.animes as Record<string, unknown>[]) || []
    return NextResponse.json({ data: list.map(normalizeAnime), has_next: Boolean(d.hasNextPage) })
  } catch (e) {
    return NextResponse.json({ error: String(e), data: [] }, { status: 500 })
  }
}
