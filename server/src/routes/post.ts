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

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required' });
    }

    const filter = filterPostContent(String(title ?? ''), String(content ?? ''));
    if (!filter.allowed) {
      console.log('[POST /api/post] Content blocked:', {
        title: title?.substring(0, 50),
        content: content?.substring(0, 100),
        error: filter.error,
      });
      return res.status(400).json({
        error: filter.error ?? 'Content not allowed',
        sanitizedTitle: filter.sanitizedTitle,
        sanitizedContent: filter.sanitizedContent,
      });
    }

    // If this is a society post, ensure society exists + user is a member.
    // Also force society posts to be non-public so they don't appear in /api/home.
    let finalSocietyId: string | null = null;
    let finalVisibility: string = visibility ?? 'public';

    if (societyId) {
      finalSocietyId = String(societyId).trim();

      // Treat empty-ish ids as no society
      if (!finalSocietyId || finalSocietyId === 'null' || finalSocietyId === 'undefined') {
        finalSocietyId = null;
      } else {
        finalVisibility = 'society';

        // Ensure society exists
        const { data: societyRow, error: societyErr } = await supabase
          .from('societies')
          .select('id')
          .eq('id', finalSocietyId)
          .single();
        if (societyErr || !societyRow) {
          console.log('[POST /api/post] Invalid societyId:', { societyId: finalSocietyId, error: societyErr });
          return res.status(400).json({ error: `Invalid societyId: ${finalSocietyId}` });
        }

        // Ensure user is a member
        const { data: memberRow, error: memberErr } = await supabase
          .from('society_members')
          .select('id')
          .eq('user_id', req.userId)
          .eq('society_id', finalSocietyId)
          .maybeSingle();

        if (memberErr) {
          console.error('Membership check error:', memberErr);
          return res.status(500).json({ error: 'Failed to validate society membership' });
        }
        if (!memberRow) {
          return res.status(403).json({ error: 'You must join this society to post there' });
        }
      }
    }

    // Get user profile (non-blocking - continue even if this fails)
    let profile = null;
    try {
      const { data: profileData } = await supabase.from('users').select('identity_id').eq('id', req.userId).single();
      profile = profileData;
    } catch (profileError) {
      console.warn('Failed to fetch user profile:', profileError);
    }

    // Insert post
    const safeTitle = String(title ?? '').trim();
    const finalTitle = safeTitle.length > 0 ? safeTitle : 'EMPTY'; // DB column is NOT NULL

    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: req.userId,
        title: finalTitle,
        content: (content ?? '').trim(),
        category: category ?? 'Secrets',
        visibility: finalVisibility,
        society_id: finalSocietyId
      })
      .select()
      .single();

    if (postError) {
      console.error('[POST /api/post] Database insert error:', {
        error: postError,
        message: postError.message,
        code: postError.code,
        details: postError.details,
        title: finalTitle.substring(0, 50),
        category,
        visibility: finalVisibility,
        societyId: finalSocietyId,
      });
      return res.status(400).json({ 
        error: postError.message || 'Failed to create post. Please check your input.',
        code: postError.code,
        hint: postError.code === '23502' ? 'Missing required field' : postError.code === '23505' ? 'Duplicate entry' : undefined
      });
    }

    if (!newPost || !newPost.id) {
      return res.status(500).json({ error: 'Post was created but no ID was returned' });
    }

    // Log activity (non-blocking - don't fail the request if this fails)
    try {
      const info = getClientInfo(req, req.body);
      const { error: logError } = await supabase.from('post_activity_log').insert({
        post_id: newPost.id,
        user_id: req.userId,
        user_identity_id: profile?.identity_id ?? null,
        category: newPost.category,
        society_id: newPost.society_id,
        heading: newPost.title,
        content: newPost.content,
        ip_address: info.ip_address,
        device_info: info.device_info
      });
      if (logError) {
        console.warn('Failed to log post activity:', logError);
      }
    } catch (logErr) {
      console.warn('Error logging post activity:', logErr);
    }

    // Update user post count (non-blocking)
    try {
      const { data: userRow } = await supabase.from('users').select('posts_count').eq('id', req.userId).single();
      if (userRow) {
        await supabase.from('users').update({ posts_count: (userRow.posts_count ?? 0) + 1 }).eq('id', req.userId);
      }
    } catch (countErr) {
      console.warn('Failed to update user post count:', countErr);
    }

    res.status(201).json(newPost);
  } catch (error: any) {
    console.error('Post creation error:', error);
    const errorMessage = error?.message || 'Failed to create post';
    const statusCode = error?.status || error?.statusCode || 500;
    res.status(statusCode).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
    });
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

    // Hide society-only posts from non-members.
    // If a post is linked to a society and is not public, require membership.
    if (post.society_id && post.visibility && post.visibility !== 'public') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const { data: memberRow } = await supabase
        .from('society_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('society_id', post.society_id)
        .maybeSingle();

      if (!memberRow) {
        return res.status(404).json({ error: 'Post not found' });
      }
    }

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
