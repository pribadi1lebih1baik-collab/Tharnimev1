import { NextRequest, NextResponse } from 'next/server'
import { mangaAPI, parseMangaFromAPI } from '@/lib/api/manga'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [detail, chapters] = await Promise.all([
      mangaAPI.getDetail(params.id),
      mangaAPI.getChapterList(params.id, { limit: 500, translatedLanguage: ['id', 'en'] }),
    ])
    const manga = parseMangaFromAPI(detail.data)
    return NextResponse.json({ manga, chapters: chapters.data || [] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
