'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ContentCard from '@/components/ui/ContentCard'
import { ContentCardSkeleton } from '@/components/ui/LoadingSkeleton'

const STATUSES = [{ value: '', label: 'Semua' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }]
const ORDERS = [{ value: 'followedCount', label: 'Populer' }, { value: 'updatedAt', label: 'Terbaru' }, { value: 'rating', label: 'Rating' }]

export default function MangaPage() {
  const [status, setStatus] = useState('')
  const [order, setOrder] = useState('followedCount')
  const [offset, setOffset] = useState(0)
  const LIMIT = 24

  const { data, isLoading } = useQuery({
    queryKey: ['manga-list', status, order, offset],
    queryFn: () => fetch(`/api/manga?limit=${LIMIT}&offset=${offset}${status ? `&status=${status}` : ''}&order=${order}`).then(r => r.json()),
  })

  const items = data?.data || []
  const total = data?.total || 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-text-primary mb-2">📖 Manga Global</h1>
        <p className="text-text-muted">Ribuan judul manga, manhwa, manhua dari MangaDex</p>
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex bg-bg-secondary border border-border rounded-xl p-1 gap-1">
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => { setStatus(s.value); setOffset(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === s.value ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex bg-bg-secondary border border-border rounded-xl p-1 gap-1">
          {ORDERS.map(o => (
            <button key={o.value} onClick={() => { setOrder(o.value); setOffset(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${order === o.value ? 'bg-green-600 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: LIMIT }).map((_, i) => <ContentCardSkeleton key={i} size="lg" />)
          : items.map((item: Record<string, unknown>, i: number) => (
            <ContentCard key={String(item.id || i)} id={String(item.id || '')}
              title={String(item.title || '')} poster={String(item.cover || item.poster || '')}
              type="manga" status={String(item.status || '')} genres={(item.genres as string[]) || []} size="lg" />
          ))}
      </div>
      {!isLoading && (
        <div className="flex justify-center gap-3">
          <button disabled={offset <= 0} onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 hover:text-text-primary text-sm">← Sebelumnya</button>
          <span className="px-4 py-2 text-text-muted text-sm">{offset / LIMIT + 1} / {Math.ceil(total / LIMIT) || '?'}</span>
          <button disabled={items.length < LIMIT} onClick={() => setOffset(offset + LIMIT)}
            className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 hover:text-text-primary text-sm">Berikutnya →</button>
        </div>
      )}
    </div>
  )
}
