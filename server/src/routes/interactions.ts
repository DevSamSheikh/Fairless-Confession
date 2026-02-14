import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/interactions/react
router.post('/react', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId, reactionType } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { error: insertError } = await supabase.from('reactions').insert({
      user_id: req.userId,
      post_id: postId,
      reaction_type: reactionType
    });

    if (insertError) {
      if (insertError.code === '23505') return res.status(400).json({ error: 'Already reacted' });
      throw insertError;
    }

    const { data: post } = await supabase.from('posts').select('reactions_summary').eq('id', postId).single();
    const summary = (post?.reactions_summary as Record<string, number>) ?? {};
    summary[reactionType] = (summary[reactionType] ?? 0) + 1;
    await supabase.from('posts').update({ reactions_summary: summary }).eq('id', postId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to react' });
  }
});

// POST /api/interactions/comment
router.post('/comment', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId, content } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: newComment, error: commentError } = await supabase
      .from('comments')
      .insert({ user_id: req.userId, post_id: postId, content })
      .select()
      .single();

    if (commentError) throw commentError;

    const { data: post } = await supabase.from('posts').select('comment_count').eq('id', postId).single();
    if (post) {
      await supabase.from('posts').update({ comment_count: (post.comment_count ?? 0) + 1 }).eq('id', postId);
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to comment' });
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
