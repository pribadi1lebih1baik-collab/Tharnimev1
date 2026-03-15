import { NextRequest, NextResponse } from 'next/server'
import { mangaAPI, parseMangaFromAPI } from '@/lib/api/manga'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const status = searchParams.get('status') || undefined
  const order = searchParams.get('order') || 'followedCount'

  try {
    const data = await mangaAPI.getList({
      limit,
      offset,
      status: status ? [status] : undefined,
      order: { [order]: 'desc' },
      availableTranslatedLanguage: ['id', 'en'],
    })

    const items = (data.data || []).map(parseMangaFromAPI)
    return NextResponse.json({
      data: items,
      total: data.total || 0,
      limit: data.limit || limit,
      offset: data.offset || offset,
    })
  } catch (e) {
    console.error('Manga list error:', e)
    return NextResponse.json({ error: String(e), data: [] }, { status: 500 })
  }
}
