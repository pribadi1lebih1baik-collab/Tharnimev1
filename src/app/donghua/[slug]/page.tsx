'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Bookmark } from 'lucide-react'
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeleton'
import Badge from '@/components/ui/Badge'
import EpisodeList from '@/components/player/EpisodeList'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function DonghuaDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated } = useAuth()
  const { isInWatchlist, upsertMutation } = useWatchlist(slug, 'donghua')

  const { data, isLoading } = useQuery({
    queryKey: ['donghua-detail', slug],
    queryFn: () => fetch(`/api/donghua/${slug}`).then(r => r.json()),
    enabled: !!slug,
  })

  if (isLoading) return <DetailPageSkeleton />
  if (!data || data.error)
    return <div className="flex items-center justify-center min-h-96 text-text-muted">Konten tidak ditemukan</div>

  const donghua = (data.detail || data.donghua || data) as Record<string, unknown>
  const episodes: Record<string, unknown>[] = (data.episodes || donghua.episode_list || []) as Record<string, unknown>[]
  const firstEp = episodes[episodes.length - 1] || episodes[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-8">
        <div className="flex flex-col md:flex-row gap-8 p-6 bg-bg-secondary rounded-2xl border border-border">
          <div className="flex-shrink-0 w-48 aspect-[3/4] rounded-xl overflow-hidden mx-auto md:mx-0">
            <Image
              src={String(donghua.poster || donghua.cover || '/placeholder-cover.svg')}
              alt={String(donghua.title || '')}
              width={192}
              height={288}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-display font-black text-text-primary mb-3">
              {String(donghua.title || '')}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {donghua.status && <Badge variant="success">{String(donghua.status)}</Badge>}
              {donghua.episodes_count && <Badge>{String(donghua.episodes_count)} Ep</Badge>}
            </div>
            {donghua.synopsis && (
              <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-2xl">
                {String(donghua.synopsis)}
              </p>
            )}
            <div className="flex gap-3 flex-wrap">
              {firstEp && (
                <Link
                  href={`/donghua/watch/${String((firstEp as Record<string, unknown>).slug || (firstEp as Record<string, unknown>).id || '')}`}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <Play size={18} className="fill-white" /> Tonton
                </Link>
              )}
              <button
                onClick={() => {
                  if (!isAuthenticated) { toast.error('Login dulu'); return }
                  upsertMutation.mutate({
                    content_id: slug,
                    content_type: 'donghua',
                    title: String(donghua.title || ''),
                    poster: String(donghua.poster || ''),
                    status: 'plan_to_watch',
                  })
                  toast.success('Ditambahkan!')
                }}
                className="flex items-center gap-2 px-5 py-3 bg-bg-primary border border-border text-text-primary rounded-xl hover:bg-bg-tertiary transition-all"
              >
                <Bookmark size={18} className={isInWatchlist ? 'text-accent-primary' : ''} />
                {isInWatchlist ? 'Di Watchlist' : 'Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {episodes.length > 0 && (
        <EpisodeList
          episodes={episodes.map(e => ({
            slug: String(e.slug || ''),
            id: String(e.id || ''),
            title: String(e.title || ''),
            episode_number: Number(e.episode_number) || 0,
          }))}
          animeSlug={slug}
          type="donghua"
        />
      )}
    </div>
  )
}
