-- Comment voting + editable comment timestamps

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_value SMALLINT NOT NULL CHECK (vote_value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_id ON public.comment_votes(user_id);

ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can vote comments"
ON public.comment_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comment votes"
ON public.comment_votes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment votes"
ON public.comment_votes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Comment votes are viewable"
ON public.comment_votes
FOR SELECT
USING (true);
