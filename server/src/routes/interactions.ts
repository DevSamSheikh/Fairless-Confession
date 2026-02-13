import { Router } from 'express';
import { db } from '../db/index.js';
import { reactions, comments, posts, users } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/interactions/react - Add/toggle reaction
router.post('/react', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId, reactionType } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    await db.insert(reactions).values({
      userId: req.userId,
      postId,
      reactionType
    });

    // Update post summary
    await db.update(posts)
      .set({ 
        reactionsSummary: sql`${posts.reactionsSummary} || jsonb_build_object(${reactionType}, (COALESCE((${posts.reactionsSummary}->>${reactionType})::int, 0) + 1))`
      })
      .where(eq(posts.id, postId));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to react' });
  }
});

// POST /api/interactions/comment - Add a comment
router.post('/comment', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId, content } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const [newComment] = await db.insert(comments).values({
      userId: req.userId,
      postId,
      content
    }).returning();

    await db.update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, postId));

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to comment' });
  }
});

export default router;
