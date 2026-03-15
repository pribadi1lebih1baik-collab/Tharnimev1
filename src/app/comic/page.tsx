'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ContentCard from '@/components/ui/ContentCard'
import { ContentCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { cn } from '@/lib/utils'

const TYPES = [
  { value: 'newest',      label: '🆕 Terbaru'  },
  { value: 'popular',     label: '🔥 Populer'  },
  { value: 'recommended', label: '⭐ Rekomendasi' },
  { value: 'list&filter=manhwa',  label: '🇰🇷 Manhwa' },
  { value: 'list&filter=manhua',  label: '🇨🇳 Manhua' },
  { value: 'list&filter=manga',   label: '🇯🇵 Manga'  },
]

export default function ComicPage() {
  const [type, setType] = useState('newest')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['comic-list', type, page],
    queryFn: () => fetch(`/api/comic?type=${type}&page=${page}`).then(r => r.json()),
  })

  const items = (data?.data || []) as Record<string, unknown>[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-text-primary mb-2">📚 Komik Indonesia</h1>
        <p className="text-text-muted">Baca manga, manhwa, manhua bahasa Indonesia</p>
      </div>

      <div className="flex bg-bg-secondary border border-border rounded-xl p-1 gap-1 mb-8 flex-wrap">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => { setType(t.value); setPage(1) }}
            className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-all',
              type === t.value ? 'bg-orange-600 text-white' : 'text-text-secondary hover:text-text-primary')}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <ContentCardSkeleton key={i} size="lg" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-text-muted">Tidak ada data</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {items.map((item, i) => (
            <ContentCard
              key={String(item.id || i)}
              id={String(item.id || '')}
              slug={String(item.slug || item.endpoint || '')}
              title={String(item.title || '')}
              poster={String(item.poster || '')}
              type="comic"
              status={String(item.status || '')}
              size="lg"
            />
          ))}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 text-sm">← Sebelumnya</button>
          <span className="px-4 py-2 text-text-muted text-sm">Halaman {page}</span>
          <button disabled={items.length < 15} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 text-sm">Berikutnya →</button>
        </div>
      )}
    </div>
  )
}
