import { Router } from 'express';
import { db } from '../db/index.js';
import { posts, users } from '../db/schema.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { desc, eq } from 'drizzle-orm';

const router = Router();

// Get all posts (latest first)
router.get('/', async (req, res) => {
  try {
    const allPosts = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      with: {
        userId: true, // This is a bit tricky with Drizzle relational queries if not set up, but let's stick to basics
      },
    });
    // For simplicity without full relational setup in db/index.ts yet:
    const results = await db.select().from(posts).orderBy(desc(posts.createdAt));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create post
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, category, societyId } = req.body;
    const [newPost] = await db.insert(posts).values({
      userId: req.userId!,
      title,
      content,
      category,
      societyId: societyId || null,
      reactionsSummary: {},
    }).returning();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

export default router;
