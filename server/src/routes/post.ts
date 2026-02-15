import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { getClientInfo } from '../lib/tracking.js';
import { filterPostContent } from '../lib/contentFilter.js';

const router = Router();

// POST /api/post - Create confession (from profile or society); trace details (unique id, username, date/time, category, society id, heading, content, engagement)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, category, visibility, societyId } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const filter = filterPostContent(String(title ?? ''), String(content ?? ''));
    if (!filter.allowed) {
      return res.status(400).json({
        error: filter.error ?? 'Content not allowed',
        sanitizedTitle: filter.sanitizedTitle,
        sanitizedContent: filter.sanitizedContent,
      });
    }

    const { data: profile } = await supabase.from('users').select('identity_id').eq('id', req.userId).single();

    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: req.userId,
        title: title ?? '',
        content: content ?? '',
        category: category ?? 'Secrets',
        visibility: visibility ?? 'public',
        society_id: societyId ?? null
      })
      .select()
      .single();

    if (postError) throw postError;

    const info = getClientInfo(req, req.body);
    await supabase.from('post_activity_log').insert({
      post_id: newPost.id,
      user_id: req.userId,
      user_identity_id: profile?.identity_id ?? '',
      category: newPost.category,
      society_id: newPost.society_id,
      heading: newPost.title,
      content: newPost.content,
      ip_address: info.ip_address,
      device_info: info.device_info
    });

    const { data: userRow } = await supabase.from('users').select('posts_count').eq('id', req.userId).single();
    if (userRow) {
      await supabase.from('users').update({ posts_count: (userRow.posts_count ?? 0) + 1 }).eq('id', req.userId);
    }

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/post/:id - Single post (for share link); increment view
router.get('/:id', async (req, res) => {
  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom)
      `)
      .eq('id', req.params.id)
      .single();

    if (postError || !post) return res.status(404).json({ error: 'Post not found' });

    await supabase.from('posts').update({ view_count: (post.view_count ?? 0) + 1 }).eq('id', req.params.id);

    const { data: postComments } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(identity_id, avatar_seed, user_id_custom)
      `)
      .eq('post_id', req.params.id)
      .order('created_at', { ascending: false });

    res.json({ ...post, comments: postComments ?? [], view_count: (post.view_count ?? 0) + 1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export default router;
