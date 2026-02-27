import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/client.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim().length === 0) {
    return res.status(401).json({ error: 'Unauthorized: Token is missing' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token. Please log in again.' });
    }

    req.userId = user.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Authentication failed' });
  }
};
