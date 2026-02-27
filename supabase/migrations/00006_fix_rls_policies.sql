-- Fix RLS policies for reactions and comments tables
-- This migration adds missing policies for SELECT, UPDATE, DELETE operations
-- and ensures authenticated users can perform all necessary operations

-- ============================================
-- REACTIONS TABLE POLICIES
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated can create reactions" ON public.reactions;

-- Allow authenticated users to view all reactions
CREATE POLICY "Anyone can view reactions"
ON public.reactions
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own reactions
CREATE POLICY "Authenticated users can insert reactions"
ON public.reactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own reactions
CREATE POLICY "Users can update own reactions"
ON public.reactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own reactions
CREATE POLICY "Users can delete own reactions"
ON public.reactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE POLICIES
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated can create comments" ON public.comments;

-- Allow anyone to view comments
CREATE POLICY "Anyone can view comments"
ON public.comments
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Authenticated users can insert comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own comments
CREATE POLICY "Users can update own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- POSTS TABLE POLICIES (ensure complete coverage)
-- ============================================

-- Allow authenticated users to update their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- SOCIETY_MEMBERS TABLE POLICIES
-- ============================================

-- Allow anyone to view society members
DROP POLICY IF EXISTS "Anyone can view society members" ON public.society_members;
CREATE POLICY "Anyone can view society members"
ON public.society_members
FOR SELECT
USING (true);

-- Allow authenticated users to delete their own memberships
DROP POLICY IF EXISTS "Users can delete own memberships" ON public.society_members;
CREATE POLICY "Users can delete own memberships"
ON public.society_members
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
