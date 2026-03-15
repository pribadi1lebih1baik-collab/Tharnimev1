'use client'
import { cn } from '@/lib/utils'

interface GenreFilterProps {
  genres: string[]
  selected: string
  onChange: (genre: string) => void
}

export default function GenreFilter({ genres, selected, onChange }: GenreFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {['Semua', ...genres].map((genre) => (
        <button key={genre}
          onClick={() => onChange(genre === 'Semua' ? '' : genre)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            (genre === 'Semua' ? !selected : selected === genre)
              ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border'
          )}>
          {genre}
        </button>
      ))}
    </div>
  )
}
