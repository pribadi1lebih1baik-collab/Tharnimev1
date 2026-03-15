'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import VideoPlayer from '@/components/player/VideoPlayer'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface StreamSource {
  quality: string
  url: string
  provider?: string
}

export default function WatchDonghuaPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()

  const { data: episodeData, isLoading } = useQuery({
    queryKey: ['donghua-episode', slug],
    queryFn: () => fetch(`/api/donghua/episode/${slug}`).then(r => r.json()),
    enabled: !!slug,
  })

  useEffect(() => {
    if (!user || !episodeData) return
    const ep = episodeData as Record<string, unknown>
    fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_id: ep.donghua_slug || slug,
        content_type: 'donghua',
        episode_id: slug,
        episode_number: ep.episode_number || 0,
        title: ep.title || '',
        poster: ep.poster || '',
        progress_seconds: 0,
        duration_seconds: 1440,
        completed: false,
      }),
    }).catch(() => {})
  }, [user, episodeData, slug])

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <Skeleton className="w-full aspect-video rounded-xl mb-4" />
    </div>
  )

  const ep = (episodeData || {}) as Record<string, unknown>
  const rawStreams = (ep.streams || ep.sources || []) as StreamSource[]
  const sources: StreamSource[] = rawStreams.length > 0
    ? rawStreams.filter(s => s.url)
    : ep.stream_url
      ? [{ quality: 'HD', url: String(ep.stream_url), provider: 'Default' }]
      : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {ep.donghua_slug && (
        <Link href={`/donghua/${String(ep.donghua_slug)}`}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-4 w-fit transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>
      )}
      <h1 className="text-xl font-bold text-text-primary mb-1">
        {String(ep.title || 'Memuat...')}
      </h1>
      {ep.episode_number && (
        <p className="text-text-muted text-sm mb-4">Episode {String(ep.episode_number)}</p>
      )}
      <VideoPlayer sources={sources} title={String(ep.title || '')} />
    </div>
  )
}
