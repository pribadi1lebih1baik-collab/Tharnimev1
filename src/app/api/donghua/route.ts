import { NextRequest, NextResponse } from 'next/server'

// @zhadev/anichin is an npm package (Node.js scraper)
// It must be used server-side only
async function getAnichinData(type: string, page: number) {
  try {
    // Dynamic import to avoid SSR issues
    const anichin = await import('@zhadev/anichin')
    const { getHome, getOngoing, getCompleted } = anichin

    if (type === 'home') {
      const data = await getHome()
      return data
    } else if (type === 'completed') {
      const data = await getCompleted(page)
      return data
    } else {
      const data = await getOngoing(page)
      return data
    }
  } catch (err) {
    console.error('Anichin error:', err)
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'ongoing'
  const page = parseInt(searchParams.get('page') || '1')

  try {
    const data = await getAnichinData(type, page)

    if (!data) {
      return NextResponse.json({
        data: [],
        message: 'Donghua API sedang tidak tersedia',
      })
    }

    // Normalize the response
    const items = Array.isArray(data)
      ? data
      : data?.donghuaList || data?.data || data?.results || []

    const normalized = items.map((item: Record<string, unknown>) => ({
      id: String(item.slug || item.id || ''),
      slug: String(item.slug || item.id || ''),
      title: String(item.title || ''),
      poster: String(item.poster || item.image || item.cover || ''),
      status: String(item.status || 'ongoing'),
      episodes_count: item.episode || item.episodes_count || '',
      genres: (item.genres as string[]) || [],
    }))

    return NextResponse.json({ data: normalized })
  } catch (e) {
    console.error('Donghua route error:', e)
    return NextResponse.json({ error: String(e), data: [] }, { status: 500 })
  }
}
