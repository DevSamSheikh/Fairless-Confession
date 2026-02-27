import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/my-confessions - List current user's confessions
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        society:societies(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data ?? [];
    const postIds = rows.map((row: any) => row.id);

    let myReactionByPostId: Record<string, string | null> = {};
    if (postIds.length > 0) {
      const { data: myReactions, error: myReactionsError } = await supabase
        .from('reactions')
        .select('post_id, reaction_type')
        .eq('user_id', userId)
        .in('post_id', postIds);

      if (myReactionsError) throw myReactionsError;

      for (const row of myReactions ?? []) {
        const postId = (row as any).post_id as string;
        const reactionType = (row as any).reaction_type as string | undefined;
        if (!postId) continue;
        myReactionByPostId[postId] = reactionType ?? null;
      }
    }

    res.json(
      rows.map((row: any) => ({
        ...row,
        myReactionType: myReactionByPostId[row.id] ?? null,
      })),
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch my confessions' });
  }
});

// DELETE /api/my-confession/delete/:id
router.delete('/delete/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: post } = await supabase.from('posts').select('id, user_id').eq('id', postId).single();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== userId) return res.status(403).json({ error: 'Not your post' });

    await supabase.from('posts').delete().eq('id', postId);

    const { data: userRow } = await supabase.from('users').select('posts_count').eq('id', userId).single();
    if (userRow && userRow.posts_count > 0) {
      await supabase.from('users').update({ posts_count: userRow.posts_count - 1 }).eq('id', userId);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// PATCH /api/my-confession/edit/:id
router.patch('/edit/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;
    const { title, content, category, visibility, societyId } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: post } = await supabase.from('posts').select('id, user_id').eq('id', postId).single();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== userId) return res.status(403).json({ error: 'Not your post' });

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (visibility !== undefined) updates.visibility = visibility;
    if (societyId !== undefined) updates.society_id = societyId || null;

    const { data: updated, error } = await supabase.from('posts').update(updates).eq('id', postId).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit post' });
  }
});

export default router;
