import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/hashtags/popular - Get popular hashtags
router.get('/popular', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 10;
    if (limit > 50) return res.status(400).json({ error: 'Limit cannot exceed 50' });

    const { data: hashtags, error } = await supabase
      .from('hashtags')
      .select('*')
      .order('post_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GET /api/hashtags/popular] Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch popular hashtags' });
    }

    res.json({ hashtags });
  } catch (error) {
    console.error('[GET /api/hashtags/popular] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/hashtags/search - Search hashtags
router.get('/search', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    if (limit > 50) return res.status(400).json({ error: 'Limit cannot exceed 50' });

    const { data: hashtags, error } = await supabase
      .from('hashtags')
      .select('*')
      .ilike('name', `%${query.trim()}%`)
      .order('post_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GET /api/hashtags/search] Database error:', error);
      return res.status(500).json({ error: 'Failed to search hashtags' });
    }

    res.json({ hashtags });
  } catch (error) {
    console.error('[GET /api/hashtags/search] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/hashtags - Create a new hashtag
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, created_by } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Hashtag name is required' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Hashtag name cannot exceed 100 characters' });
    }

    // Clean hashtag name (remove # if present, convert to lowercase)
    const cleanName = name.trim().replace(/^#/, '').toLowerCase();

    if (!/^[a-z0-9_]+$/.test(cleanName)) {
      return res.status(400).json({ error: 'Hashtag name can only contain letters, numbers, and underscores' });
    }

    const { data: hashtag, error } = await supabase
      .from('hashtags')
      .upsert({
        name: cleanName,
        created_by: created_by || req.userId,
        post_count: 0,
      }, {
        onConflict: 'name',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/hashtags] Database error:', error);
      return res.status(500).json({ error: 'Failed to create hashtag' });
    }

    res.json({ hashtag });
  } catch (error) {
    console.error('[POST /api/hashtags] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/:postId/hashtags - Get hashtags for a specific post
router.get('/posts/:postId/hashtags', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { postId } = req.params;
    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({ error: 'Valid post ID is required' });
    }

    const { data: postHashtags, error: postHashtagsError } = await supabase
      .from('post_hashtags')
      .select('hashtag_id')
      .eq('post_id', postId);

    if (postHashtagsError) {
      console.error('[GET /api/posts/:postId/hashtags] Database error:', postHashtagsError);
      return res.status(500).json({ error: 'Failed to fetch post hashtags' });
    }

    if (!postHashtags || postHashtags.length === 0) {
      return res.json({ hashtags: [] });
    }

    const hashtagIds = postHashtags.map(ph => ph.hashtag_id);

    const { data: hashtags, error: hashtagsError } = await supabase
      .from('hashtags')
      .select('*')
      .in('id', hashtagIds)
      .order('post_count', { ascending: false });

    if (hashtagsError) {
      console.error('[GET /api/posts/:postId/hashtags] Database error:', hashtagsError);
      return res.status(500).json({ error: 'Failed to fetch hashtags' });
    }

    res.json({ hashtags });
  } catch (error) {
    console.error('[GET /api/posts/:postId/hashtags] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
