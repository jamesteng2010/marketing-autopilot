import { json } from '../lib/http.mjs';
import { getConfig } from '../config.mjs';
import { loadPlatformPolicy, savePlatformPolicy } from '../../../../runtime/automation-policy.mjs';

function requireAdmin(req) {
  const { adminApiToken } = getConfig();
  if (!adminApiToken) {
    const err = new Error('Admin API is not configured (set ADMIN_API_TOKEN)');
    err.status = 503;
    throw err;
  }
  const header = req.headers['x-admin-token'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (header !== adminApiToken) {
    const err = new Error('Invalid admin token');
    err.status = 401;
    throw err;
  }
}

export async function handleGetAutomationPolicy(res, req) {
  requireAdmin(req);
  json(res, 200, { ok: true, policy: loadPlatformPolicy() });
}

export async function handlePutAutomationPolicy(res, req, body) {
  requireAdmin(req);
  if (!body || typeof body !== 'object') {
    json(res, 400, { error: 'JSON body required' });
    return;
  }
  const current = loadPlatformPolicy();
  const policy = savePlatformPolicy({
    ...current,
    ...body,
    version: current.version || 1,
  });
  json(res, 200, { ok: true, policy });
}
