import { NextRequest, NextResponse } from 'next/server'
import { comicAPI, normalizeComic } from '@/lib/api/comic'

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') || ''
  if (!q.trim()) return NextResponse.json({ data: [] })
  try {
    const raw   = await comicAPI.search(q)
    const items = (raw.data as Record<string, unknown>[]) || []
    return NextResponse.json({ data: items.map(normalizeComic) })
  } catch (e) {
    return NextResponse.json({ error: String(e), data: [] }, { status: 500 })
  }
}
