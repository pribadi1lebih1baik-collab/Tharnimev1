'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import type { WatchlistItem, WatchStatus } from '@/types'

interface UpsertWatchlistItem {
  content_id: string
  content_type: 'anime' | 'donghua'
  title: string
  poster: string
  status: WatchStatus
  rating?: number
  progress?: number
  total_episodes?: number
}

export function useWatchlist(contentId?: string, contentType?: 'anime' | 'donghua') {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: watchlistItem } = useQuery<WatchlistItem | null>({
    queryKey: ['watchlist-item', user?.id, contentId, contentType],
    queryFn: async () => {
      if (!user || !contentId) return null
      const res = await fetch(
        `/api/user/watchlist?content_id=${contentId}&content_type=${contentType}`
      )
      if (!res.ok) return null
      const data = await res.json()
      return (data.item as WatchlistItem) || null
    },
    enabled: !!user && !!contentId,
  })

  const { data: watchlist } = useQuery<WatchlistItem[]>({
    queryKey: ['watchlist', user?.id],
    queryFn: async () => {
      if (!user) return []
      const res = await fetch('/api/user/watchlist')
      if (!res.ok) return []
      return res.json() as Promise<WatchlistItem[]>
    },
    enabled: !!user,
  })

  const upsertMutation = useMutation({
    mutationFn: async (item: UpsertWatchlistItem) => {
      const res = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (!res.ok) throw new Error('Failed to update watchlist')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['watchlist-item', user?.id, contentId] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/watchlist?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove from watchlist')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['watchlist-item', user?.id, contentId] })
    },
  })

  return {
    watchlistItem: watchlistItem ?? null,
    watchlist: watchlist ?? [],
    upsertMutation,
    removeMutation,
    isInWatchlist: !!watchlistItem,
  }
}
