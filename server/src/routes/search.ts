import { Router } from 'express';
import { supabase } from '../db/client.js';

const router = Router();

// GET /api/search?q=... - Search posts and societies
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim() || '';
    const type = (req.query.type as string) || 'all'; // all | posts | societies
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const results: { posts?: unknown[]; societies?: unknown[] } = {};

    if (type === 'all' || type === 'posts') {
      if (q) {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            *,
            user:users(identity_id, avatar_seed, user_id_custom)
          `)
          .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
          .order('created_at', { ascending: false })
          .limit(limit);
        results.posts = posts ?? [];
      } else {
        results.posts = [];
      }
    }

    if (type === 'all' || type === 'societies') {
      if (q) {
        const { data: societies } = await supabase
          .from('societies')
          .select('*')
          .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(limit);
        results.societies = societies ?? [];
      } else {
        const { data: societies } = await supabase.from('societies').select('*').order('member_count', { ascending: false }).limit(limit);
        results.societies = societies ?? [];
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
