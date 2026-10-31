import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  hashPassword,
  comparePassword,
  generateRandomToken,
  generateVerificationCode,
  sha256,
} from '../utils/crypto';

// Zod Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid college email required').refine((e) => e.includes('@'), 'Must be a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().min(3, 'Student ID is required'),
  department: z.string().min(2, 'Department is required'),
  semester: z.number().int().min(1).max(12),
  role: z.enum(['VOTER', 'CANDIDATE']).default('VOTER'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email().optional(),
  code: z.string().min(4, 'Verification code or token required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  newPassword: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, studentId, department, semester, role } = req.body;

    const existingEmail = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return res.status(409).json({ error: 'A student account with this email address already exists.' });
    }

    const existingStudentId = db.users.findOne((u) => u.studentId === studentId);
    if (existingStudentId) {
      return res.status(409).json({ error: 'A student account with this Student ID is already registered.' });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const newUser = db.users.insertOne({
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      studentId,
      department,
      semester,
      role: role || 'VOTER',
      accountStatus: 'PENDING_VERIFICATION',
      emailVerifiedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    // Create verification token & 6-digit code
    const code = generateVerificationCode();
    const token = generateRandomToken();
    db.emailTokens.insertOne({
      id: `token-${Date.now()}`,
      userId: newUser.id,
      tokenHash: sha256(token),
      code,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      usedAt: null,
      createdAt: now,
    });

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: newUser.id,
      actorEmail: newUser.email,
      actorRole: newUser.role,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: newUser.id,
      details: { department, semester, studentId },
      createdAt: now,
    });

    return res.status(201).json({
      message: 'Registration successful. Please verify your college email.',
      userId: newUser.id,
      email: newUser.email,
      demoVerificationCode: code, // Provided for prototype convenience in dev environment
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Server error during registration' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, code } = req.body;
    let user = email ? db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase()) : null;

    // Find token matching code or hash
    const tokenRecord = db.emailTokens.findOne((t) => {
      if (t.usedAt !== null) return false;
      const isCodeMatch = t.code === code.trim();
      const isHashMatch = t.tokenHash === sha256(code.trim());
      if (user) {
        return (isCodeMatch || isHashMatch) && t.userId === user.id;
      }
      return isCodeMatch || isHashMatch;
    });

    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (!user) {
      user = db.users.findById(tokenRecord.userId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const now = new Date().toISOString();
    db.emailTokens.updateOne(tokenRecord.id, { usedAt: now });
    db.users.updateOne(user.id, {
      accountStatus: 'ACTIVE',
      emailVerifiedAt: now,
    });

    db.auditLogs.insertOne({
      id: `log-${Date.now()}`,
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'EMAIL_VERIFIED',
      entityType: 'USER',
      entityId: user.id,
      details: { verifiedAt: now },
      createdAt: now,
    });

    return res.json({
      message: 'College email successfully verified! Your account is now active.',
      verified: true,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error verifying email' });
  }
}

export async function resendVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email.' });
    }

    if (user.emailVerifiedAt) {
      return res.status(400).json({ error: 'Account email is already verified.' });
    }

    const code = generateVerificationCode();
    const token = generateRandomToken();
    const now = new Date().toISOString();

    db.emailTokens.insertOne({
      id: `token-${Date.now()}`,
      userId: user.id,
      tokenHash: sha256(token),
      code,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      usedAt: null,
      createdAt: now,
    });

    return res.json({
      message: 'New verification code generated.',
      demoVerificationCode: code,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error resending code' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({ error: 'Account suspended. Contact college election administrator.' });
    }

    // Generate session token (valid for 7 days)
    const sessionToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.sessions.insertOne({
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      token: sessionToken,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    // Set HTTP-only session cookie
    res.cookie('evote_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Strip password hash from response
    const { passwordHash, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      token: sessionToken,
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error during login' });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  if (req.sessionToken) {
    db.sessions.deleteOne(req.sessionToken);
  }
  res.clearCookie('evote_session');
  return res.json({ message: 'Logged out successfully' });
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { passwordHash, ...safeUser } = req.user;
  return res.json({ user: safeUser });
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Don't leak user existence in generic message
      return res.json({ message: 'If that email exists in the student directory, a reset code was generated.' });
    }

    const code = generateVerificationCode();
    db.passwordResetTokens.insertOne({
      id: `reset-${Date.now()}`,
      userId: user.id,
      tokenHash: sha256(code),
      code,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      usedAt: null,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: 'Password reset code generated.',
      demoResetCode: code,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error processing request' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, code, newPassword } = req.body;
    const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset code or email.' });
    }

    const resetToken = db.passwordResetTokens.findOne(
      (t) => t.userId === user.id && t.code === code.trim() && t.usedAt === null
    );

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or already used reset code.' });
    }

    if (new Date(resetToken.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset code expired. Please request a new one.' });
    }

    const newHash = await hashPassword(newPassword);
    db.users.updateOne(user.id, { passwordHash: newHash });
    db.passwordResetTokens.updateOne(resetToken.id, { usedAt: new Date().toISOString() });

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error resetting password' });
  }
}
