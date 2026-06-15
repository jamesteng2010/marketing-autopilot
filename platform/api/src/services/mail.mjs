import { createHash, randomBytes } from 'node:crypto';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { getConfig } from '../config.mjs';

let sesClient;

function getSes() {
  if (!sesClient) {
    const { aws } = getConfig();
    sesClient = new SESClient({
      region: aws.region,
      credentials: aws.accessKeyId && aws.secretAccessKey
        ? { accessKeyId: aws.accessKeyId, secretAccessKey: aws.secretAccessKey }
        : undefined,
    });
  }
  return sesClient;
}

export function createToken() {
  return randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function sendAuthEmail({ to, subject, html, text }) {
  const { mail, aws } = getConfig();

  if (!mail.from) {
    console.warn('[mail] MAIL_FROM not set; skipping send to', to);
    console.info('[mail]', subject, text);
    return { skipped: true };
  }

  if (!aws.accessKeyId || !aws.secretAccessKey) {
    if (mail.devLog) {
      console.info('[mail:dev]', { to, subject, text });
      return { devLog: true };
    }
    throw new Error('AWS credentials not configured for SES');
  }

  const source = mail.fromName ? `${mail.fromName} <${mail.from}>` : mail.from;

  const cmd = new SendEmailCommand({
    Source: source,
    ReplyToAddresses: mail.replyTo ? [mail.replyTo] : undefined,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: html, Charset: 'UTF-8' },
        Text: { Data: text, Charset: 'UTF-8' },
      },
    },
  });

  try {
    await getSes().send(cmd);
    console.info('[mail] sent to', to, 'subject:', subject);
    return { sent: true };
  } catch (err) {
    console.error('[mail] SES send failed:', err.message, 'to:', to);
    if (mail.devLog) {
      console.info('[mail:dev-fallback]', { to, subject, text });
      return { sent: false, devLog: true, failed: true, error: err.message };
    }
    throw new Error('Unable to send email right now. Please try again in a few minutes.');
  }
}

export function verificationEmail({ verifyUrl, productName = 'Marketing Autopilot' }) {
  const subject = `Verify your email — ${productName}`;
  const text = `Welcome to ${productName}.\n\nVerify your email by opening this link (valid 24 hours):\n${verifyUrl}\n\nIf you did not create an account, ignore this email.`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 12px">Verify your email</h2>
      <p>Thanks for signing up for <strong>${productName}</strong>. Click the button below to activate your account.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;background:#0891b2;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Verify email</a></p>
      <p style="color:#64748b;font-size:14px">Or copy this link: ${verifyUrl}</p>
      <p style="color:#64748b;font-size:14px">This link expires in 24 hours. If you did not sign up, you can ignore this message.</p>
    </div>`;
  return { subject, text, html };
}

export function passwordResetEmail({ resetUrl, productName = 'Marketing Autopilot' }) {
  const subject = `Reset your password — ${productName}`;
  const text = `We received a request to reset your ${productName} password.\n\nOpen this link (valid 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 12px">Reset your password</h2>
      <p>Click the button below to choose a new password for <strong>${productName}</strong>.</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#0891b2;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a></p>
      <p style="color:#64748b;font-size:14px">Or copy this link: ${resetUrl}</p>
      <p style="color:#64748b;font-size:14px">This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
    </div>`;
  return { subject, text, html };
}
