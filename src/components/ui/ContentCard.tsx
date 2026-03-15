'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Play, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentCardProps {
  id: string
  slug?: string
  title: string
  poster: string
  type: 'anime' | 'donghua' | 'manga' | 'comic'
  status?: string
  rating?: number
  episodeCount?: number
  genres?: string[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ContentCard({
  id, slug, title, poster, type, status, rating,
  episodeCount, genres, className, size = 'md'
}: ContentCardProps) {
  const href = type === 'manga'
    ? `/manga/${id}`
    : type === 'comic'
      ? `/comic/${slug || id}`
      : `/${type}/${slug || id}`

  const isVideo = type === 'anime' || type === 'donghua'

  const widths = { sm: 'w-36', md: 'w-44', lg: 'w-52' }

  return (
    <Link href={href} className={cn('group flex flex-col', widths[size], className)}>
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-bg-secondary">
        <Image
          src={poster || '/placeholder-cover.svg'}
          alt={title}
          fill
          sizes="(max-width: 640px) 144px, 176px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-cover.svg'
          }}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-accent-primary/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
            {isVideo
              ? <Play size={20} className="text-white fill-white ml-1" />
              : <BookOpen size={18} className="text-white" />}
          </div>
        </div>
        {status && (
          <div className={cn(
            'absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-md',
            status === 'ongoing' ? 'bg-green-500/90 text-white' :
            status === 'completed' ? 'bg-blue-500/90 text-white' :
            'bg-bg-secondary/90 text-text-secondary'
          )}>
            {status === 'ongoing' ? 'Ongoing' : status === 'completed' ? 'Completed' : status}
          </div>
        )}
        {rating && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-md">
            <Star size={10} className="fill-yellow-400" />
            {typeof rating === 'number' ? rating.toFixed(1) : rating}
          </div>
        )}
        {episodeCount && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-text-secondary text-xs px-2 py-0.5 rounded-md">
            {episodeCount} Ep
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent-primary transition-colors leading-tight">
          {title}
        </h3>
        {genres && genres.length > 0 && (
          <p className="text-xs text-text-muted mt-1 line-clamp-1">
            {genres.slice(0, 2).join(', ')}
          </p>
        )}
      </div>
    </Link>
  )
}
