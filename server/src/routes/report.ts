import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/report/:postid - Report a post
router.post('/:postid', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postid;
    const { reason, details } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: post } = await supabase.from('posts').select('id').eq('id', postId).single();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        post_id: postId,
        reporter_id: userId,
        reason: reason ?? null,
        details: details ?? null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

export default router;
