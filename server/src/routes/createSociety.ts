import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/create-society
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { name, description, isPrivate, iconName } = req.body;
    if (!userId || !name) return res.status(400).json({ error: 'Name required' });

    const { data, error } = await supabase
      .from('societies')
      .insert({
        name: name.trim(),
        description: description ?? null,
        is_private: isPrivate === true,
        icon_name: iconName ?? null,
        creator_id: userId,
        member_count: 1
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Society name already exists' });
      throw error;
    }

    await supabase.from('society_members').insert({
      user_id: userId,
      society_id: data.id,
      role: 'Moderator'
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create society' });
  }
});

export default router;
