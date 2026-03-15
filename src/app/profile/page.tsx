'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { User, Edit3, Save, X, BookOpen, Tv, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetch('/api/user/profile').then(r => r.json()),
    enabled: !!user,
  })

  useEffect(() => {
    if (profile) {
      const p = profile as Record<string, unknown>
      setDisplayName(String(p.display_name || p.username || ''))
      setBio(String(p.bio || ''))
    }
  }, [profile])

  const { data: watchHistory } = useQuery({
    queryKey: ['watch-history', user?.id],
    queryFn: () => fetch('/api/user/history?type=watch&limit=8').then(r => r.json()),
    enabled: !!user,
  })

  const { data: watchlist } = useQuery({
    queryKey: ['watchlist-stats', user?.id],
    queryFn: () => fetch('/api/user/watchlist').then(r => r.json()),
    enabled: !!user,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profil diperbarui!')
      setIsEditing(false)
    },
  })

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <User size={48} className="text-text-muted" />
        <p className="text-text-muted">Silakan login untuk melihat profil</p>
        <Link href="/login" className="px-6 py-2 bg-accent-primary text-white rounded-xl font-medium hover:bg-accent-secondary transition-colors">Login</Link>
      </div>
    )
  }

  const watchlistArr: Record<string, unknown>[] = Array.isArray(watchlist) ? watchlist : []
  const watching = watchlistArr.filter(w => w.status === 'watching').length
  const completed = watchlistArr.filter(w => w.status === 'completed').length
  const planToWatch = watchlistArr.filter(w => w.status === 'plan_to_watch').length
  const profileData = profile as Record<string, unknown> | null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-bg-secondary border border-border rounded-2xl p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary text-sm"
                  placeholder="Display name"
                />
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary text-sm resize-none"
                  placeholder="Bio singkat..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateMutation.mutate({ display_name: displayName, bio })}
                    className="flex items-center gap-2 px-4 py-1.5 bg-accent-primary text-white text-sm rounded-lg hover:bg-accent-secondary transition-colors"
                  >
                    <Save size={14} /> Simpan
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-bg-tertiary text-text-secondary text-sm rounded-lg"
                  >
                    <X size={14} /> Batal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-text-primary">
                    {String(profileData?.display_name || user?.username || 'User')}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
                <p className="text-text-muted text-sm mb-1">@{user?.username}</p>
                <p className="text-text-secondary text-sm">{String(profileData?.bio || 'Belum ada bio')}</p>
                <p className="text-text-muted text-xs mt-2">
                  Bergabung{' '}
                  {new Date(user?.created_at || '').toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sedang Nonton', value: watching, icon: Tv, color: 'text-accent-primary' },
          { label: 'Selesai', value: completed, icon: Star, color: 'text-green-400' },
          { label: 'Plan Nonton', value: planToWatch, icon: Clock, color: 'text-yellow-400' },
          { label: 'Total List', value: watchlistArr.length, icon: BookOpen, color: 'text-pink-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-secondary border border-border rounded-xl p-4 text-center">
            <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link href="/profile/watchlist"
          className="flex items-center justify-between p-4 bg-bg-secondary border border-border rounded-xl hover:bg-bg-tertiary transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <Tv size={18} className="text-accent-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary text-sm">Daftar Tonton</p>
              <p className="text-xs text-text-muted">{watchlistArr.length} judul</p>
            </div>
          </div>
          <span className="text-text-muted">→</span>
        </Link>
        <Link href="/profile/reading-list"
          className="flex items-center justify-between p-4 bg-bg-secondary border border-border rounded-xl hover:bg-bg-tertiary transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <BookOpen size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-text-primary text-sm">Reading List</p>
              <p className="text-xs text-text-muted">Manga & komik tersimpan</p>
            </div>
          </div>
          <span className="text-text-muted">→</span>
        </Link>
      </div>

      {Array.isArray(watchHistory) && watchHistory.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <h2 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Clock size={16} /> Riwayat Tonton Terbaru
          </h2>
          <div className="space-y-3">
            {(watchHistory as Record<string, unknown>[]).slice(0, 5).map((item) => (
              <div key={String(item.id)} className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg">
                <div className="w-12 h-16 rounded-lg bg-bg-tertiary flex-shrink-0 overflow-hidden">
                  {item.poster && (
                    <img src={String(item.poster)} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{String(item.title || '')}</p>
                  <p className="text-xs text-text-muted">Episode {String(item.episode_number || '')}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(String(item.watched_at || '')).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <Link
                  href={`/${String(item.content_type)}/watch/${String(item.episode_id)}`}
                  className="text-xs text-accent-primary hover:text-accent-secondary transition-colors flex-shrink-0"
                >
                  Lanjut →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
