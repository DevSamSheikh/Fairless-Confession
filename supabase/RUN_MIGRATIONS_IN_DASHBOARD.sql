-- ============================================================
-- ConfessBox: run this entire file in Supabase Dashboard
-- SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- Enums
DO $$ BEGIN CREATE TYPE category AS ENUM ('College', 'Work', 'Love', 'Drama', 'Dark', 'Funny', 'Secrets'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE member_role AS ENUM ('Member', 'Moderator', 'Admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE reaction_type AS ENUM ('Like', 'Funny', 'Supportive', 'Unbelievable', 'Thought', 'Anger'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tables (skip if exist)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  identity_id VARCHAR(50) UNIQUE NOT NULL,
  avatar_seed VARCHAR(100) NOT NULL,
  user_id_custom VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  posts_count INTEGER DEFAULT 0 NOT NULL,
  reactions_count INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  member_count INTEGER DEFAULT 0 NOT NULL,
  is_private BOOLEAN DEFAULT FALSE NOT NULL,
  creator_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  society_id UUID REFERENCES public.societies(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category category NOT NULL,
  reactions_summary JSONB DEFAULT '{}' NOT NULL,
  comment_count INTEGER DEFAULT 0 NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  is_trending BOOLEAN DEFAULT FALSE NOT NULL,
  visibility VARCHAR(20) DEFAULT 'public' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS public.society_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  role member_role DEFAULT 'Member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, society_id)
);

-- Tracking & reports
CREATE TABLE IF NOT EXISTS public.tracking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('register', 'login')),
  ip_address VARCHAR(45),
  mac_address VARCHAR(100),
  mobile_sim_number VARCHAR(50),
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tracking_logs_user_id ON public.tracking_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_logs_created_at ON public.tracking_logs(created_at);

CREATE TABLE IF NOT EXISTS public.post_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_identity_id VARCHAR(50) NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  category VARCHAR(50) NOT NULL,
  society_id UUID REFERENCES public.societies(id),
  heading VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  ip_address VARCHAR(45),
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_post_activity_log_user_id ON public.post_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_post_activity_log_post_id ON public.post_activity_log(post_id);

CREATE TABLE IF NOT EXISTS public.saved_societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, society_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason VARCHAR(100),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_post_id ON public.reports(post_id);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Posts are viewable" ON public.posts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Societies are viewable" ON public.societies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated can create reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated can join societies" ON public.society_members FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role manages tracking_logs" ON public.tracking_logs FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Service role manages post_activity_log" ON public.post_activity_log FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can manage own saved_societies" ON public.saved_societies FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Migration 00003: sign_in_dates (history of sign-ins) + always lowercase email
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sign_in_dates TIMESTAMPTZ[] DEFAULT '{}' NOT NULL;
CREATE OR REPLACE FUNCTION public.lowercase_user_email() RETURNS TRIGGER AS $$
BEGIN
  NEW.email := LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS users_lowercase_email ON public.users;
CREATE TRIGGER users_lowercase_email
  BEFORE INSERT OR UPDATE OF email ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.lowercase_user_email();
