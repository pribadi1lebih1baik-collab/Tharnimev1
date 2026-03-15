import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ContentCard from '@/components/ui/ContentCard'
import { ContentCardSkeleton } from '@/components/ui/LoadingSkeleton'

interface ContentRowProps {
  title: string
  viewAllHref?: string
  items: Array<{
    id: string
    slug?: string
    title: string
    poster: string
    type: 'anime' | 'donghua' | 'manga' | 'comic'
    status?: string
    rating?: number
    genres?: string[]
    episodeCount?: number
  }>
  isLoading?: boolean
  itemCount?: number
}

export default function ContentRow({ title, viewAllHref, items, isLoading, itemCount = 8 }: ContentRowProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-text-primary">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="flex items-center gap-1 text-sm text-accent-primary hover:text-accent-secondary transition-colors font-medium">
            Lihat Semua <ChevronRight size={15} />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {isLoading
          ? Array.from({ length: itemCount }).map((_, i) => <ContentCardSkeleton key={i} />)
          : items.slice(0, itemCount).map((item) => (
            <ContentCard key={item.id || item.slug} {...item} className="flex-shrink-0" />
          ))
        }
      </div>
    </section>
  )
}
