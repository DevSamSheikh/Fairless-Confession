import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class IdentityService {
  static generateIdentity(): { identityId: string; avatarSeed: string } {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return {
      identityId: `#Confess_${randomNum}`,
      avatarSeed: uuidv4(),
    };
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    } catch {
      return null;
    }
  }
}
