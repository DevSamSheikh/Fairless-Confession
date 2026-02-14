-- ConfessBox Supabase schema
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enums
CREATE TYPE category AS ENUM ('College', 'Work', 'Love', 'Drama', 'Dark', 'Funny', 'Secrets');
CREATE TYPE member_role AS ENUM ('Member', 'Moderator', 'Admin');
CREATE TYPE reaction_type AS ENUM ('Like', 'Funny', 'Supportive', 'Unbelievable', 'Thought', 'Anger');

-- Profiles (extends auth.users; id = auth.users.id)
CREATE TABLE public.users (
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

-- Societies
CREATE TABLE public.societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  member_count INTEGER DEFAULT 0 NOT NULL,
  is_private BOOLEAN DEFAULT FALSE NOT NULL,
  creator_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Posts
CREATE TABLE public.posts (
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

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reactions
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id, reaction_type)
);

-- Society members
CREATE TABLE public.society_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  role member_role DEFAULT 'Member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, society_id)
);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_identity_id VARCHAR(50);
  new_avatar_seed VARCHAR(100);
  new_user_id_custom VARCHAR(50);
BEGIN
  new_identity_id := '#Confess_' || (1000 + floor(random() * 9000))::int;
  new_avatar_seed := gen_random_uuid()::text;
  new_user_id_custom := '2004-' || upper(substring(md5(random()::text) from 1 for 5));
  INSERT INTO public.users (id, email, full_name, identity_id, avatar_seed, user_id_custom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName'),
    new_identity_id,
    new_avatar_seed,
    new_user_id_custom
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: trigger to auto-create profile on signup.
-- In Supabase Dashboard: Database -> Extensions ensure pg_catalog is available.
-- Then run in SQL Editor (as postgres):
--   CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- If trigger is not used, the API server creates the profile after signUp.

-- RLS: enable and policies (optional; server uses service_role which bypasses RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_members ENABLE ROW LEVEL SECURITY;

-- Users: read own profile
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- Posts: anyone can read public posts
CREATE POLICY "Posts are viewable" ON public.posts FOR SELECT USING (true);
-- Societies: anyone can read
CREATE POLICY "Societies are viewable" ON public.societies FOR SELECT USING (true);
-- Add more policies as needed for insert/update/delete
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can create reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can join societies" ON public.society_members FOR INSERT WITH CHECK (auth.uid() = user_id);
