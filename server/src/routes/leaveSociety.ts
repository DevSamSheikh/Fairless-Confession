import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/leave-society - body: { societyId }
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const societyId = req.body.societyId ?? req.query.societyId;
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
