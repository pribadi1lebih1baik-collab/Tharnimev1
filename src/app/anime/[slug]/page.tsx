'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Bookmark, BookmarkCheck, AlertCircle } from 'lucide-react'
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeleton'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function AnimeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated } = useAuth()
  const { isInWatchlist, upsertMutation } = useWatchlist(slug, 'anime')

  const { data, isLoading, error } = useQuery({
    queryKey: ['anime-detail', slug],
    queryFn: () => fetch(`/api/anime/${slug}`).then(r => r.json()),
    enabled: !!slug,
  })

  if (isLoading) return <DetailPageSkeleton />

  // API not configured
  if (data?.error?.includes('belum dikonfigurasi') || error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-3">Setup Diperlukan</h2>
        <p className="text-text-muted mb-6">
          AniWatch API belum dikonfigurasi. Deploy AniWatch API ke Vercel dan set environment variable.
        </p>
        <Link href="https://github.com/ghoshRitesh12/aniwatch-api" target="_blank"
          className="px-6 py-3 bg-accent-primary text-white rounded-xl font-medium hover:bg-accent-secondary transition-colors inline-block">
          Lihat Panduan AniWatch API →
        </Link>
      </div>
    )
  }

  if (!data || data.error) return (
    <div className="flex items-center justify-center min-h-96 text-text-muted">Anime tidak ditemukan</div>
  )

  const anime = data.anime as Record<string, unknown>
  const episodes = (data.episodes || []) as Record<string, unknown>[]
  const recommended = (data.recommended || []) as Record<string, unknown>[]

  // First and latest episode
  const firstEp = episodes[0]
  const makeWatchUrl = (ep: Record<string, unknown>) => {
    const epId = String(ep.episode_id || ep.id || '')
    const num = String(ep.episode_number || '')
    return `/anime/watch/${slug}?ep=${encodeURIComponent(epId)}&num=${num}`
  }

  const handleWatchlist = () => {
    if (!isAuthenticated) { toast.error('Login dulu!'); return }
    upsertMutation.mutate({
      content_id: String(slug),
      content_type: 'anime',
      title: String(anime.title || ''),
      poster: String(anime.poster || ''),
      status: 'plan_to_watch',
      total_episodes: Number(anime.episodes_count) || 0,
    })
    toast.success(isInWatchlist ? 'Watchlist diperbarui!' : 'Ditambahkan ke watchlist!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative mb-10 rounded-2xl overflow-hidden bg-bg-secondary border border-border">
        {anime.poster && (
          <div className="absolute inset-0">
            <Image src={String(anime.poster)} alt="" fill
              className="object-cover opacity-10 blur-2xl scale-110" unoptimized />
          </div>
        )}
        <div className="relative flex flex-col md:flex-row gap-8 p-6 md:p-8">
          <div className="flex-shrink-0">
            <div className="w-44 md:w-56 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0">
              <Image src={String(anime.poster || '/placeholder-cover.svg')} alt={String(anime.title || '')}
                width={224} height={336} className="object-cover w-full h-full" unoptimized priority />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-display font-black text-text-primary mb-2 leading-tight">
              {String(anime.title || '')}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {anime.status && (
                <Badge variant={String(anime.status) === 'ongoing' ? 'success' : 'info'}>
                  {String(anime.status)}
                </Badge>
              )}
              {anime.type && <Badge>{String(anime.type)}</Badge>}
              {anime.episodes_count && Number(anime.episodes_count) > 0 && (
                <Badge>{String(anime.episodes_count)} Ep</Badge>
              )}
              {anime.rating && Number(anime.rating) > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold text-sm">
                  <Star size={13} className="fill-yellow-400" />
                  {String(anime.rating)}/10
                </span>
              )}
            </div>

            {/* Genres */}
            {anime.genres && Array.isArray(anime.genres) && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(anime.genres as string[]).map(g => (
                  <span key={g} className="px-2.5 py-1 rounded-full text-xs bg-accent-primary/15 text-accent-primary border border-accent-primary/25">{g}</span>
                ))}
              </div>
            )}

            {anime.synopsis && (
              <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-2xl line-clamp-4">
                {String(anime.synopsis)}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {firstEp ? (
                <Link href={makeWatchUrl(firstEp)}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-primary/30">
                  <Play size={18} className="fill-white" /> Tonton Ep 1
                </Link>
              ) : (
                <div className="text-text-muted text-sm py-3">Episode belum tersedia</div>
              )}
              <button onClick={handleWatchlist}
                className="flex items-center gap-2 px-5 py-3 bg-bg-primary hover:bg-bg-tertiary border border-border text-text-primary font-medium rounded-xl transition-all">
                {isInWatchlist ? <BookmarkCheck size={18} className="text-accent-primary" /> : <Bookmark size={18} />}
                {isInWatchlist ? 'Di Watchlist' : 'Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episode List */}
      {episodes.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Daftar Episode ({episodes.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {episodes.map(ep => {
              const num = Number(ep.episode_number)
              return (
                <Link key={String(ep.episode_id || num)} href={makeWatchUrl(ep)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary transition-colors border-b border-border/50 last:border-0">
                  <span className="text-xs font-mono font-bold w-8 text-right text-text-muted flex-shrink-0">{num}</span>
                  <p className="text-sm text-text-primary truncate flex-1">
                    {String(ep.title || `Episode ${num}`)}
                  </p>
                  {ep.is_filler && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Filler</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <div>
          <h3 className="font-bold text-text-primary mb-4">Anime Serupa</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {recommended.slice(0, 12).map((r: Record<string, unknown>, i: number) => (
              <Link key={String(r.id || i)} href={`/anime/${String(r.id || '')}`}
                className="group">
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-bg-secondary mb-1.5">
                  <Image src={String(r.poster || '/placeholder-cover.svg')} alt={String(r.title || r.name || '')}
                    width={120} height={160} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" unoptimized />
                </div>
                <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors line-clamp-2">
                  {String(r.name || r.title || '')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
