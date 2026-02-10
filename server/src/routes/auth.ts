import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { IdentityService } from '../services/identityService';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/anonymous-login', async (req, res) => {
  try {
    const { identityId, avatarSeed } = IdentityService.generateIdentity();
    
    const [newUser] = await db.insert(users).values({
      identityId,
      avatarSeed,
    }).returning();

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
