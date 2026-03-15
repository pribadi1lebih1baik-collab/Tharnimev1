'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Episode {
  slug?: string
  id?: string
  title?: string
  episode_number?: number
  aired?: string
}

interface EpisodeListProps {
  episodes: Episode[]
  currentSlug?: string
  animeSlug: string
  type: 'anime' | 'donghua'
}

export default function EpisodeList({ episodes, currentSlug, animeSlug, type }: EpisodeListProps) {
  const [search, setSearch] = useState('')
  const [sortDesc, setSortDesc] = useState(true)

  const filtered = episodes
    .filter(ep =>
      (ep.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      String(ep.episode_number ?? '').includes(search)
    )
    .sort((a, b) =>
      sortDesc
        ? (b.episode_number ?? 0) - (a.episode_number ?? 0)
        : (a.episode_number ?? 0) - (b.episode_number ?? 0)
    )

  const getHref = (ep: Episode) => {
    const id = ep.slug || ep.id || ''
    return `/${type}/watch/${id}`
  }

  const isActive = (ep: Episode) => (ep.slug || ep.id) === currentSlug

  return (
    <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Episode ({episodes.length})</h3>
        <button
          onClick={() => setSortDesc(!sortDesc)}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronDown size={14} className={cn('transition-transform', !sortDesc && 'rotate-180')} />
          {sortDesc ? 'Terbaru' : 'Terlama'}
        </button>
      </div>
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari episode..."
            className="w-full pl-8 pr-3 py-1.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-text-muted py-6 text-sm">Episode tidak ditemukan</p>
        ) : (
          filtered.map((ep, idx) => (
            <Link
              key={ep.slug || ep.id || idx}
              href={getHref(ep)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary transition-colors border-b border-border/50 last:border-0',
                isActive(ep) && 'bg-accent-primary/10 text-accent-primary'
              )}
            >
              <span className={cn(
                'text-xs font-mono font-bold w-8 text-right flex-shrink-0',
                isActive(ep) ? 'text-accent-primary' : 'text-text-muted'
              )}>
                {ep.episode_number ?? '?'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium truncate',
                  isActive(ep) ? 'text-accent-primary' : 'text-text-primary'
                )}>
                  {ep.title || `Episode ${ep.episode_number ?? '?'}`}
                </p>
                {ep.aired && <p className="text-xs text-text-muted">{ep.aired}</p>}
              </div>
              {isActive(ep) && (
                <div className="w-2 h-2 rounded-full bg-accent-primary flex-shrink-0 animate-pulse" />
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
