import { Router } from 'express';
import { db } from '../db/index.js';
import { societies } from '../db/schema.js';

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

export default router;
