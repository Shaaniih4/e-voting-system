import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { User, UserRole } from '../models/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionToken?: string;
}

export function extractSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookies = req.headers.cookie;
  if (cookies) {
    const match = cookies.match(/evote_session=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractSessionToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }

  const session = db.sessions.findOne((s) => s.token === token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    db.sessions.deleteOne(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const user = db.users.findById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  if (user.accountStatus === 'SUSPENDED') {
    return res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
      });
    }
    next();
  };
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractSessionToken(req);
  if (token) {
    const session = db.sessions.findOne((s) => s.token === token);
    if (session && new Date(session.expiresAt).getTime() >= Date.now()) {
      const user = db.users.findById(session.userId);
      if (user && user.accountStatus !== 'SUSPENDED') {
        req.user = user;
        req.sessionToken = token;
      }
    }
  }
  next();
}
