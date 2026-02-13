import { Router } from 'express';
import { db } from '../db/index.js';
import { societies, societyMembers } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/societies - List all societies
router.get('/', async (req, res) => {
  try {
    const allSocieties = await db.query.societies.findMany();
    res.json(allSocieties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch societies' });
  }
});

// POST /api/societies/join/:id - Join a society
router.post('/join/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await db.insert(societyMembers).values({
      userId: userId,
      societyId: req.params.id,
      role: 'Member'
    });

    await db.update(societies)
      .set({ memberCount: sql`${societies.memberCount} + 1` })
      .where(eq(societies.id, req.params.id));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join society' });
  }
});

export default router;
