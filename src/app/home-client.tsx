'use client'
import { useQuery } from '@tanstack/react-query'
import HeroBanner from '@/components/home/HeroBanner'
import ContentRow from '@/components/home/ContentRow'
import { Tv, BookOpen, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function HomeClient() {
  const { data: animeOngoing, isLoading: loadingAnime } = useQuery({
    queryKey: ['home-anime-ongoing'],
    queryFn: () => fetch('/api/anime?type=ongoing&page=1').then(r => r.json()),
  })

  const { data: animeTrending, isLoading: loadingTrending } = useQuery({
    queryKey: ['home-anime-trending'],
    queryFn: () => fetch('/api/anime?type=popular').then(r => r.json()),
  })

  const { data: donghuaData, isLoading: loadingDonghua } = useQuery({
    queryKey: ['home-donghua'],
    queryFn: () => fetch('/api/donghua?type=ongoing').then(r => r.json()),
  })

  const { data: mangaData, isLoading: loadingManga } = useQuery({
    queryKey: ['home-manga'],
    queryFn: () => fetch('/api/manga?limit=12').then(r => r.json()),
  })

  const { data: comicData, isLoading: loadingComic } = useQuery({
    queryKey: ['home-comic'],
    queryFn: () => fetch('/api/comic?type=latest').then(r => r.json()),
  })

  const animeItems = ((animeOngoing?.data || []) as Record<string, unknown>[]).map(item => ({
    id: String(item.id || item.mal_id || ''),
    title: String(item.title || ''),
    poster: String(item.poster || ''),
    type: 'anime' as const,
    status: String(item.status || ''),
    rating: Number(item.rating) || undefined,
    genres: (item.genres as string[]) || [],
    episodeCount: Number(item.episodes_count) || undefined,
  }))

  const bannerItems = ((animeTrending?.data || []) as Record<string, unknown>[]).slice(0, 6).map(item => ({
    id: String(item.id || item.mal_id || ''),
    slug: String(item.id || item.mal_id || ''),
    title: String(item.title || ''),
    poster: String(item.poster || ''),
    synopsis: String(item.synopsis || ''),
    type: 'anime' as const,
    genres: (item.genres as string[]) || [],
    rating: Number(item.rating) || 0,
    status: String(item.status || ''),
  }))

  const donghuaItems = ((donghuaData?.data || []) as Record<string, unknown>[]).map(item => ({
    id: String(item.id || item.slug || ''),
    slug: String(item.slug || item.id || ''),
    title: String(item.title || ''),
    poster: String(item.poster || ''),
    type: 'donghua' as const,
    status: String(item.status || ''),
  }))

  const mangaItems = ((mangaData?.data || []) as Record<string, unknown>[]).map(item => ({
    id: String(item.id || ''),
    title: String(item.title || ''),
    poster: String(item.cover || item.poster || ''),
    type: 'manga' as const,
    status: String(item.status || ''),
    genres: (item.genres as string[]) || [],
  }))

  const comicItems = ((comicData?.data || comicData?.results || comicData?.comicList || []) as Record<string, unknown>[]).map(item => ({
    id: String(item.slug || item.id || ''),
    slug: String(item.slug || ''),
    title: String(item.title || ''),
    poster: String(item.poster || item.cover || ''),
    type: 'comic' as const,
    status: String(item.status || ''),
  }))

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="px-4 md:px-8 pt-4 mb-10">
        {bannerItems.length > 0 ? (
          <HeroBanner items={bannerItems} />
        ) : (
          <div className="w-full h-[400px] bg-bg-secondary rounded-2xl skeleton" />
        )}
      </div>

      {/* Quick nav */}
      <div className="px-4 md:px-8 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Anime Terbaru', href: '/anime', icon: Tv, color: 'from-purple-600/20 to-indigo-600/20 border-purple-500/20', text: 'text-purple-400' },
            { label: 'Donghua', href: '/donghua', icon: TrendingUp, color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/20', text: 'text-blue-400' },
            { label: 'Manga Global', href: '/manga', icon: BookOpen, color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/20', text: 'text-emerald-400' },
            { label: 'Komik Lokal', href: '/comic', icon: Clock, color: 'from-orange-600/20 to-red-600/20 border-orange-500/20', text: 'text-orange-400' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${item.color} border hover:scale-[1.02] transition-all duration-200`}>
              <item.icon size={20} className={item.text} />
              <span className="font-medium text-sm text-text-primary">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Rows */}
      <div className="px-4 md:px-8 space-y-10 pb-16">
        <ContentRow title="🔴 Anime Sedang Tayang" viewAllHref="/anime?type=ongoing"
          items={animeItems} isLoading={loadingAnime} />

        {donghuaItems.length > 0 && (
          <ContentRow title="🐉 Donghua Terbaru" viewAllHref="/donghua"
            items={donghuaItems} isLoading={loadingDonghua} />
        )}

        <ContentRow title="📖 Manga Populer" viewAllHref="/manga"
          items={mangaItems} isLoading={loadingManga} />

        {comicItems.length > 0 && (
          <ContentRow title="📚 Komik Indonesia" viewAllHref="/comic"
            items={comicItems} isLoading={loadingComic} />
        )}
      </div>
    </div>
  )
}
