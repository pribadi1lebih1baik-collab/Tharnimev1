-- ============================================================
-- AnimaVerse Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WATCHLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('anime', 'donghua')) NOT NULL,
  title TEXT NOT NULL,
  poster TEXT,
  status TEXT CHECK (status IN ('watching', 'plan_to_watch', 'completed', 'dropped', 'on_hold')) DEFAULT 'plan_to_watch',
  rating INTEGER CHECK (rating BETWEEN 1 AND 10),
  progress INTEGER DEFAULT 0,
  total_episodes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- ============================================================
-- READING LIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reading_list (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  source TEXT CHECK (source IN ('mangadex', 'local')) DEFAULT 'mangadex',
  title TEXT NOT NULL,
  cover TEXT,
  status TEXT CHECK (status IN ('reading', 'plan_to_read', 'completed', 'dropped', 'on_hold')) DEFAULT 'plan_to_read',
  rating INTEGER CHECK (rating BETWEEN 1 AND 10),
  last_chapter DECIMAL,
  total_chapters INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, source)
);

-- ============================================================
-- WATCH HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('anime', 'donghua')) NOT NULL,
  episode_id TEXT NOT NULL,
  episode_number INTEGER,
  title TEXT NOT NULL,
  poster TEXT,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- ============================================================
-- READ HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.read_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  manga_id TEXT NOT NULL,
  source TEXT DEFAULT 'mangadex',
  chapter_id TEXT NOT NULL,
  chapter_number DECIMAL,
  title TEXT NOT NULL,
  cover TEXT,
  page_number INTEGER DEFAULT 1,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('anime', 'donghua', 'manga', 'comic')) NOT NULL,
  score INTEGER CHECK (score BETWEEN 1 AND 10) NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.read_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Watchlist: own only
CREATE POLICY "Users manage own watchlist" ON public.watchlist USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reading list: own only
CREATE POLICY "Users manage own reading list" ON public.reading_list USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reading list" ON public.reading_list FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Watch history: own only
CREATE POLICY "Users manage own watch history" ON public.watch_history USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watch history" ON public.watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Read history: own only
CREATE POLICY "Users manage own read history" ON public.read_history USING (auth.uid() = user_id);
CREATE POLICY "Users insert own read history" ON public.read_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews: public read, own write
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users manage own reviews" ON public.reviews USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_user_id ON public.reading_list(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_read_history_user_id ON public.read_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_content ON public.reviews(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON public.watch_history(watched_at DESC);
