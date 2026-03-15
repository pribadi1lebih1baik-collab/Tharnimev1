import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ongoing: 'text-green-400 bg-green-400/10',
    completed: 'text-blue-400 bg-blue-400/10',
    dropped: 'text-red-400 bg-red-400/10',
    watching: 'text-accent-primary bg-accent-primary/10',
    plan_to_watch: 'text-yellow-400 bg-yellow-400/10',
    reading: 'text-green-400 bg-green-400/10',
  }
  return map[status.toLowerCase()] || 'text-text-secondary bg-bg-tertiary'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ongoing: 'Ongoing',
    completed: 'Completed',
    watching: 'Watching',
    plan_to_watch: 'Plan to Watch',
    on_hold: 'On Hold',
    dropped: 'Dropped',
    reading: 'Reading',
    plan_to_read: 'Plan to Read',
  }
  return map[status] || status
}

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return q ? `?${q}` : ''
}
