'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MangaReaderProps {
  pages: string[]
  chapterTitle?: string
  onPrevChapter?: () => void
  onNextChapter?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  onPageChange?: (page: number) => void
  initialPage?: number
}

type ReadMode = 'vertical' | 'horizontal' | 'single'

export default function MangaReader({
  pages, chapterTitle, onPrevChapter, onNextChapter,
  hasPrev, hasNext, onPageChange, initialPage = 1
}: MangaReaderProps) {
  const [mode, setMode] = useState<ReadMode>('vertical')
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)

  const goToPage = useCallback((page: number) => {
    const p = Math.max(1, Math.min(pages.length, page))
    setCurrentPage(p)
    onPageChange?.(p)
    if (mode !== 'vertical') {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pages.length, mode, onPageChange])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode === 'horizontal' || mode === 'single') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(currentPage + 1)
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(currentPage - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, currentPage, goToPage])

  if (!pages || pages.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/60">
        Halaman tidak tersedia
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Top Controls */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <span className="text-white text-sm font-medium truncate">{chapterTitle}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex bg-white/10 rounded-lg p-0.5">
              {(['vertical', 'horizontal', 'single'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={cn('px-2 py-1 rounded-md text-xs font-medium transition-colors',
                    mode === m ? 'bg-accent-primary text-white' : 'text-white/60 hover:text-white')}>
                  {m === 'vertical' ? 'Strip' : m === 'horizontal' ? 'Slide' : 'Single'}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 text-white/60 hover:text-white"><ZoomOut size={14} /></button>
              <span className="text-xs text-white/60 w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 text-white/60 hover:text-white"><ZoomIn size={14} /></button>
            </div>
            {mode !== 'vertical' && (
              <span className="text-xs text-white/60">{currentPage}/{pages.length}</span>
            )}
          </div>
        </div>
      </div>

      {/* Pages */}
      <div ref={containerRef} className="max-w-4xl mx-auto">
        {mode === 'vertical' ? (
          <div className="flex flex-col items-center">
            {pages.map((url, i) => (
              <div key={i} className="w-full max-w-2xl" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                <img src={url} alt={`Page ${i + 1}`} className="w-full h-auto block"
                  loading={i < 3 ? 'eager' : 'lazy'} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative flex items-center justify-center min-h-screen px-4">
            {pages[currentPage - 1] && (
              <img src={pages[currentPage - 1]} alt={`Page ${currentPage}`}
                className="max-h-screen object-contain mx-auto"
                style={{ transform: `scale(${zoom / 100})` }} />
            )}
            <button onClick={() => currentPage > 1 ? goToPage(currentPage - 1) : onPrevChapter?.()}
              className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity">
              <ChevronLeft className="text-white w-8 h-8 bg-black/50 rounded-full p-1" />
            </button>
            <button onClick={() => currentPage < pages.length ? goToPage(currentPage + 1) : onNextChapter?.()}
              className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity">
              <ChevronRight className="text-white w-8 h-8 bg-black/50 rounded-full p-1" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-30 bg-black/90 backdrop-blur-sm border-t border-white/10 p-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button onClick={onPrevChapter} disabled={!hasPrev}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors">
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          {mode !== 'vertical' && (
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-white text-sm w-20 text-center">{currentPage} / {pages.length}</span>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= pages.length}
                className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <button onClick={onNextChapter} disabled={!hasNext}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary hover:bg-accent-secondary disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors">
            Berikutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
