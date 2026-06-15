import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../db/pool.mjs';
import { getConfig } from '../config.mjs';
import {
  createToken,
  hashToken,
  sendAuthEmail,
  verificationEmail,
  passwordResetEmail,
} from './mail.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const VERIFY_EMAIL_COOLDOWN_MS = 5 * 60 * 1000;

export function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim().toLowerCase());
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function signToken(user) {
  const { jwtSecret, jwtExpiresIn } = getConfig();
  if (!jwtSecret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(
    { sub: user.user_id, email: user.email, verified: true },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
}

function authBaseUrl() {
  return `${getConfig().appPublicUrl}/auth`;
}

async function sendVerificationMail(user, plainToken) {
  const { mail } = getConfig();
  const verifyUrl = `${authBaseUrl()}/verify?token=${encodeURIComponent(plainToken)}`;
  const content = verificationEmail({ verifyUrl, productName: mail.productName });
  if (mail.logVerifyLinks) {
    console.info('[auth:verify-link]', user.email, verifyUrl);
  }
  return sendAuthEmail({ to: user.email, ...content });
}

async function canSendVerificationEmail(pool, userId) {
  const [rows] = await pool.query(
    'SELECT verification_email_sent_at FROM users WHERE user_id = ? LIMIT 1',
    [userId],
  );
  const last = rows[0]?.verification_email_sent_at;
  if (!last) return true;
  return Date.now() - new Date(last).getTime() >= VERIFY_EMAIL_COOLDOWN_MS;
}

async function issueVerificationEmail(pool, userId, email) {
  if (!(await canSendVerificationEmail(pool, userId))) {
    console.info('[auth] verification email throttled for', email);
    return { sent: false, throttled: true };
  }
  const verifyToken = createToken();
  await pool.query(
    `UPDATE users SET verification_token_hash = ?, verification_token_expires_at = ?, verification_email_sent_at = NOW()
     WHERE user_id = ?`,
    [hashToken(verifyToken), new Date(Date.now() + VERIFY_TTL_MS), userId],
  );
  try {
    const mailResult = await sendVerificationMail({ email }, verifyToken);
    return { sent: Boolean(mailResult?.sent), throttled: false };
  } catch (err) {
    console.error('[auth] verification email failed:', err.message);
    return { sent: false, throttled: false };
  }
}

export async function registerUser({ email, password, displayName }) {
  const normalized = email.trim().toLowerCase();
  if (!validateEmail(normalized)) throw httpError('Invalid email address', 400);
  if (!validatePassword(password)) throw httpError('Password must be at least 8 characters', 400);

  const userId = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  const pool = getPool();

  try {
    await pool.query(
      `INSERT INTO users (user_id, email, password_hash, display_name, status, notifications_json)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, normalized, passwordHash, displayName?.trim() || null, JSON.stringify({})],
    );
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw httpError('Email already registered', 409);
    throw e;
  }

  const { sent: emailSent, throttled } = await issueVerificationEmail(pool, userId, normalized);

  const result = {
    ok: true,
    emailSent,
    throttled,
    message: throttled
      ? 'Account created. Verification email was sent recently — check your inbox or wait a few minutes before resending.'
      : emailSent
        ? 'Check your email to verify your account before signing in.'
        : 'Account created, but we could not deliver the verification email. Use “Resend verification email” or try again shortly.',
    email: normalized,
  };
  return result;
}

export async function loginUser({ email, password }) {
  const normalized = email.trim().toLowerCase();
  if (!validateEmail(normalized) || !password) throw httpError('Invalid email or password', 401);

  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT user_id, email, password_hash, display_name, created_at, status, email_verified_at
     FROM users WHERE email = ? LIMIT 1`,
    [normalized],
  );
  const row = rows[0];
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw httpError('Invalid email or password', 401);
  }

  if (row.status !== 'active' || !row.email_verified_at) {
    throw httpError('Please verify your email before signing in. Check your inbox or request a new link.', 403);
  }

  const token = signToken(row);
  return { user: toPublicUser(row), token };
}

export async function verifyEmailToken(plainToken) {
  if (!plainToken || plainToken.length < 20) throw httpError('Invalid verification link', 400);

  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT user_id, email, display_name, created_at, verification_token_expires_at, email_verified_at
     FROM users WHERE verification_token_hash = ? LIMIT 1`,
    [hashToken(plainToken)],
  );
  const row = rows[0];
  if (!row) throw httpError('Invalid or expired verification link', 400);
  if (row.email_verified_at) {
    return { ok: true, alreadyVerified: true, message: 'Email already verified. You can sign in.' };
  }
  if (new Date(row.verification_token_expires_at) < new Date()) {
    throw httpError('Verification link expired. Request a new one from the sign-in page.', 400);
  }

  await pool.query(
    `UPDATE users SET status = 'active', email_verified_at = NOW(),
      verification_token_hash = NULL, verification_token_expires_at = NULL
     WHERE user_id = ?`,
    [row.user_id],
  );

  return { ok: true, message: 'Email verified. You can now sign in.', email: row.email };
}

export async function resendVerification({ email }) {
  const normalized = email?.trim().toLowerCase();
  if (!validateEmail(normalized)) throw httpError('Invalid email address', 400);

  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT user_id, email, status, email_verified_at FROM users WHERE email = ? LIMIT 1',
    [normalized],
  );
  const row = rows[0];

  if (!row || row.email_verified_at || row.status === 'active') {
    return { ok: true, message: 'If an unverified account exists for this email, we sent a new verification link.' };
  }

  const { sent, throttled } = await issueVerificationEmail(pool, row.user_id, normalized);
  if (throttled) {
    return { ok: true, message: 'A verification email was sent recently. Please check your inbox or wait 5 minutes before requesting another.' };
  }
  if (!sent) {
    return { ok: true, message: 'Could not send email right now. Please try again in a few minutes.' };
  }

  return { ok: true, message: 'If an unverified account exists for this email, we sent a new verification link.' };
}

export async function requestPasswordReset({ email }) {
  const normalized = email?.trim().toLowerCase();
  if (!validateEmail(normalized)) throw httpError('Invalid email address', 400);

  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT user_id, email, status, email_verified_at FROM users WHERE email = ? LIMIT 1',
    [normalized],
  );
  const row = rows[0];

  if (row && row.email_verified_at) {
    const resetToken = createToken();
    const { mail, appPublicUrl } = getConfig();
    const resetUrl = `${appPublicUrl}/auth/reset?token=${encodeURIComponent(resetToken)}`;
    await pool.query(
      `UPDATE users SET password_reset_token_hash = ?, password_reset_expires_at = ? WHERE user_id = ?`,
      [hashToken(resetToken), new Date(Date.now() + RESET_TTL_MS), row.user_id],
    );
    const content = passwordResetEmail({ resetUrl, productName: mail.productName });
    try {
      await sendAuthEmail({ to: normalized, ...content });
    } catch (err) {
      console.error('[auth] password reset email failed:', err.message);
    }
  }

  return { ok: true, message: 'If an account exists for this email, we sent password reset instructions.' };
}

export async function resetPassword({ token, password }) {
  if (!validatePassword(password)) throw httpError('Password must be at least 8 characters', 400);
  if (!token || token.length < 20) throw httpError('Invalid reset link', 400);

  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT user_id FROM users
     WHERE password_reset_token_hash = ? AND password_reset_expires_at > NOW() LIMIT 1`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row) throw httpError('Invalid or expired reset link', 400);

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `UPDATE users SET password_hash = ?, password_reset_token_hash = NULL, password_reset_expires_at = NULL
     WHERE user_id = ?`,
    [passwordHash, row.user_id],
  );

  return { ok: true, message: 'Password updated. You can sign in with your new password.' };
}

export function verifyToken(authHeader) {
  const { jwtSecret } = getConfig();
  if (!jwtSecret) throw httpError('JWT_SECRET is not configured', 500);
  if (!authHeader?.startsWith('Bearer ')) throw httpError('Missing or invalid Authorization header', 401);

  try {
    const payload = jwt.verify(authHeader.slice(7), jwtSecret);
    return { userId: payload.sub, email: payload.email };
  } catch {
    throw httpError('Invalid or expired token', 401);
  }
}

export async function getUserById(userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT user_id, email, display_name, created_at, status, email_verified_at
     FROM users WHERE user_id = ? LIMIT 1`,
    [userId],
  );
  if (!rows[0]) return null;
  return toPublicUser(rows[0]);
}

function toPublicUser(row) {
  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name || null,
    emailVerified: Boolean(row.email_verified_at),
    status: row.status || (row.email_verified_at ? 'active' : 'pending'),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}
