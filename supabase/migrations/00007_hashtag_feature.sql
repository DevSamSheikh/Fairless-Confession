-- Hashtag feature migration
-- Creates hashtags table and post_hashtags junction table

-- Hashtags table
CREATE TABLE public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Post-hashtags junction table
CREATE TABLE public.post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, hashtag_id)
);

-- Indexes for performance
CREATE INDEX idx_hashtags_name ON public.hashtags(name);
CREATE INDEX idx_hashtags_post_count ON public.hashtags(post_count DESC);
CREATE INDEX idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag_id ON public.post_hashtags(hashtag_id);

-- RLS (Row Level Security) policies

-- Hashtags table policies
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

-- Anyone can read hashtags
CREATE POLICY "Hashtags are viewable by everyone" ON public.hashtags
  FOR SELECT USING (true);

-- Anyone can create hashtags (will be used in backend logic)
CREATE POLICY "Anyone can create hashtags" ON public.hashtags
  FOR INSERT WITH CHECK (true);

-- Only system can update hashtags (post_count updates)
CREATE POLICY "Only system can update hashtags" ON public.hashtags
  FOR UPDATE USING (false);

-- Anyone can delete hashtags (optional - could restrict to creators)
CREATE POLICY "Anyone can delete hashtags" ON public.hashtags
  FOR DELETE USING (true);

-- Post-hashtags table policies
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- Anyone can read post-hashtags relationships
CREATE POLICY "Post-hashtags are viewable by everyone" ON public.post_hashtags
  FOR SELECT USING (true);

-- Anyone can create post-hashtags relationships
CREATE POLICY "Anyone can create post-hashtags" ON public.post_hashtags
  FOR INSERT WITH CHECK (true);

-- Anyone can delete post-hashtags relationships
CREATE POLICY "Anyone can delete post-hashtags" ON public.post_hashtags
  FOR DELETE USING (true);

-- Function to extract hashtags from text
CREATE OR REPLACE FUNCTION extract_hashtags(text_content TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  hashtag_array TEXT[] := '{}';
  hashtag_match TEXT;
BEGIN
  -- Extract hashtags using regex: # followed by word characters
  FOR hashtag_match IN 
    SELECT regexp_matches[1] 
    FROM regexp_matches(text_content, '#([a-zA-Z0-9_]+)', 'g') AS regexp_matches
  LOOP
    -- Add unique hashtags to array
    IF NOT (hashtag_match = ANY(hashtag_array)) THEN
      hashtag_array := array_append(hashtag_array, hashtag_match);
    END IF;
  END LOOP;
  
  RETURN hashtag_array;
END;
$$;

-- Function to update hashtag post counts
CREATE OR REPLACE FUNCTION update_hashtag_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment post count when hashtag is added to a post
    UPDATE public.hashtags 
    SET post_count = post_count + 1 
    WHERE id = NEW.hashtag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement post count when hashtag is removed from a post
    UPDATE public.hashtags 
    SET post_count = GREATEST(post_count - 1, 0) 
    WHERE id = OLD.hashtag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to automatically update hashtag post counts
CREATE TRIGGER update_hashtag_post_count_trigger
  AFTER INSERT OR DELETE ON public.post_hashtags
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_post_count();

-- Function to process hashtags for a post
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
    
    -- Create post-hashtag relationship
    INSERT INTO public.post_hashtags (post_id, hashtag_id)
    VALUES (NEW.id, hashtag_record.id)
    ON CONFLICT (post_id, hashtag_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically process hashtags when post is created or updated
CREATE TRIGGER process_post_hashtags_trigger
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION process_post_hashtags();
