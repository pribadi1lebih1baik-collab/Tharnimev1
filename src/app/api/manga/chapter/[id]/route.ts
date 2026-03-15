import { NextRequest, NextResponse } from 'next/server'
import { mangaAPI } from '@/lib/api/manga'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverData = await mangaAPI.getChapterPages(params.id)
    const { baseUrl, chapter } = serverData
    const pages = chapter.data.map((f: string) =>
      mangaAPI.getPageUrl(baseUrl, chapter.hash, f, 'data')
    )
    const pagesSaver = chapter.dataSaver.map((f: string) =>
      mangaAPI.getPageUrl(baseUrl, chapter.hash, f, 'data-saver')
    )
    return NextResponse.json({ pages, pagesSaver, total: pages.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
