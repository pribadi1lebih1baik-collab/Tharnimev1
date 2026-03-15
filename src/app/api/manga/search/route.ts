import { NextRequest, NextResponse } from 'next/server'
import { mangaAPI, parseMangaFromAPI } from '@/lib/api/manga'

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') || ''
  try {
    const data = await mangaAPI.search(q)
    const items = (data.data || []).map(parseMangaFromAPI)
    return NextResponse.json({ data: items })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
