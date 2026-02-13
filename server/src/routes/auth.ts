import { Router } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existingUser) return res.status(400).json({ error: 'Email exists' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const identityId = `#Confess_${Math.floor(1000 + Math.random() * 9000)}`;
    const avatarSeed = uuidv4();
    const userIdCustom = `2004-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      fullName,
      identityId,
      avatarSeed,
      userIdCustom,
    }).returning();

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.id, identityId, avatarSeed, email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, identityId: user.identityId, avatarSeed: user.avatarSeed } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
