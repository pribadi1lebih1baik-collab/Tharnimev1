import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = new URL(req.url).searchParams.get('type') || 'watch'
  const limit = parseInt(new URL(req.url).searchParams.get('limit') || '20')

  if (type === 'read') {
    const { data, error } = await supabase.from('read_history')
      .select('*').eq('user_id', user.id).order('read_at', { ascending: false }).limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase.from('watch_history')
    .select('*').eq('user_id', user.id).order('watched_at', { ascending: false }).limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const isRead = body.type === 'read'

  if (isRead) {
    const { type: _type, ...payload } = body
    const { data, error } = await supabase.from('read_history')
      .upsert({ ...payload, user_id: user.id, read_at: new Date().toISOString() },
        { onConflict: 'user_id,chapter_id' })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase.from('watch_history')
    .upsert({ ...body, user_id: user.id, watched_at: new Date().toISOString() },
      { onConflict: 'user_id,episode_id' })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
