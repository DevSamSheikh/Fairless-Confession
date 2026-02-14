import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/societies - List all (public) societies
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('societies').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch societies' });
  }
});

// GET /api/societies/confessions - Feed from all joined societies
router.get('/confessions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: memberships } = await supabase.from('society_members').select('society_id').eq('user_id', userId);
    const societyIds = (memberships ?? []).map((m: { society_id: string }) => m.society_id);
    if (societyIds.length === 0) return res.json([]);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom),
        society:societies(id, name)
      `)
      .in('society_id', societyIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch society confessions' });
  }
});

// GET /api/societies/discover - Discover public societies (browse/search)
router.get('/discover', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    let query = supabase.from('societies').select('*').eq('is_private', false).order('member_count', { ascending: false }).limit(50);
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to discover societies' });
  }
});

// GET /api/societies/joined - User's joined societies
router.get('/joined', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('society_members')
      .select(`
        joined_at,
        society:societies(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    res.json((data ?? []).map((r: { society: unknown }) => r.society));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch joined societies' });
  }
});

// GET /api/societies/you - Societies created by user
router.get('/you', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase.from('societies').select('*').eq('creator_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your societies' });
  }
});

// GET /api/societies/:id - Single society (society/:id)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('societies').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Society not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch society' });
  }
});

// POST /api/societies/join/:id
router.post('/join/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const societyId = req.params.id;

    const { error: insertError } = await supabase.from('society_members').insert({
      user_id: userId,
      society_id: societyId,
      role: 'Member'
    });

    if (insertError) {
      if (insertError.code === '23505') return res.status(400).json({ error: 'Already a member' });
      throw insertError;
    }

    const { data: society } = await supabase.from('societies').select('member_count').eq('id', societyId).single();
    if (society) {
      await supabase.from('societies').update({ member_count: (society.member_count ?? 0) + 1 }).eq('id', societyId);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join society' });
  }
});

// POST /api/societies/leave - body: { societyId }
router.post('/leave', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const societyId = req.body.societyId ?? req.params.id;
    if (!userId || !societyId) return res.status(400).json({ error: 'societyId required' });

    const { error } = await supabase.from('society_members').delete().eq('user_id', userId).eq('society_id', societyId);
    if (error) throw error;

    const { data: society } = await supabase.from('societies').select('member_count').eq('id', societyId).single();
    if (society && society.member_count > 0) {
      await supabase.from('societies').update({ member_count: society.member_count - 1 }).eq('id', societyId);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave society' });
  }
});

export default router;
