import { NextRequest, NextResponse } from 'next/server'
import { comicAPI } from '@/lib/api/comic'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // slug: "one-punch-man-chapter-1" → endpoint: "/ch/one-punch-man-chapter-1/"
    const endpoint = `/ch/${params.slug}/`
    const raw = await comicAPI.getChapter(endpoint)
    const d   = (raw.data as Record<string, unknown>) || {}

    return NextResponse.json({
      title: String(d.title || ''),
      pages: (d.image as string[]) || [],
      total: ((d.image as string[]) || []).length,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e), pages: [] }, { status: 500 })
  }
}
