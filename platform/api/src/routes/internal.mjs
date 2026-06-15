import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { json } from '../lib/http.mjs';
import { getConfig } from '../config.mjs';
import { resolveProjectRoot } from '../services/workspace.mjs';

function requireAutomationToken(req) {
  const { automationCallbackToken } = getConfig();
  if (!automationCallbackToken) {
    const err = new Error('Automation callback is not configured (AUTOMATION_CALLBACK_TOKEN)');
    err.status = 503;
    throw err;
  }
  const header = req.headers['x-automation-token'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (header !== automationCallbackToken) {
    const err = new Error('Invalid automation token');
    err.status = 401;
    throw err;
  }
}

export async function handleAutomationCallback(res, req, body) {
  requireAutomationToken(req);

  const { userId, projectId, correlationId, status, feasibilityMarkdown, extracted, errorSummary } = body || {};
  if (!userId || !projectId) {
    json(res, 400, { error: 'userId and projectId are required' });
    return;
  }

  const root = resolveProjectRoot({ userId, projectId });
  if (!existsSync(join(root, 'intake/active.json'))) {
    json(res, 404, { error: 'Project intake not found' });
    return;
  }

  if (status === 'failed') {
    const intake = JSON.parse(readFileSync(join(root, 'intake/active.json'), 'utf8'));
    intake.materials = intake.materials || { items: [] };
    intake.materials.analysisFailedAt = new Date().toISOString();
    intake.materials.analysisErrorSummary = errorSummary || 'Automation failed';
    if (correlationId) intake.materials.lastAnalysisCorrelationId = correlationId;
    writeFileSync(join(root, 'intake/active.json'), JSON.stringify(intake, null, 2));
    json(res, 200, { ok: true, recorded: 'failed', correlationId, errorSummary: errorSummary || null });
    return;
  }

  if (!feasibilityMarkdown?.trim()) {
    json(res, 400, { error: 'feasibilityMarkdown is required when status is completed' });
    return;
  }

  const analysisDir = join(root, 'intake/analysis');
  mkdirSync(analysisDir, { recursive: true });
  writeFileSync(join(analysisDir, 'feasibility.md'), `${feasibilityMarkdown.trim()}\n`);
  if (extracted && typeof extracted === 'object') {
    writeFileSync(join(analysisDir, 'extracted.json'), JSON.stringify(extracted, null, 2));
  }

  const intake = JSON.parse(readFileSync(join(root, 'intake/active.json'), 'utf8'));
  intake.materials = intake.materials || { items: [] };
  intake.materials.analysisCompletedAt = new Date().toISOString();
  intake.materials.analysisEngine = 'cursor-automation-05';
  if (correlationId) intake.materials.lastAnalysisCorrelationId = correlationId;
  writeFileSync(join(root, 'intake/active.json'), JSON.stringify(intake, null, 2));

  json(res, 200, {
    ok: true,
    recorded: 'completed',
    projectId,
    userId,
    correlationId: correlationId || null,
  });
}
