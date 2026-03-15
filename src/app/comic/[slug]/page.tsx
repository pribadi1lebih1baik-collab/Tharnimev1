'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { DetailPageSkeleton } from '@/components/ui/LoadingSkeleton'
import Badge from '@/components/ui/Badge'

export default function ComicDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  // slug dari URL sudah berupa "one-punch-man" (tanpa /manga/ prefix)
  const { data, isLoading } = useQuery({
    queryKey: ['comic-detail', slug],
    queryFn: () => fetch(`/api/comic/${slug}`).then(r => r.json()),
    enabled: !!slug,
  })

  if (isLoading) return <DetailPageSkeleton />
  if (!data || data.error) return (
    <div className="flex items-center justify-center min-h-96 text-text-muted">
      Komik tidak ditemukan
    </div>
  )

  const comic = (data.comic || {}) as Record<string, unknown>
  const chapters = (data.chapters || []) as Record<string, unknown>[]
  const firstChapter  = chapters[chapters.length - 1]
  const latestChapter = chapters[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8 bg-bg-secondary rounded-2xl border border-border p-6">
        <div className="flex-shrink-0 w-48 aspect-[3/4] rounded-xl overflow-hidden mx-auto md:mx-0 shadow-xl">
          <Image
            src={String(comic.poster || '/placeholder-cover.svg')}
            alt={String(comic.title || '')}
            width={192} height={288}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-display font-black text-text-primary mb-3">
            {String(comic.title || '')}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {comic.status && <Badge variant="success">{String(comic.status)}</Badge>}
            {comic.type   && <Badge>{String(comic.type)}</Badge>}
            {chapters.length > 0 && <Badge>{chapters.length} Chapter</Badge>}
            {comic.author && <span className="text-text-muted text-sm">oleh {String(comic.author)}</span>}
          </div>

          {/* Genres */}
          {Array.isArray(comic.genres) && comic.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(comic.genres as string[]).map(g => (
                <span key={g} className="px-2.5 py-1 rounded-full text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {g}
                </span>
              ))}
            </div>
          )}

          {comic.synopsis && (
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              {String(comic.synopsis)}
            </p>
          )}

          <div className="flex gap-3 flex-wrap">
            {firstChapter && (
              <Link
                href={`/comic/read/${String(firstChapter.id || '')}`}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              >
                <BookOpen size={18} /> Mulai Baca
              </Link>
            )}
            {latestChapter && latestChapter.id !== firstChapter?.id && (
              <Link
                href={`/comic/read/${String(latestChapter.id || '')}`}
                className="flex items-center gap-2 px-5 py-3 bg-bg-primary border border-border text-text-primary rounded-xl hover:bg-bg-tertiary transition-all text-sm"
              >
                Chapter Terbaru
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chapter List */}
      {chapters.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Chapter List ({chapters.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {chapters.map(ch => (
              <Link
                key={String(ch.id || ch.slug || '')}
                href={`/comic/read/${String(ch.id || '')}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-bg-tertiary transition-colors border-b border-border/50 last:border-0"
              >
                <span className="text-sm text-text-primary">{String(ch.title || '')}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
