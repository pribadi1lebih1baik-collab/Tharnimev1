import { create } from 'zustand'

interface PlayerState {
  isPlaying: boolean
  volume: number
  muted: boolean
  quality: string
  progress: number
  duration: number
  setPlaying: (v: boolean) => void
  setVolume: (v: number) => void
  setMuted: (v: boolean) => void
  setQuality: (q: string) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  volume: 1,
  muted: false,
  quality: 'HD',
  progress: 0,
  duration: 0,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
  setQuality: (quality) => set({ quality }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
}))
