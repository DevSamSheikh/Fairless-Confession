-- Fix reactions table unique constraint to allow only one reaction per user per post

-- Step 1: Drop old constraint that allowed multiple reactions per user per post
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_post_id_user_id_reaction_type_key;

-- Step 2: Clean up duplicate reactions (keep only the most recent one per user+post)
DELETE FROM public.reactions r1
USING public.reactions r2
WHERE r1.post_id = r2.post_id 
  AND r1.user_id = r2.user_id
  AND r1.created_at < r2.created_at;

-- Step 3: Drop new constraint if it already exists (for idempotency)
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_post_id_user_id_key;

-- Step 4: Add new constraint: one reaction per user per post (any type)
ALTER TABLE public.reactions ADD CONSTRAINT reactions_post_id_user_id_key UNIQUE(post_id, user_id);
