import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateReceiptCode(): { code: string; hash: string } {
  const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const code = `EVC-2026-${segment1}-${segment2}`;
  const hash = sha256(code);
  return { code, hash };
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
