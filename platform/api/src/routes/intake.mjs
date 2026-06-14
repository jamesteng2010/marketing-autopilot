import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { resolveProjectRoot } from '../services/workspace.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

export async function handleIntakeAnalyze(res, { projectId, body }) {
  const userId = body.userId || 'dev-user';
  const projectRoot = resolveProjectRoot({ userId, projectId });

  if (!existsSync(join(projectRoot, 'intake/active.json'))) {
    json(res, 404, { error: 'Project intake not found', projectRoot });
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
      parsed = JSON.parse(result.stderr || result.stdout);
    } catch {
      parsed = { error: result.stderr || result.stdout || 'prepare failed' };
    }
    json(res, 422, { ok: false, projectId, ...parsed });
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
    ...data,
  });
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

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
