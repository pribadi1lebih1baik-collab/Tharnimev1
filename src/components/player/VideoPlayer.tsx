'use client'
import { useState, useRef, useEffect } from 'react'
import { SkipForward, SkipBack, Loader, Settings, Subtitles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamSource {
  quality?: string
  url: string
  type?: string
  isM3U8?: boolean
}

interface Subtitle {
  label: string
  url: string
  default?: boolean
}

interface VideoPlayerProps {
  sources: StreamSource[]
  subtitles?: Subtitle[]
  title?: string
  onNext?: () => void
  onPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
  intro?: { start: number; end: number } | null
  outro?: { start: number; end: number } | null
  onTimeUpdate?: (time: number) => void
}

export default function VideoPlayer({
  sources, subtitles = [], title,
  onNext, onPrev, hasNext, hasPrev,
  intro, outro, onTimeUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hlsLoaded, setHlsLoaded] = useState(false)
  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [showSkipOutro, setShowSkipOutro] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const selected = sources[selectedIdx]
  const isHLS = selected?.isM3U8 || selected?.url?.includes('.m3u8')

  // Load HLS.js dynamically for m3u8 streams
  useEffect(() => {
    if (!isHLS || !videoRef.current || !selected?.url) return

    let hls: unknown = null

    const loadHLS = async () => {
      try {
        const Hls = (await import('hls.js')).default
        if (!Hls.isSupported()) {
          // Try native HLS (Safari)
          if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = selected.url
            setHlsLoaded(true)
          }
          return
        }

        const hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        })

        hlsInstance.loadSource(selected.url)
        hlsInstance.attachMedia(videoRef.current!)
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false)
          setHlsLoaded(true)
          videoRef.current?.play().catch(() => {})
        })
        hlsInstance.on(Hls.Events.ERROR, (_: unknown, data: Record<string, unknown>) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data)
            setIsLoading(false)
          }
        })

        hls = hlsInstance
      } catch (err) {
        console.error('HLS load error:', err)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    setHlsLoaded(false)
    loadHLS()

    return () => {
      if (hls && typeof (hls as Record<string, unknown>).destroy === 'function') {
        (hls as Record<string, () => void>).destroy()
      }
    }
  }, [selected?.url, isHLS])

  // Skip intro/outro detection
  useEffect(() => {
    if (!intro && !outro) return
    setShowSkipIntro(!!intro && currentTime >= intro.start && currentTime <= intro.end)
    setShowSkipOutro(!!outro && currentTime >= outro.start && currentTime <= outro.end)
  }, [currentTime, intro, outro])

  const handleTimeUpdate = () => {
    const t = videoRef.current?.currentTime || 0
    setCurrentTime(t)
    onTimeUpdate?.(t)
  }

  const skipIntro = () => {
    if (videoRef.current && intro) videoRef.current.currentTime = intro.end
  }
  const skipOutro = () => {
    if (videoRef.current && outro) videoRef.current.currentTime = outro.end
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="w-full aspect-video bg-black rounded-xl flex flex-col items-center justify-center gap-3">
        <p className="text-white/60">Video tidak tersedia</p>
        <p className="text-white/40 text-sm">Coba refresh atau pilih server lain</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl overflow-hidden bg-black">
      {/* Video */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-10 h-10 text-accent-primary animate-spin" />
              <p className="text-white/60 text-sm">Memuat video...</p>
            </div>
          </div>
        )}

        {/* HLS / Native Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          controls
          autoPlay
          crossOrigin="anonymous"
          onLoadedData={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          onError={() => setIsLoading(false)}
          {...(!isHLS && { src: selected?.url })}
        >
          {/* Subtitles */}
          {subtitles.map((sub, i) => (
            <track key={i} kind="subtitles" label={sub.label}
              src={sub.url} default={sub.default || sub.label.toLowerCase().includes('indo')} />
          ))}
        </video>

        {/* Skip Intro Button */}
        {showSkipIntro && (
          <button onClick={skipIntro}
            className="absolute bottom-16 right-4 z-30 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm font-medium rounded-lg transition-all animate-fade-in">
            ⏭ Skip Intro
          </button>
        )}

        {/* Skip Outro Button */}
        {showSkipOutro && (
          <button onClick={skipOutro}
            className="absolute bottom-16 right-4 z-30 px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-medium rounded-lg transition-all animate-fade-in">
            ⏭ Skip Outro
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-bg-secondary px-4 py-3 space-y-2">
        {/* Server selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-muted text-xs font-medium uppercase tracking-wide">Kualitas:</span>
          {sources.map((src, i) => (
            <button key={i} onClick={() => { setSelectedIdx(i); setIsLoading(true) }}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                selectedIdx === i ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border'
              )}>
              {src.quality || `Stream ${i + 1}`}
            </button>
          ))}
        </div>

        {/* Episode nav */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {hasPrev && (
              <button onClick={onPrev}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-border rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors border border-border">
                <SkipBack size={13} /> Episode Sebelumnya
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {hasNext && (
              <button onClick={onNext}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary hover:bg-accent-secondary rounded-lg text-xs text-white transition-colors">
                Episode Berikutnya <SkipForward size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
