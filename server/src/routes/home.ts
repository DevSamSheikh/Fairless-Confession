import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/home - Public confession feed
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Number(req.query.offset) || 0;
    const userId = req.userId;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    const postsWithOwnership = (data ?? []).map((post: any) => ({
      ...post,
      isOwner: userId ? post.user_id === userId : false,
    }));
    
    res.json(postsWithOwnership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// GET /api/home/trending - Trending confessions (by engagement + time)
router.get('/trending', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const period = (req.query.period as string) || 'week'; // 24h, week, month
    const userId = req.userId;

    // Calculate time filter based on period
    const now = new Date();
    let timeFilterDate: Date;
    if (period === '24h') {
      timeFilterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'week') {
      timeFilterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      timeFilterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // month default
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom)
      `)
      .eq('visibility', 'public')
      .gte('created_at', timeFilterDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const withScore = (posts ?? []).map((p: any) => {
      const likes = typeof p.reactions_summary === 'object' && p.reactions_summary
        ? Object.values(p.reactions_summary).reduce((a: number, b) => a + Number(b), 0)
        : 0;
      const engagement = (p.view_count ?? 0) + (p.comment_count ?? 0) * 2 + Number(likes) * 3;
      return { 
        ...p, 
        _score: engagement,
        isOwner: userId ? p.user_id === userId : false,
      };
    });
    
    // Filter out posts with zero interactions and sort by engagement
    const withInteractions = withScore.filter(post => post._score > 0);
    withInteractions.sort((a: { _score: number }, b: { _score: number }) => b._score - a._score);

    res.json(withInteractions.slice(0, limit));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

export default router;
