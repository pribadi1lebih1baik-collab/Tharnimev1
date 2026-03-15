'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, Loader } from 'lucide-react'
import ContentCard from '@/components/ui/ContentCard'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeType, setActiveType] = useState('all')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', query, activeType],
    queryFn: () => fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeType}`).then(r => r.json()),
    enabled: query.length >= 2,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const animeResults: Record<string, unknown>[] = data?.anime || []
  const mangaResults: Record<string, unknown>[] = data?.manga || []
  const comicResults: Record<string, unknown>[] = data?.comic || []
  const totalResults = animeResults.length + mangaResults.length + comicResults.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Cari anime, manga, donghua, komik..."
              className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary text-sm transition-colors" />
          </div>
          <button type="submit" className="px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-xl transition-colors">Cari</button>
        </form>
        <div className="flex gap-2 mt-4">
          {[['all', 'Semua'], ['anime', 'Anime'], ['manga', 'Manga'], ['comic', 'Komik']].map(([v, l]) => (
            <button key={v} onClick={() => setActiveType(v)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all', activeType === v ? 'bg-accent-primary text-white' : 'bg-bg-secondary text-text-secondary border border-border hover:text-text-primary')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="flex items-center gap-3 text-text-muted py-12 justify-center">
          <Loader className="w-5 h-5 animate-spin" /> Mencari "{query}"...
        </div>
      ) : query.length >= 2 ? (
        <div>
          <p className="text-text-muted text-sm mb-6">
            {totalResults > 0 ? `Ditemukan ${totalResults} hasil untuk "${query}"` : `Tidak ada hasil untuk "${query}"`}
          </p>
          {(activeType === 'all' || activeType === 'anime') && animeResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">🎌 Anime ({animeResults.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {animeResults.map((item, i) => (
                  <ContentCard key={String(item.slug || item.id || i)} id={String(item.slug || item.id || '')} slug={String(item.slug || '')}
                    title={String(item.title || '')} poster={String(item.poster || item.cover || '')} type="anime" status={String(item.status || '')} size="lg" />
                ))}
              </div>
            </div>
          )}
          {(activeType === 'all' || activeType === 'manga') && mangaResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">📖 Manga ({mangaResults.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {mangaResults.map((item, i) => (
                  <ContentCard key={String(item.id || i)} id={String(item.id || '')}
                    title={String(item.title || '')} poster={String(item.cover || item.poster || '')} type="manga" status={String(item.status || '')} size="lg" />
                ))}
              </div>
            </div>
          )}
          {(activeType === 'all' || activeType === 'comic') && comicResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">📚 Komik ({comicResults.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {comicResults.map((item, i) => (
                  <ContentCard key={String(item.slug || item.id || i)} id={String(item.slug || item.id || '')} slug={String(item.slug || '')}
                    title={String(item.title || '')} poster={String(item.poster || item.cover || '')} type="comic" status={String(item.status || '')} size="lg" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p>Ketik minimal 2 karakter untuk mencari</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-96"><Loader className="w-8 h-8 animate-spin text-accent-primary" /></div>}>
      <SearchResults />
    </Suspense>
  )
}
