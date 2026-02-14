import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/saved-societies - List user's saved/bookmarked societies
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('saved_societies')
      .select(`
        saved_at,
        society:societies(*)
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    res.json((data ?? []).map((r: { society: unknown }) => r.society));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved societies' });
  }
});

// POST /api/saved-societies - Add society to saved (body: { societyId })
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { societyId } = req.body;
    if (!userId || !societyId) return res.status(400).json({ error: 'societyId required' });

    const { error } = await supabase.from('saved_societies').insert({ user_id: userId, society_id: societyId });
    if (error && error.code === '23505') return res.status(400).json({ error: 'Already saved' });
    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save society' });
  }
});

// DELETE /api/saved-societies/:id - Remove from saved
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { error } = await supabase.from('saved_societies').delete().eq('user_id', userId).eq('society_id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove saved society' });
  }
});

export default router;
