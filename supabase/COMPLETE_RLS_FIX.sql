-- COMPREHENSIVE RLS FIX - RUN THIS IN SUPABASE SQL EDITOR
-- This will fix all RLS issues by either disabling RLS for service role or adding complete policies

-- ============================================
-- OPTION 1: DISABLE RLS COMPLETELY (Easiest fix)
-- ============================================

-- Disable RLS on all tables (service role bypasses RLS anyway)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_societies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OPTION 2: KEEP RLS BUT ADD COMPLETE POLICIES
-- ============================================

-- If you want to keep RLS enabled, uncomment these policies:

-- USERS TABLE POLICIES
-- DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
-- CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Service role can do anything" ON public.users FOR ALL USING (auth.role() = 'service_role');

-- SOCIETIES TABLE POLICIES  
-- DROP POLICY IF EXISTS "Societies are viewable" ON public.societies;
-- CREATE POLICY "Societies are viewable" ON public.societies FOR SELECT USING (true);
-- CREATE POLICY "Authenticated can create societies" ON public.societies FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
-- CREATE POLICY "Users can update own societies" ON public.societies FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
-- CREATE POLICY "Service role can do anything" ON public.societies FOR ALL USING (auth.role() = 'service_role');

-- Check if RLS is actually disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'societies', 'posts', 'comments', 'reactions', 'society_members', 'tracking_logs', 'post_activity_log', 'saved_societies', 'reports')
ORDER BY tablename;
