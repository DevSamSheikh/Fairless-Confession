import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_REACTIONS = new Set([
  'Like',
  'Funny',
  'Supportive',
  'Unbelievable',
  'Thought',
  'Anger',
]);

function generateIdentityId() {
  return `#Confess_${Math.floor(1000 + Math.random() * 9000)}`;
}

function getSingleParam(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
}

function isCommentVotesTableMissingError(error: any): boolean {
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';
  const details = typeof error?.details === 'string' ? error.details.toLowerCase() : '';

  if (code === '42P01') return true;
  if (code === 'PGRST205' && (message.includes('comment_votes') || details.includes('comment_votes'))) {
    return true;
  }
  return message.includes('comment_votes') && message.includes('does not exist');
}

function generateAvatarSeed() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function generateUserIdCustom() {
  return `2004-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

async function ensureUserProfileExists(userId: string) {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (profileLookupError) throw profileLookupError;

  if (!existingProfile) {
    try {
      // Try to get user info from auth, but don't fail if admin API is not available
      let email = `${userId}@local.confessbox`;
      let fullName = null;

      try {
        const { data: authUserResp, error: authUserError } = await supabase.auth.admin.getUserById(userId);
        if (!authUserError && authUserResp?.user) {
          const authUser = authUserResp.user;
          email = authUser.email ?? email;
          fullName =
            (authUser.user_metadata?.full_name as string | undefined) ??
            (authUser.user_metadata?.fullName as string | undefined) ??
            null;
        }
      } catch (adminError) {
        // Admin API not available, use defaults
        console.warn('Auth admin API not available, using default values for user profile');
      }

      const { error: insertProfileError } = await supabase.from('users').insert({
        id: userId,
        email,
        full_name: fullName,
        identity_id: generateIdentityId(),
        avatar_seed: generateAvatarSeed(),
        user_id_custom: generateUserIdCustom(),
      });

      if (insertProfileError) {
        // If insert fails due to duplicate, that's okay (race condition)
        if (insertProfileError.code !== '23505') {
          throw insertProfileError;
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
      // Don't throw - allow the reaction to proceed even if profile creation fails
      // The user likely already exists or will be created by another process
    }
  }
}

type VoteDirection = 'up' | 'down';

function mapCommentRow(
  row: any,
  votesByCommentId: Record<string, { upvotes: number; downvotes: number }>,
  myVoteByCommentId: Record<string, number>,
) {
  const voteStats = votesByCommentId[row.id] ?? { upvotes: 0, downvotes: 0 };
  const score = voteStats.upvotes - voteStats.downvotes;

  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    upvotes: voteStats.upvotes,
    downvotes: voteStats.downvotes,
    score,
    myVote: myVoteByCommentId[row.id] ?? 0,
    user: row.user ?? null,
  };
}

async function loadCommentsWithVotes(postId: string, currentUserId: string | undefined) {
  const { data: commentRows, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      post_id,
      user_id,
      content,
      created_at,
      user:users(identity_id, avatar_seed, user_id_custom)
    `)
    .eq('post_id', postId);

  if (commentsError) throw commentsError;

  const comments = commentRows ?? [];
  const commentIds = comments.map((c: any) => c.id);
  if (commentIds.length === 0) return [];

  const { data: voteRows, error: votesError } = await supabase
    .from('comment_votes')
    .select('comment_id, user_id, vote_value')
    .in('comment_id', commentIds);

  const votesTableMissing = isCommentVotesTableMissingError(votesError);
  if (votesError && !votesTableMissing) throw votesError;

  const votesByCommentId: Record<string, { upvotes: number; downvotes: number }> = {};
  const myVoteByCommentId: Record<string, number> = {};

  for (const vote of votesTableMissing ? [] : voteRows ?? []) {
    const commentId = (vote as any).comment_id as string;
    const voteValue = Number((vote as any).vote_value ?? 0);

    if (!votesByCommentId[commentId]) {
      votesByCommentId[commentId] = { upvotes: 0, downvotes: 0 };
    }

    if (voteValue > 0) votesByCommentId[commentId].upvotes += 1;
    if (voteValue < 0) votesByCommentId[commentId].downvotes += 1;

    if (currentUserId && (vote as any).user_id === currentUserId) {
      myVoteByCommentId[commentId] = voteValue;
    }
  }

  return comments
    .map((row: any) => mapCommentRow(row, votesByCommentId, myVoteByCommentId))
    .sort((a, b) => {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

// POST /api/interactions/react
router.post('/react', authMiddleware, async (req: AuthRequest, res) => {
  let step = 'init';
  try {
    step = 'parse_body';
    const { postId, reactionType } = req.body as { postId?: string; reactionType?: string };
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({ error: 'postId is required' });
    }
    if (!reactionType || typeof reactionType !== 'string') {
      return res.status(400).json({ error: 'reactionType is required' });
    }
    if (!UUID_REGEX.test(postId)) {
      return res.status(400).json({ error: 'Invalid postId format' });
    }
    if (!ALLOWED_REACTIONS.has(reactionType)) {
      return res.status(400).json({ error: 'Invalid reactionType' });
    }

    step = 'post_lookup';
    const { data: postExists, error: postLookupError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .maybeSingle();

    if (postLookupError) throw postLookupError;
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Some older accounts may exist in auth.users but not public.users yet.
    // Ensure a profile row exists to satisfy reactions.user_id FK.
    step = 'ensure_user_profile';
    await ensureUserProfileExists(req.userId);

    // Check if user already has this exact reaction (toggle off)
    step = 'check_existing_reaction';
    const { data: existingReaction, error: existingError } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('user_id', req.userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (existingError) throw existingError;

    let currentReactionType: string | null = reactionType;

    if (existingReaction && existingReaction.reaction_type === reactionType) {
      // Toggle off: delete the reaction
      step = 'toggle_off_delete';
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('user_id', req.userId)
        .eq('post_id', postId);
      if (deleteError) throw deleteError;
      currentReactionType = null;
    } else {
      // Set/switch reaction: upsert will replace existing or create new
      step = 'upsert_reaction';
      const { error: upsertError } = await supabase.from('reactions').upsert(
        {
          user_id: req.userId,
          post_id: postId,
          reaction_type: reactionType,
        },
        {
          onConflict: 'post_id,user_id',
          ignoreDuplicates: false,
        },
      );

      if (upsertError) throw upsertError;
      currentReactionType = reactionType;
    }

    // Recompute summary from reactions table (authoritative)
    step = 'recompute_summary';
    const { data: allReactions, error: allError } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('post_id', postId);

    if (allError) throw allError;

    const summary: Record<string, number> = {};
    for (const r of allReactions ?? []) {
      const type = (r as any).reaction_type as string | undefined;
      if (!type) continue;
      summary[type] = (summary[type] ?? 0) + 1;
    }

    step = 'update_post_summary';
    const { error: postUpdateError } = await supabase
      .from('posts')
      .update({ reactions_summary: summary })
      .eq('id', postId);

    if (postUpdateError) {
      // Keep reaction endpoint functional even when older DB schemas
      // are missing reactions_summary or have temporary write issues.
      console.error('Failed to update posts.reactions_summary:', postUpdateError);
    }

    res.json({
      success: true,
      currentReactionType,
      summary,
    });
  } catch (error: any) {
    console.error('POST /api/interactions/react failed:', { step, error });

    const errorCode = typeof error?.code === 'string' ? error.code : '';
    if (errorCode === '22P02') {
      return res.status(400).json({ error: 'Invalid postId format' });
    }
    if (errorCode === '23503') {
      return res.status(400).json({ error: 'Invalid postId or user reference' });
    }

    res.status(500).json({
      error:
        (typeof error?.message === 'string' && error.message) ||
        (typeof error?.error_description === 'string' && error.error_description) ||
        'Failed to react',
      step,
      code: typeof error?.code === 'string' ? error.code : undefined,
    });
  }
});

// POST /api/interactions/comment
router.post('/comment', authMiddleware, async (req: AuthRequest, res) => {
  let step = 'init';
  try {
    step = 'parse_body';
    const { postId, content } = req.body as { postId?: string; content?: string };
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!postId || typeof postId !== 'string' || !UUID_REGEX.test(postId)) {
      return res.status(400).json({ error: 'Invalid postId format' });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    step = 'ensure_user_profile';
    await ensureUserProfileExists(req.userId);

    step = 'post_lookup';
    const { data: postExists, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .maybeSingle();

    if (postError) throw postError;
    if (!postExists) return res.status(404).json({ error: 'Post not found' });

    step = 'insert_comment';
    const { data: newComment, error: commentError } = await supabase
      .from('comments')
      .insert({ user_id: req.userId, post_id: postId, content: content.trim() })
      .select()
      .single();

    if (commentError) throw commentError;

    step = 'increment_comment_count';
    const { data: post } = await supabase.from('posts').select('comment_count').eq('id', postId).single();
    if (post) {
      await supabase.from('posts').update({ comment_count: (post.comment_count ?? 0) + 1 }).eq('id', postId);
    }

    step = 'load_comments_with_votes';
    let comments: any[] = [];
    let created: any = null;

    try {
      comments = await loadCommentsWithVotes(postId, req.userId);
      created = comments.find((c) => c.id === newComment.id) ?? null;
    } catch (enrichmentError: any) {
      console.error('POST /api/interactions/comment enrichment failed:', enrichmentError);
      created = {
        id: newComment.id,
        postId,
        userId: req.userId,
        content: newComment.content,
        createdAt: newComment.created_at,
        updatedAt: (newComment as any).updated_at ?? newComment.created_at,
        upvotes: 0,
        downvotes: 0,
        score: 0,
        myVote: 0,
        user: null,
      };
      comments = [created];
    }

    res.status(201).json({
      success: true,
      comment: created,
      comments,
    });
  } catch (error: any) {
    console.error('POST /api/interactions/comment failed:', { step, error });
    res.status(500).json({
      error: (typeof error?.message === 'string' && error.message) || 'Failed to comment',
      step,
      code: typeof error?.code === 'string' ? error.code : undefined,
    });
  }
});

// GET /api/interactions/comments/:postId
router.get('/comments/:postId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const postId = getSingleParam(req.params.postId);
    if (!postId || !UUID_REGEX.test(postId)) {
      return res.status(400).json({ error: 'Invalid postId format' });
    }

    const { data: postExists, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .maybeSingle();

    if (postError) throw postError;
    if (!postExists) return res.status(404).json({ error: 'Post not found' });

    const comments = await loadCommentsWithVotes(postId, req.userId);
    return res.json({ comments });
  } catch (error: any) {
    return res.status(500).json({
      error:
        (typeof error?.message === 'string' && error.message) ||
        'Failed to fetch comments',
    });
  }
});

// PATCH /api/interactions/comment/:commentId
router.patch('/comment/:commentId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const commentId = getSingleParam(req.params.commentId);
    const { content } = req.body as { content?: string };

    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!commentId || !UUID_REGEX.test(commentId)) {
      return res.status(400).json({ error: 'Invalid commentId format' });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const { data: existingComment, error: commentLookupError } = await supabase
      .from('comments')
      .select('id, post_id, user_id')
      .eq('id', commentId)
      .maybeSingle();

    if (commentLookupError) throw commentLookupError;
    if (!existingComment) return res.status(404).json({ error: 'Comment not found' });
    if (existingComment.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can edit only your own comments' });
    }

    const { error: updateError } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .eq('user_id', req.userId);

    if (updateError) throw updateError;

    const comments = await loadCommentsWithVotes(existingComment.post_id, req.userId);
    const updated = comments.find((c) => c.id === commentId) ?? null;

    return res.json({ success: true, comment: updated, comments });
  } catch (error: any) {
    return res.status(500).json({
      error:
        (typeof error?.message === 'string' && error.message) ||
        'Failed to edit comment',
    });
  }
});

// DELETE /api/interactions/comment/:commentId
router.delete('/comment/:commentId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const commentId = getSingleParam(req.params.commentId);
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!commentId || !UUID_REGEX.test(commentId)) {
      return res.status(400).json({ error: 'Invalid commentId format' });
    }

    const { data: existingComment, error: commentLookupError } = await supabase
      .from('comments')
      .select('id, post_id, user_id')
      .eq('id', commentId)
      .maybeSingle();

    if (commentLookupError) throw commentLookupError;
    if (!existingComment) return res.status(404).json({ error: 'Comment not found' });
    if (existingComment.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can delete only your own comments' });
    }

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', req.userId);

    if (deleteError) throw deleteError;

    const { data: post } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', existingComment.post_id)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comment_count: Math.max(0, (post.comment_count ?? 0) - 1) })
        .eq('id', existingComment.post_id);
    }

    const comments = await loadCommentsWithVotes(existingComment.post_id, req.userId);
    return res.json({ success: true, comments });
  } catch (error: any) {
    return res.status(500).json({
      error:
        (typeof error?.message === 'string' && error.message) ||
        'Failed to delete comment',
    });
  }
});

