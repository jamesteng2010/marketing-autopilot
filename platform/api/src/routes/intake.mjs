import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { json } from '../lib/http.mjs';
import { requireAuth, requireProject } from '../middleware/project-auth.mjs';
import { resolveProjectRoot } from '../services/workspace.mjs';
import {
  buildIntakeResponse,
  patchIntake,
  readAnalysisFile,
  readAnalysisJson,
  readIntake,
  writeIntake,
} from '../services/intake-store.mjs';
import { importWebsiteForProject } from '../services/website-import.mjs';
import { suggestAudienceForProject } from '../services/audience-suggest.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

export async function handleGetIntake(res, authHeader, projectId) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  json(res, 200, buildIntakeResponse(root));
}

export async function handlePatchIntake(res, authHeader, projectId, body) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const intake = patchIntake(root, body);
  json(res, 200, { intake, summary: buildIntakeResponse(root).summary });
}

export async function handleImportWebsite(res, authHeader, projectId, body) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const result = await importWebsiteForProject(root, body);
  json(res, 200, result);
}

export async function handleSuggestAudience(res, authHeader, projectId, body) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const result = await suggestAudienceForProject(root, body);
  json(res, 200, result);
}

export async function handleIntakeAnalyze(res, authHeader, projectId, body) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const userId = auth.userId;
  const projectRoot = resolveProjectRoot({ userId, projectId });

  if (!existsSync(join(projectRoot, 'intake/active.json'))) {
    json(res, 404, { error: 'Project intake not found' });
    return;
  }

  const correlationId = body.correlationId || `api_analysis_${Date.now()}`;
  const script = join(REPO_ROOT, 'runtime/analysis/prepare-analysis.mjs');

  const env = {
    ...process.env,
    PROJECT_ROOT: projectRoot,
    USER_ID: userId,
    PROJECT_ID: projectId,
    CORRELATION_ID: correlationId,
  };

  const result = await runNode(script, env);
  if (result.exitCode !== 0) {
    let parsed;
    try {
      parsed = JSON.parse(result.stdout.trim() || result.stderr.trim());
    } catch {
      parsed = { error: humanizePrepareError(result.stderr || result.stdout || 'prepare failed') };
    }
    json(res, 422, {
      ok: false,
      projectId,
      error: parsed.error || 'Analysis prepare failed',
      userHint: parsed.userHint || null,
      code: parsed.code || null,
      fallbackAvailable: parsed.fallbackAvailable ?? null,
      ...parsed,
    });
    return;
  }

  let data;
  try {
    data = JSON.parse(result.stdout);
  } catch {
    data = { ok: true, raw: result.stdout };
  }

  json(res, 202, {
    ok: true,
    projectId,
    userId,
    status: 'analysis_prepare_complete',
    correlationId,
    phaseB: data.phaseB || null,
    nextStep: data.nextStep || null,
    ...data,
  });
}

export async function handleGetFeasibility(res, authHeader, projectId) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const intake = readIntake(root);
  const md = readAnalysisFile(root, 'intake/analysis/feasibility.md');
  const extracted = readAnalysisJson(root, 'intake/analysis/extracted.json');
  const materials = intake?.materials || {};

  let status = 'not_started';
  if (materials.userConfirmedAnalysis) status = 'confirmed';
  else if (md) status = 'ready';
  else if (materials.analysisFailedAt) status = 'failed';
  else if (materials.analysisRequestedAt) status = 'running';

  json(res, 200, {
    status,
    markdown: md || null,
    extracted: extracted || null,
    analysisRequestedAt: materials.analysisRequestedAt || null,
    analysisCompletedAt: materials.analysisCompletedAt || null,
    analysisFailedAt: materials.analysisFailedAt || null,
    analysisErrorSummary: materials.analysisErrorSummary || null,
    userConfirmedAnalysis: Boolean(materials.userConfirmedAnalysis),
    analysisEngine: materials.analysisEngine || null,
    correlationId: materials.lastAnalysisCorrelationId || null,
  });
}

export async function handleGetExistingMarketing(res, authHeader, projectId) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const data = readAnalysisJson(root, 'intake/analysis/existing-marketing.json');
  if (!data) {
    json(res, 404, { error: 'Existing marketing analysis not found' });
    return;
  }
  json(res, 200, { existingMarketing: data });
}

export async function handleConfirmAnalysis(res, authHeader, projectId) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const intake = readIntake(root);
  if (!intake) {
    json(res, 404, { error: 'Intake not found' });
    return;
  }
  intake.materials = intake.materials || {};
  intake.materials.userConfirmedAnalysis = true;
  intake.materials.confirmedAt = new Date().toISOString();
  writeIntake(root, intake);
  json(res, 200, { ok: true, message: 'Analysis confirmed. Continue to Goal Workshop.' });
}

export async function handleGetGoals(res, authHeader, projectId) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const intake = readIntake(root);
  if (!intake) {
    json(res, 404, { error: 'Intake not found' });
    return;
  }
  json(res, 200, { goals: intake.goals || {} });
}

export async function handlePatchGoals(res, authHeader, projectId, body) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const intake = patchIntake(root, { goals: body });
  json(res, 200, { goals: intake.goals });
}

export async function handleConfirmGoals(res, authHeader, projectId) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const intake = readIntake(root);
  if (!intake) {
    json(res, 404, { error: 'Intake not found' });
    return;
  }
  const g = intake.goals || {};
  if (!g.primaryKpi || !g.deadline) {
    json(res, 400, { error: 'primaryKpi and deadline are required before confirming goals' });
    return;
  }
  if (!intake.materials?.userConfirmedAnalysis) {
    json(res, 400, { error: 'Confirm analysis feasibility before confirming goals' });
    return;
  }
  intake.goals.userConfirmedGoals = true;
  intake.goals.confirmedAt = new Date().toISOString();
  writeIntake(root, intake);
  json(res, 200, { ok: true, message: 'Goals confirmed. Ready for Strategy Planner.' });
}

function runNode(script, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script], { env, cwd: env.PROJECT_ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => resolve({ exitCode: code, stdout, stderr }));
  });
}

function humanizePrepareError(raw) {
  const text = String(raw || '');
  if (text.includes('resource_exhausted')) {
    return 'Cursor is at capacity or your usage limit was reached. Wait a few minutes and try again.';
  }
  const jsonMatch = text.match(/\{[\s\S]*"error"\s*:\s*"([^"]+)"[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[1];
  return text.slice(0, 400);
}
