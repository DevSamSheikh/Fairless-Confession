import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { societies, societyMembers } from '../db/schema.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const allSocieties = await db.select().from(societies);
    res.json(allSocieties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch societies' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, iconName } = req.body;
    const [newSociety] = await db.insert(societies).values({
      name,
      description,
      iconName,
    }).returning();
    res.status(201).json(newSociety);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create society' });
  }
});

router.post('/join/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const societyId = req.params.id;
    const userId = req.userId as string;

    // Check if already a member
    const existingMember = await db.select()
      .from(societyMembers)
      .where(
        and(
          eq(societyMembers.userId, userId),
          eq(societyMembers.societyId, societyId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return res.status(400).json({ error: 'Already a member of this society' });
    }

    await db.insert(societyMembers).values({
      userId: userId,
      societyId: societyId,
      role: 'Member',
    });

    res.json({ message: 'Successfully joined society' });
  } catch (error) {
    console.error('Join society error:', error);
    res.status(500).json({ error: 'Failed to join society' });
  }
});

router.post('/leave/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const societyId = req.params.id;
    const userId = req.userId as string;

    await db.delete(societyMembers)
      .where(
        and(
          eq(societyMembers.userId, userId),
          eq(societyMembers.societyId, societyId)
        )
      );

    res.json({ message: 'Successfully left society' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave society' });
  }
});

export default router;
