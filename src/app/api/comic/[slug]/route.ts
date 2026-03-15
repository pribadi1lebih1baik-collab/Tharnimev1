import { NextRequest, NextResponse } from 'next/server'
import { comicAPI } from '@/lib/api/comic'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // slug dari URL: "one-punch-man" → endpoint: "/manga/one-punch-man/"
    const endpoint = `/manga/${params.slug}/`
    const raw = await comicAPI.getDetail(endpoint)
    const d   = (raw.data as Record<string, unknown>) || {}

    const chapters = ((d.chapter_list as Record<string, unknown>[]) || []).map(ch => ({
      id:       String(ch.endpoint || '').replace(/^\/ch\/|\/$/g, ''),
      slug:     String(ch.endpoint || ''),
      title:    String(ch.name || ''),
      endpoint: String(ch.endpoint || ''),
    }))

    return NextResponse.json({
      comic: {
        title:    String(d.title || ''),
        poster:   String(d.thumbnail || ''),
        synopsis: String(d.synopsis || d.desc || ''),
        type:     String(d.type || 'Manga'),
        status:   String(d.status || 'Ongoing'),
        author:   String(d.author || ''),
        genres:   (d.genre as string[]) || [],
        rating:   String(d.rating || ''),
      },
      chapters,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
