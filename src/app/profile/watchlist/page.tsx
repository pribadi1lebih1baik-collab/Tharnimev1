'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Trash2, ArrowLeft } from 'lucide-react'
import { cn, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import StarRating from '@/components/ui/StarRating'

const STATUSES = ['all', 'watching', 'plan_to_watch', 'completed', 'on_hold', 'dropped']

export default function WatchlistPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: () => fetch('/api/user/watchlist').then(r => r.json()),
    enabled: !!user,
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/user/watchlist?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['watchlist'] }); toast.success('Dihapus dari watchlist') },
  })

  const updateMutation = useMutation({
    mutationFn: (item: Record<string, unknown>) =>
      fetch('/api/user/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  })

  const items: Record<string, unknown>[] = Array.isArray(watchlist) ? watchlist : []
  const filtered = items.filter(item => {
    const statusOk = filter === 'all' || item.status === filter
    const typeOk = typeFilter === 'all' || item.content_type === typeFilter
    return statusOk && typeOk
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 text-text-muted hover:text-text-primary transition-colors"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-display font-bold text-text-primary">Daftar Tonton</h1>
        <span className="text-text-muted text-sm">({items.length} judul)</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 bg-bg-secondary border border-border rounded-xl p-1">
          {['all', 'anime', 'donghua'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', typeFilter === t ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary')}>
              {t === 'all' ? 'Semua' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-bg-secondary border border-border rounded-xl p-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filter === s ? 'bg-accent-secondary text-white' : 'text-text-secondary hover:text-text-primary')}>
              {s === 'all' ? 'Semua' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">Belum ada item</p>
          <Link href="/anime" className="text-accent-primary hover:text-accent-secondary text-sm">Cari anime →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={String(item.id)} className="flex items-center gap-4 p-4 bg-bg-secondary border border-border rounded-xl">
              <div className="w-12 h-16 rounded-lg bg-bg-tertiary flex-shrink-0 overflow-hidden">
                {item.poster && <img src={String(item.poster)} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/${String(item.content_type)}/${String(item.content_id)}`}
                  className="font-medium text-text-primary hover:text-accent-primary transition-colors truncate block text-sm">
                  {String(item.title || '')}
                </Link>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-text-muted capitalize">{String(item.content_type)}</span>
                  <select value={String(item.status || '')}
                    onChange={e => updateMutation.mutate({ ...item, status: e.target.value })}
                    className="text-xs bg-bg-primary border border-border rounded px-2 py-0.5 text-text-secondary focus:outline-none">
                    {STATUSES.slice(1).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.rating && <StarRating value={Number(item.rating)} readonly size={12} />}
                <button onClick={() => removeMutation.mutate(String(item.id))}
                  className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
