'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value?: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: number
  className?: string
}

export default function StarRating({ value = 0, onChange, readonly = false, size = 16, className }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 10 }).map((_, i) => {
        const v = i + 1
        return (
          <button key={v} type="button"
            disabled={readonly}
            onClick={() => onChange?.(v)}
            onMouseEnter={() => !readonly && setHover(v)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform')}>
            <Star size={size}
              className={cn(v <= display ? 'text-yellow-400 fill-yellow-400' : 'text-border fill-transparent')} />
          </button>
        )
      })}
      {value > 0 && <span className="ml-2 text-sm text-text-secondary font-medium">{value}/10</span>}
    </div>
  )
}
