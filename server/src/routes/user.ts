import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/user/stats - Get user statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Get user's confessions count
    const { count: confessionsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user's reactions count
    const { count: reactionsCount } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user's societies count
    const { count: societiesCount } = await supabase
      .from('society_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      confessionsCount: confessionsCount || 0,
      reactionsCount: reactionsCount || 0,
      societiesCount: societiesCount || 0,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;
