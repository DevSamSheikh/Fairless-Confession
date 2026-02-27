-- CORRECTED RLS POLICIES FIX
-- Run this in Supabase SQL Editor to fix edit/delete/reactions/comments
-- This version properly drops all existing policies first

-- ============================================
-- REACTIONS TABLE POLICIES
-- ============================================

-- Drop ALL existing reaction policies
DROP POLICY IF EXISTS "Authenticated can create reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;
DROP POLICY IF EXISTS "Authenticated users can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can update own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;

-- Create new policies
CREATE POLICY "Anyone can view reactions"
ON public.reactions
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert reactions"
ON public.reactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reactions"
ON public.reactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
ON public.reactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE POLICIES
-- ============================================

-- Drop ALL existing comment policies
DROP POLICY IF EXISTS "Authenticated can create comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- Create new policies
CREATE POLICY "Anyone can view comments"
ON public.comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- POSTS TABLE POLICIES (FIX EDIT/DELETE)
-- ============================================

-- Drop ALL existing post policies
DROP POLICY IF EXISTS "Authenticated can create posts" ON public.posts;
DROP POLICY IF EXISTS "Posts are viewable" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- Recreate all necessary policies
CREATE POLICY "Posts are viewable"
ON public.posts
FOR SELECT
USING (true);

CREATE POLICY "Authenticated can create posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- SOCIETY_MEMBERS TABLE POLICIES
-- ============================================

-- Drop ALL existing society member policies
DROP POLICY IF EXISTS "Authenticated can join societies" ON public.society_members;
DROP POLICY IF EXISTS "Anyone can view society members" ON public.society_members;
DROP POLICY IF EXISTS "Users can delete own memberships" ON public.society_members;

-- Create new policies
CREATE POLICY "Anyone can view society members"
ON public.society_members
FOR SELECT
USING (true);

CREATE POLICY "Authenticated can join societies"
ON public.society_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memberships"
ON public.society_members
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
