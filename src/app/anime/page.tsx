'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ContentCard from '@/components/ui/ContentCard'
import { ContentCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { cn } from '@/lib/utils'

const TYPES = [
  { value: 'ongoing', label: '🔴 Sedang Tayang' },
  { value: 'popular', label: '🔥 Populer' },
  { value: 'movies', label: '🎬 Movie' },
  { value: 'upcoming', label: '📅 Upcoming' },
]

export default function AnimePage() {
  const [type, setType] = useState('ongoing')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['anime-list', type, page],
    queryFn: () => fetch(`/api/anime?type=${type}&page=${page}`).then(r => r.json()),
  })

  const items = (data?.data || []) as Record<string, unknown>[]
  const hasNext = data?.pagination?.has_next_page || (data?.has_next) || false

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-text-primary mb-2">🎌 Anime</h1>
        <p className="text-text-muted">Tonton anime favoritmu</p>
      </div>

      <div className="flex bg-bg-secondary border border-border rounded-xl p-1 gap-1 w-fit mb-8 flex-wrap">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => { setType(t.value); setPage(1) }}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              type === t.value ? 'bg-accent-primary text-white shadow' : 'text-text-secondary hover:text-text-primary')}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 18 }).map((_, i) => <ContentCardSkeleton key={i} size="lg" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">Tidak ada data</p>
          <p className="text-sm">API mungkin sedang sibuk, coba lagi sebentar</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {items.map((item, i) => (
            <ContentCard
              key={String(item.id || item.mal_id || i)}
              id={String(item.id || item.mal_id || '')}
              title={String(item.title || '')}
              poster={String(item.poster || '')}
              type="anime"
              status={String(item.status || '')}
              rating={Number(item.rating) || undefined}
              genres={(item.genres as string[]) || []}
              episodeCount={Number(item.episodes_count) || undefined}
              size="lg"
            />
          ))}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 hover:text-text-primary transition-colors text-sm">← Sebelumnya</button>
          <span className="px-4 py-2 text-text-muted text-sm">Halaman {page}</span>
          <button disabled={!hasNext} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 hover:text-text-primary transition-colors text-sm">Berikutnya →</button>
        </div>
      )}
    </div>
  )
}
