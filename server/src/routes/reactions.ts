import { Router } from 'express';
import { db } from '../db/index.js';
import { reactions, comments, posts } from '../db/schema.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Add reaction to a post
router.post('/posts/:postId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const userId = req.userId!;

    // Check if user already reacted
    const existing = await db.select().from(reactions)
      .where(sql`${reactions.postId} = ${postId} AND ${reactions.userId} = ${userId}`)
      .limit(1);

    if (existing.length > 0) {
      // Update existing reaction
      await db.update(reactions)
        .set({ reactionType })
        .where(eq(reactions.id, existing[0].id));
    } else {
      // Insert new reaction
      await db.insert(reactions).values({
        postId,
        userId,
        reactionType
      });
    }

    // Update reactions summary on post (simple count for now)
    await db.update(posts)
      .set({
        reactionsSummary: sql`jsonb_set(reactions_summary, ARRAY[${reactionType}], (COALESCE((reactions_summary->>${reactionType})::int, 0) + 1)::text::jsonb)`
      })
      .where(eq(posts.id, postId));

    res.json({ message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

export default router;