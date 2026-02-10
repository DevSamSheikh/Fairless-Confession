import { Router } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { IdentityService } from '../services/identityService.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/anonymous-login', async (req, res) => {
  try {
    const { identityId, avatarSeed } = IdentityService.generateIdentity();
    
    const results = await db.insert(users).values({
      identityId,
      avatarSeed,
    }).returning();

    const newUser = results[0];
    if (!newUser) {
      throw new Error('Failed to create user');
    }

    const token = IdentityService.generateToken(newUser.id);
    
    res.json({
      token,
      user: {
        id: newUser.id,
        identityId: newUser.identityId,
        avatarSeed: newUser.avatarSeed,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to create anonymous session' });
  }
});

export default router;
