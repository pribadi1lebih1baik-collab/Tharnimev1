'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import MangaReader from '@/components/reader/MangaReader'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function ReadMangaPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const { user } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['manga-chapter-pages', chapterId],
    queryFn: () => fetch(`/api/manga/chapter/${chapterId}`).then(r => r.json()),
    enabled: !!chapterId,
  })

  useEffect(() => {
    if (!user || !chapterId) return
    fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'read',
        manga_id: '',
        source: 'mangadex',
        chapter_id: chapterId,
        chapter_number: 0,
        title: 'Chapter',
        cover: '',
        page_number: 1,
      }),
    }).catch(() => {})
  }, [user, chapterId])

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-10 h-10 text-accent-primary animate-spin" />
        <p className="text-white/60">Memuat chapter...</p>
      </div>
    </div>
  )

  if (error || !data || data.error) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white/60">
      Gagal memuat chapter. Coba lagi nanti.
    </div>
  )

  const pages = (data.pages || []) as string[]

  return <MangaReader pages={pages} chapterTitle={`Chapter ${chapterId}`} />
}
