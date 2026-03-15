'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Bookmark } from 'lucide-react'
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeleton'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['manga-detail', id],
    queryFn: () => fetch(`/api/manga/${id}`).then(r => r.json()),
    enabled: !!id,
  })

  const readingListMutation = useMutation({
    mutationFn: (item: Record<string, unknown>) =>
      fetch('/api/user/reading-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-list'] })
      toast.success('Ditambahkan ke reading list!')
    },
  })

  if (isLoading) return <DetailPageSkeleton />
  if (!data || data.error)
    return <div className="flex items-center justify-center min-h-96 text-text-muted">Manga tidak ditemukan</div>

  const manga = data.manga as Record<string, unknown>
  const chapters: Record<string, unknown>[] = data.chapters || []
  const firstChapter = chapters[chapters.length - 1]
  const latestChapter = chapters[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0 w-48 aspect-[3/4] rounded-xl overflow-hidden mx-auto md:mx-0 shadow-2xl">
          <Image
            src={String(manga?.cover || '/placeholder-cover.svg')}
            alt={String(manga?.title || '')}
            width={192}
            height={288}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-display font-black text-text-primary mb-3">
            {String(manga?.title || '')}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {manga?.status && (
              <Badge variant={manga.status === 'ongoing' ? 'success' : 'info'}>
                {String(manga.status)}
              </Badge>
            )}
            {chapters.length > 0 && <Badge>{chapters.length} Chapter</Badge>}
            {manga?.year && <Badge>{String(manga.year)}</Badge>}
            {manga?.author && (
              <span className="text-text-muted text-sm">oleh {String(manga.author)}</span>
            )}
          </div>
          {manga?.genres && Array.isArray(manga.genres) && manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(manga.genres as string[]).map((g: string) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
          {manga?.synopsis && (
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-2xl">
              {String(manga.synopsis)}
            </p>
          )}
          <div className="flex gap-3 flex-wrap">
            {firstChapter && (
              <Link
                href={`/manga/read/${String(firstChapter.id || '')}`}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              >
                <BookOpen size={18} /> Mulai Baca
              </Link>
            )}
            {latestChapter && latestChapter.id !== firstChapter?.id && (
              <Link
                href={`/manga/read/${String(latestChapter.id || '')}`}
                className="flex items-center gap-2 px-5 py-3 bg-bg-secondary border border-border text-text-primary rounded-xl hover:bg-bg-tertiary transition-all text-sm"
              >
                Chapter Terbaru
              </Link>
            )}
            <button
              onClick={() => {
                if (!user) { toast.error('Login dulu'); return }
                readingListMutation.mutate({
                  content_id: id,
                  source: 'mangadex',
                  title: String(manga?.title || ''),
                  cover: String(manga?.cover || ''),
                  status: 'plan_to_read',
                })
              }}
              className="flex items-center gap-2 px-5 py-3 bg-bg-secondary border border-border text-text-primary rounded-xl hover:bg-bg-tertiary transition-all"
            >
              <Bookmark size={16} /> Reading List
            </button>
          </div>
        </div>
      </div>

      {chapters.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Daftar Chapter ({chapters.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {chapters.map((ch) => {
              const attrs = (ch.attributes as Record<string, unknown>) || {}
              return (
                <Link
                  key={String(ch.id)}
                  href={`/manga/read/${String(ch.id)}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-bg-tertiary transition-colors border-b border-border/50 last:border-0"
                >
                  <span className="text-sm text-text-primary">
                    Chapter {String(attrs.chapter ?? '?')}
                    {attrs.title ? ` — ${String(attrs.title)}` : ''}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted">
                      {String(attrs.translatedLanguage || '').toUpperCase()}
                    </span>
                    {attrs.publishAt && (
                      <span className="text-xs text-text-muted">
                        {new Date(String(attrs.publishAt)).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
