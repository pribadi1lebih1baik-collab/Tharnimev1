'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, BookOpen, Star, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BannerItem {
  id: string
  slug?: string
  title: string
  poster: string
  synopsis?: string
  type: 'anime' | 'donghua' | 'manga' | 'comic'
  genres?: string[]
  rating?: number
  status?: string
}

export default function HeroBanner({ items }: { items: BannerItem[] }) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => goTo((current + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [current, items.length])

  const goTo = (i: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent(i)
    setTimeout(() => setIsAnimating(false), 500)
  }

  if (!items || items.length === 0) return null
  const item = items[current]
  const isVideo = item.type === 'anime' || item.type === 'donghua'
  const href = isVideo ? `/${item.type}/${item.slug || item.id}` : `/${item.type}/${item.id}`

  return (
    <div className="relative w-full h-[70vh] min-h-[400px] max-h-[700px] overflow-hidden rounded-2xl">
      <div className={cn('absolute inset-0 transition-opacity duration-500', isAnimating ? 'opacity-50' : 'opacity-100')}>
        <Image
          src={item.poster || '/placeholder-cover.svg'}
          alt={item.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
      </div>

      <div className={cn(
        'absolute inset-0 flex items-end pb-12 px-6 md:px-12 transition-all duration-500',
        isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      )}>
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary/20 text-accent-primary border border-accent-primary/30 uppercase tracking-wide">
              {item.type}
            </span>
            {item.rating && item.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                <Star size={14} className="fill-yellow-400" />
                {item.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-tight mb-3 drop-shadow-lg">
            {item.title}
          </h1>
          {item.genres && item.genres.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {item.genres.slice(0, 4).map((g) => (
                <span key={g} className="text-xs text-text-secondary bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{g}</span>
              ))}
            </div>
          )}
          {item.synopsis && (
            <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2">
              {item.synopsis.slice(0, 180)}{item.synopsis.length > 180 ? '...' : ''}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Link
              href={href}
              className="flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-primary/30 hover:-translate-y-0.5"
            >
              {isVideo ? <Play size={18} className="fill-white" /> : <BookOpen size={18} />}
              {isVideo ? 'Tonton Sekarang' : 'Baca Sekarang'}
            </Link>
            <Link
              href={href}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl transition-all duration-200"
            >
              <Info size={16} /> Detail
            </Link>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 right-6 flex items-center gap-2">
          <button onClick={() => goTo((current - 1 + items.length) % items.length)}
            className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
            <ChevronLeft size={14} className="text-white" />
          </button>
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={cn('h-1.5 rounded-full transition-all duration-300', i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40')} />
            ))}
          </div>
          <button onClick={() => goTo((current + 1) % items.length)}
            className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
            <ChevronRight size={14} className="text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
