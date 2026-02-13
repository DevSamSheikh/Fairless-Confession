import { Router } from 'express';
import { db } from '../db/index.js';
import { posts, comments, reactions, users } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/posts - Fetch latest confessions
router.get('/', async (req, res) => {
  try {
    const allPosts = await db.query.posts.findMany({
      with: {
        userId: {
          columns: { identityId: true, avatarSeed: true }
        }
      },
      orderBy: [desc(posts.createdAt)],
      limit: 20
    });
    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/posts - Create a new confession
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, category, visibility, societyId } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const [newPost] = await db.insert(posts).values({
      userId: req.userId,
      title,
      content,
      category,
      visibility: visibility || 'public',
      societyId: societyId || null,
    }).returning();

    // Increment user post count
    await db.update(users)
      .set({ postsCount: sql`${users.postsCount} + 1` })
      .where(eq(users.id, req.userId));

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/posts/:id - Get detailed view with comments
router.get('/:id', async (req, res) => {
  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, req.params.id),
      with: {
        userId: { columns: { identityId: true, avatarSeed: true } }
      }
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const postComments = await db.query.comments.findMany({
      where: eq(comments.postId, req.params.id),
      with: {
        userId: { columns: { identityId: true, avatarSeed: true } }
      },
      orderBy: [desc(comments.createdAt)]
    });

    res.json({ ...post, comments: postComments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post details' });
  }
});

export default router;
