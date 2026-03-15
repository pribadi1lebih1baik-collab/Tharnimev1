'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ContentCard from '@/components/ui/ContentCard'
import { ContentCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { buildQueryString } from '@/lib/utils'

export default function DonghuaPage() {
  const [type, setType] = useState('ongoing')
  const [page, setPage] = useState(1)
  const TYPES = [{ value: 'ongoing', label: 'Sedang Tayang' }, { value: 'completed', label: 'Selesai' }]

  const { data, isLoading } = useQuery({
    queryKey: ['donghua-list', type, page],
    queryFn: () => fetch(`/api/donghua${buildQueryString({ type, page })}`).then(r => r.json()),
  })

  const items = data?.data || data?.results || data?.donghuaList || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-text-primary mb-2">🐉 Donghua</h1>
        <p className="text-text-muted">Tonton animasi China terbaru dengan subtitle Indonesia</p>
      </div>
      <div className="flex bg-bg-secondary border border-border rounded-xl p-1 gap-1 w-fit mb-8">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => { setType(t.value); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === t.value ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 18 }).map((_, i) => <ContentCardSkeleton key={i} size="lg" />)
          : items.map((item: Record<string, unknown>, i: number) => (
            <ContentCard key={String(item.slug || item.id || i)}
              id={String(item.slug || item.id || '')} slug={String(item.slug || '')}
              title={String(item.title || '')} poster={String(item.poster || item.cover || '')}
              type="donghua" status={String(item.status || '')} size="lg" />
          ))}
      </div>
      {!isLoading && items.length > 0 && (
        <div className="flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 hover:text-text-primary transition-colors text-sm">← Sebelumnya</button>
          <span className="px-4 py-2 text-text-muted text-sm">Halaman {page}</span>
          <button disabled={items.length < 20} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary disabled:opacity-30 hover:text-text-primary transition-colors text-sm">Berikutnya →</button>
        </div>
      )}
    </div>
  )
}
