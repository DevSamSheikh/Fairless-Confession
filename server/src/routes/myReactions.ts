import { Router } from 'express';
import { supabase } from '../db/client.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/my-reactions - Fetch all posts the user has reacted to
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Get all post IDs the user has reacted to
    const { data: reactions, error: reactionsError } = await supabase
      .from('reactions')
      .select('post_id, reaction_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (reactionsError) throw reactionsError;

    if (!reactions || reactions.length === 0) {
      return res.json([]);
    }

    const postIds = reactions.map((r: any) => r.post_id);

    // Fetch the posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        category,
        created_at,
        reactions_summary,
        comment_count,
        society:societies(id, name)
      `)
      .in('id', postIds);

    if (postsError) throw postsError;

    // Map posts with user's reaction type
    const postsWithReactions = (posts || []).map((post: any) => {
      const userReaction = reactions.find((r: any) => r.post_id === post.id);
      return {
        id: post.id,
        title: post.title || undefined,
        content: post.content || '',
        category: post.category ?? 'Secrets',
        societyName: post.society?.name ?? undefined,
        reactions: (post.reactions_summary as Record<string, number> | null) ?? {},
        myReactionType: userReaction?.reaction_type ?? null,
        commentCount: post.comment_count ?? 0,
        createdAt: new Date(post.created_at).toISOString(),
        isOwner: false,
      };
    });

    // Sort by reaction date (most recent first)
    const sortedPosts = postsWithReactions.sort((a, b) => {
      const aReaction = reactions.find((r: any) => r.post_id === a.id);
      const bReaction = reactions.find((r: any) => r.post_id === b.id);
      const aDate = aReaction ? new Date(aReaction.created_at).getTime() : 0;
      const bDate = bReaction ? new Date(bReaction.created_at).getTime() : 0;
      return bDate - aDate;
    });

    res.json(sortedPosts);
  } catch (error) {
    console.error('GET /api/my-reactions error:', error);
    res.status(500).json({ error: 'Failed to fetch reactions' });
  }
});

export default router;