// POST /api/interactions/comment/:commentId/vote
router.post('/comment/:commentId/vote', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const commentId = getSingleParam(req.params.commentId);
    const { direction } = req.body as { direction?: VoteDirection };

    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!commentId || !UUID_REGEX.test(commentId)) {
      return res.status(400).json({ error: 'Invalid commentId format' });
    }
    if (direction !== 'up' && direction !== 'down') {
      return res.status(400).json({ error: 'direction must be up or down' });
    }

    const { data: existingComment, error: commentLookupError } = await supabase
      .from('comments')
      .select('id, post_id')
      .eq('id', commentId)
      .maybeSingle();

    if (commentLookupError) throw commentLookupError;
    if (!existingComment) return res.status(404).json({ error: 'Comment not found' });

    const requestedVoteValue = direction === 'up' ? 1 : -1;

    const { data: existingVote, error: voteLookupError } = await supabase
      .from('comment_votes')
      .select('id, vote_value')
      .eq('comment_id', commentId)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (voteLookupError) throw voteLookupError;

    if (!existingVote) {
      const { error: insertVoteError } = await supabase.from('comment_votes').insert({
        comment_id: commentId,
        user_id: req.userId,
        vote_value: requestedVoteValue,
      });
      if (insertVoteError) throw insertVoteError;
    } else if ((existingVote as any).vote_value === requestedVoteValue) {
      // Toggle same vote off
      const { error: deleteVoteError } = await supabase
        .from('comment_votes')
        .delete()
        .eq('id', (existingVote as any).id);
      if (deleteVoteError) throw deleteVoteError;
    } else {
      const { error: updateVoteError } = await supabase
        .from('comment_votes')
        .update({ vote_value: requestedVoteValue })
        .eq('id', (existingVote as any).id);
      if (updateVoteError) throw updateVoteError;
    }

    const comments = await loadCommentsWithVotes(existingComment.post_id, req.userId);
    const updated = comments.find((c) => c.id === commentId) ?? null;

    return res.json({ success: true, comment: updated, comments });
  } catch (error: any) {
    return res.status(500).json({
      error:
        (typeof error?.message === 'string' && error.message) ||
        'Failed to vote on comment',
    });
  }
});

// GET /api/interactions/post/:postId - Redirect target: post + comments + reactions summary
router.get('/post/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom)
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) return res.status(404).json({ error: 'Post not found' });

    const { data: comments } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    res.json({ post, comments: comments ?? [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

export default router;
