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
    const results = await db.select().from(posts).orderBy(desc(posts.createdAt));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get trending posts
router.get('/trending', async (req, res) => {
  try {
    const results = await db.select().from(posts)
      .orderBy(desc(posts.commentCount), desc(posts.createdAt))
      .limit(20);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending posts' });
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
