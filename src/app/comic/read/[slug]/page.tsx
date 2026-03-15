'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import MangaReader from '@/components/reader/MangaReader'
import { Loader } from 'lucide-react'

export default function ReadComicPage() {
  const { slug } = useParams<{ slug: string }>()

  // slug: "one-punch-man-chapter-1" (tanpa /ch/ prefix dan trailing slash)
  const { data, isLoading, error } = useQuery({
    queryKey: ['comic-chapter', slug],
    queryFn: () => fetch(`/api/comic/chapter/${slug}`).then(r => r.json()),
    enabled: !!slug,
  })

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-white/60">Memuat chapter...</p>
      </div>
    </div>
  )

  if (error || !data || data.error || !data.pages?.length) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 text-white/60">
      <p>Gagal memuat chapter</p>
      <p className="text-sm text-white/40">
        {String(data?.error || error || 'Coba lagi nanti')}
      </p>
    </div>
  )

  return (
    <MangaReader
      pages={(data.pages as string[]) || []}
      chapterTitle={String(data.title || slug)}
    />
  )
}
