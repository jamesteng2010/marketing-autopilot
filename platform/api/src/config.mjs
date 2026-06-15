import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = join(API_ROOT, '.env');

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv(ENV_PATH);

export function getConfig() {
  const port = Number(process.env.PORT || 3001);
  const db = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'marketing-autopilot',
    password: process.env.DB_PASS || process.env.MARKETING_AUTOPILOT_DB_PASS || '',
    database: process.env.DB_NAME || 'marketing-autopilot-dev',
  };
  const jwtSecret = process.env.JWT_SECRET || '';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const appPublicUrl = (process.env.APP_PUBLIC_URL || 'https://api.myreceipt.website').replace(/\/$/, '');
  const mail = {
    from: process.env.MAIL_FROM || 'noreply@myreceipt.website',
    fromName: process.env.MAIL_FROM_NAME || 'Marketing Autopilot',
    replyTo: process.env.MAIL_REPLY_TO || 'noreply@myreceipt.website',
    devLog: process.env.MAIL_DEV_LOG === 'true',
    logVerifyLinks: process.env.MAIL_LOG_VERIFY_LINKS === 'true',
    productName: process.env.MAIL_PRODUCT_NAME || 'Marketing Autopilot',
  };
  const aws = {
    region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };
  const adminApiToken = process.env.ADMIN_API_TOKEN || '';
  const automationCallbackToken = process.env.AUTOMATION_CALLBACK_TOKEN || '';
  return {
    port,
    db,
    jwtSecret,
    jwtExpiresIn,
    appPublicUrl,
    mail,
    aws,
    adminApiToken,
    automationCallbackToken,
    publicDir: join(API_ROOT, 'public'),
  };
}
