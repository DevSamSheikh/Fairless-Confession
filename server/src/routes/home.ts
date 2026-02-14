import { Router } from 'express';
import { supabase } from '../db/client.js';

const router = Router();

// GET /api/home - Public confession feed
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Number(req.query.offset) || 0;

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
    res.json(data ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// GET /api/home/trending - Trending confessions (by engagement + time)
router.get('/trending', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const period = (req.query.period as string) || 'week'; // 24h, week, month

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom)
      `)
      .eq('visibility', 'public')
      .eq('is_trending', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const withScore = (posts ?? []).map((p: { view_count?: number; comment_count?: number; created_at?: string; reactions_summary?: Record<string, number> }) => {
      const likes = typeof p.reactions_summary === 'object' && p.reactions_summary
        ? Object.values(p.reactions_summary).reduce((a, b) => a + Number(b), 0)
        : 0;
      const engagement = (p.view_count ?? 0) + (p.comment_count ?? 0) * 2 + likes * 3;
      return { ...p, _score: engagement };
    });
    withScore.sort((a: { _score: number }, b: { _score: number }) => b._score - a._score);

    res.json(withScore.slice(0, limit));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

export default router;
