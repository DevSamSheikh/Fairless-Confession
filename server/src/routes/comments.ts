import { Router } from 'express';
import { db } from '../db/index.js';
import { comments, posts } from '../db/schema.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await db.select().from(comments).where(eq(comments.postId, postId));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Post a comment
router.post('/:postId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    const [newComment] = await db.insert(comments).values({
      postId,
      userId,
      content
    }).returning();

    // Increment comment count on post
    await db.update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, postId));

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;