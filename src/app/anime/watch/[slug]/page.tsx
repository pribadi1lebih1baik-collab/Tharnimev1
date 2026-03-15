'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/LoadingSkeleton'
import Link from 'next/link'
import { ArrowLeft, Tv, Volume2, BookOpen } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Dynamic import VideoPlayer (client only, contains HLS.js)
const VideoPlayer = dynamic(() => import('@/components/player/VideoPlayer'), { ssr: false })

// slug = episodeId dari AniWatch, contoh: "attack-on-titan-112?ep=11527"
// Untuk URL-safe, kita encode episodeId sebagai base64 di path

function WatchContent() {
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const router = useRouter()

  const [server, setServer] = useState('hd-1')
  const [category, setCategory] = useState<'sub' | 'dub'>('sub')

  // episodeId di-pass via query param agar URL tetap clean
  // /anime/watch/[animeId]?ep=[episodeId]&server=hd-1&cat=sub
  const animeId = params.slug
  const episodeId = searchParams.get('ep') || ''
  const epNum = searchParams.get('num') || '1'

  const { data: streamData, isLoading: loadingStream, error: streamError } = useQuery({
    queryKey: ['anime-stream', episodeId, server, category],
    queryFn: () => fetch(
      `/api/anime/episode/${encodeURIComponent(episodeId)}?server=${server}&category=${category}`
    ).then(r => r.json()),
    enabled: !!episodeId,
    retry: 1,
  })

  const { data: animeDetail } = useQuery({
    queryKey: ['anime-detail', animeId],
    queryFn: () => fetch(`/api/anime/${animeId}`).then(r => r.json()),
    enabled: !!animeId,
  })

  const episodes = (animeDetail?.episodes || []) as Record<string, unknown>[]
  const currentIdx = episodes.findIndex(e =>
    String(e.episode_id) === episodeId || String(e.episode_number) === epNum
  )
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null
  const nextEp = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null
  const animeName = animeDetail?.anime?.title || ''

  // Save watch history
  useEffect(() => {
    if (!user || !animeDetail?.anime || !episodeId) return
    fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_id: animeId,
        content_type: 'anime',
        episode_id: episodeId,
        episode_number: parseInt(epNum),
        title: animeName,
        poster: animeDetail.anime.poster || '',
        progress_seconds: 0,
        duration_seconds: 1440,
        completed: false,
      }),
    }).catch(() => {})
  }, [user, animeDetail, episodeId, animeId, epNum, animeName])

  const navigateToEp = (ep: Record<string, unknown>) => {
    const epId = String(ep.episode_id || ep.id || '')
    const num = String(ep.episode_number || '')
    router.push(`/anime/watch/${animeId}?ep=${encodeURIComponent(epId)}&num=${num}`)
  }

  const streams = streamData?.streams || []
  const subtitles = streamData?.subtitles || []
  const servers = streamData?.servers || { sub: [], dub: [] }

  if (!episodeId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-text-muted">
        <p>Episode tidak ditemukan. Kembali ke halaman detail.</p>
        <Link href={`/anime/${animeId}`} className="text-accent-primary mt-3 inline-block">← Detail Anime</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Back link */}
      <Link href={`/anime/${animeId}`}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-4 w-fit transition-colors">
        <ArrowLeft size={16} /> {animeName || 'Kembali'}
      </Link>

      {/* Title */}
      <div className="mb-4">
        <h1 className="text-lg md:text-xl font-bold text-text-primary">
          {animeName}
        </h1>
        <p className="text-text-muted text-sm">Episode {epNum}</p>
      </div>

      {/* Sub/Dub switcher */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-text-muted uppercase tracking-wide font-medium">Mode:</span>
        <button onClick={() => setCategory('sub')}
          className={cn('flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all',
            category === 'sub' ? 'bg-accent-primary text-white' : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary')}>
          <BookOpen size={12} /> SUB
        </button>
        <button onClick={() => setCategory('dub')}
          className={cn('flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all',
            category === 'dub' ? 'bg-accent-primary text-white' : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary')}>
          <Volume2 size={12} /> DUB
        </button>
      </div>

      {/* Server switcher */}
      {(servers.sub.length > 0 || servers.dub.length > 0) && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-text-muted uppercase tracking-wide font-medium">Server:</span>
          {(category === 'sub' ? servers.sub : servers.dub).map((s: Record<string, unknown>, i: number) => (
            <button key={i}
              onClick={() => setServer(String(s.name || 'hd-1'))}
              className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                server === String(s.name) ? 'bg-green-600 text-white' : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary')}>
              {String(s.name || `Server ${i + 1}`)}
            </button>
          ))}
        </div>
      )}

      {/* Player */}
      {loadingStream ? (
        <Skeleton className="w-full aspect-video rounded-xl mb-4" />
      ) : streamError || (streamData?.error && streams.length === 0) ? (
        <div className="w-full aspect-video bg-bg-secondary border border-red-500/30 rounded-xl flex flex-col items-center justify-center gap-3 mb-4">
          <p className="text-red-400 text-sm font-medium">Gagal memuat stream</p>
          <p className="text-text-muted text-xs text-center max-w-sm px-4">
            {String(streamData?.error || 'Server tidak tersedia. Coba server lain atau pastikan ANIWATCH_API_BASE sudah dikonfigurasi.')}
          </p>
          <button onClick={() => setServer('hd-2')}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-secondary transition-colors">
            Coba Server hd-2
          </button>
        </div>
      ) : (
        <VideoPlayer
          sources={streams}
          subtitles={subtitles}
          title={`${animeName} - Episode ${epNum}`}
          intro={streamData?.intro}
          outro={streamData?.outro}
          onNext={nextEp ? () => navigateToEp(nextEp) : undefined}
          onPrev={prevEp ? () => navigateToEp(prevEp) : undefined}
          hasNext={!!nextEp}
          hasPrev={!!prevEp}
        />
      )}

      {/* Episode List */}
      {episodes.length > 0 && (
        <div className="mt-6 bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Tv size={16} /> Daftar Episode ({episodes.length})
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {episodes.map((ep) => {
              const epId = String(ep.episode_id || ep.id || '')
              const num = Number(ep.episode_number)
              const isCurrent = epId === episodeId || String(num) === epNum
              return (
                <button key={epId || num}
                  onClick={() => navigateToEp(ep)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary transition-colors border-b border-border/50 last:border-0 text-left',
                    isCurrent && 'bg-accent-primary/10'
                  )}>
                  <span className={cn('text-xs font-mono font-bold w-8 text-right flex-shrink-0',
                    isCurrent ? 'text-accent-primary' : 'text-text-muted')}>
                    {num}
                  </span>
                  <p className={cn('text-sm font-medium truncate flex-1',
                    isCurrent ? 'text-accent-primary' : 'text-text-primary')}>
                    {String(ep.title || `Episode ${num}`)}
                  </p>
                  {ep.is_filler && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded flex-shrink-0">Filler</span>
                  )}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WatchAnimePage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-4"><Skeleton className="w-full aspect-video rounded-xl" /></div>}>
      <WatchContent />
    </Suspense>
  )
}
