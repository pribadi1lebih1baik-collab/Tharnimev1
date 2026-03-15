// ==================== ANIME ====================
export interface Anime {
  slug: string
  title: string
  title_english?: string
  poster: string
  synopsis?: string
  status: 'ongoing' | 'completed' | string
  type?: string
  genres?: string[]
  rating?: number
  episodes_count?: number
  season?: string
  year?: number
  studios?: string[]
  source?: string
}

export interface AnimeEpisode {
  slug: string
  title: string
  episode_number: number
  aired?: string
  streams?: StreamSource[]
}

export interface StreamSource {
  quality: string
  url: string
  provider?: string
}

// ==================== DONGHUA ====================
export interface Donghua {
  slug: string
  title: string
  poster: string
  synopsis?: string
  status: string
  genres?: string[]
  rating?: number
  episodes_count?: number
}

export interface DonghuaEpisode {
  slug: string
  title: string
  episode_number: number
  streams?: StreamSource[]
}

// ==================== MANGA ====================
export interface Manga {
  id: string
  title: string
  cover: string
  synopsis?: string
  status: string
  type: 'manga' | 'manhwa' | 'manhua' | 'webtoon' | 'comic'
  genres?: string[]
  rating?: number
  author?: string
  artist?: string
  chapters_count?: number
  source: 'mangadex' | 'local'
  year?: number
  demographic?: string
}

export interface MangaChapter {
  id: string
  chapter_number: number
  title?: string
  volume?: number
  published?: string
  pages?: string[]
}

// ==================== USER ====================
export interface UserProfile {
  id: string
  email: string
  username: string
  avatar_url?: string
  bio?: string
  created_at: string
}

export type WatchStatus = 'watching' | 'plan_to_watch' | 'completed' | 'dropped' | 'on_hold'
export type ReadStatus = 'reading' | 'plan_to_read' | 'completed' | 'dropped' | 'on_hold'

export interface WatchlistItem {
  id: string
  user_id: string
  content_id: string
  content_type: 'anime' | 'donghua'
  title: string
  poster: string
  status: WatchStatus
  rating?: number
  progress?: number
  total_episodes?: number
  updated_at: string
}

export interface ReadingListItem {
  id: string
  user_id: string
  content_id: string
  source: 'mangadex' | 'local'
  title: string
  cover: string
  status: ReadStatus
  rating?: number
  last_chapter?: number
  total_chapters?: number
  updated_at: string
}

export interface WatchHistory {
  id: string
  user_id: string
  content_id: string
  content_type: 'anime' | 'donghua'
  episode_id: string
  episode_number: number
  title: string
  poster: string
  progress_seconds: number
  duration_seconds: number
  completed: boolean
  watched_at: string
}

export interface ReadHistory {
  id: string
  user_id: string
  manga_id: string
  source: 'mangadex' | 'local'
  chapter_id: string
  chapter_number: number
  title: string
  cover: string
  page_number: number
  read_at: string
}

export interface Review {
  id: string
  user_id: string
  username?: string
  avatar_url?: string
  content_id: string
  content_type: 'anime' | 'manga' | 'donghua' | 'comic'
  score: number
  body: string
  created_at: string
}

// ==================== API RESPONSE ====================
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
}

export interface ApiError {
  message: string
  code?: string
}
