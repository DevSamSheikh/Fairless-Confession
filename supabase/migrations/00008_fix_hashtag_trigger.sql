-- Fix hashtag processing trigger
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS process_post_hashtags_trigger ON public.posts;
DROP FUNCTION IF EXISTS process_post_hashtags();

-- Recreate function with proper column references
CREATE OR REPLACE FUNCTION process_post_hashtags()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  hashtag_names TEXT[];
  hashtag_name TEXT;
  hashtag_record RECORD;
BEGIN
  -- Extract hashtags from post content
  hashtag_names := extract_hashtags(NEW.content);
  
  -- Remove existing post-hashtag relationships for this post
  DELETE FROM public.post_hashtags WHERE post_id = NEW.id;
  
  -- Process each hashtag
  FOREACH hashtag_name IN ARRAY hashtag_names
  LOOP
    -- Create hashtag if it doesn't exist
    INSERT INTO public.hashtags (name, created_by)
    VALUES (hashtag_name, NEW.user_id)
    ON CONFLICT (name) DO NOTHING;
    
    -- Get hashtag record
    SELECT * INTO hashtag_record 
    FROM public.hashtags 
    WHERE name = hashtag_name;
    
    -- Create post-hashtag relationship with explicit column references
    INSERT INTO public.post_hashtags (post_id, hashtag_id)
    VALUES (NEW.id, hashtag_record.id)
    ON CONFLICT (post_id, hashtag_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER process_post_hashtags_trigger
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION process_post_hashtags();
