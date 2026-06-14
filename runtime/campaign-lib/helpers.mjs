/**
 * Shared helpers for campaign scripts.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getProjectRoot() {
  return process.env.PROJECT_ROOT || process.cwd();
}

export function readProjectJson(rel) {
  const p = join(getProjectRoot(), rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

export function writeProjectJson(rel, data) {
  const p = join(getProjectRoot(), rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2));
}

export function ensureDir(rel) {
  mkdirSync(join(getProjectRoot(), rel), { recursive: true });
}

export function writeText(rel, content) {
  const p = join(getProjectRoot(), rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

export function logActivity(entry) {
  const line = JSON.stringify({
    id: `evt_${Date.now()}`,
    ts: new Date().toISOString(),
    level: 'project',
    actor: 'automation',
    source: entry.source || 'campaign',
    ...entry,
  });
  const p = join(getProjectRoot(), 'ops/activity/events.jsonl');
  mkdirSync(dirname(p), { recursive: true });
  appendFileSync(p, line + '\n');
}

export function logAction(entry) {
  const day = new Date().toISOString().slice(0, 10);
  const ts = new Date().toISOString();
  const actionLine = JSON.stringify({ ts, ...entry });
  const actionPath = join(getProjectRoot(), `ops/actions/${day}.jsonl`);
  mkdirSync(dirname(actionPath), { recursive: true });
  appendFileSync(actionPath, actionLine + '\n');

  const actionId = entry.action || entry.actionId || 'marketing.action';
  const channel = entry.channel || entry.accountId?.split('_')[0] || 'unknown';
  logActivity({
    type: 'marketing.action.executed',
    category: 'automation.marketing',
    actorId: entry.taskId || 'campaign',
    summary: entry.summary || `${actionId} on ${channel}`,
    payload: {
      ...entry,
      actionLogRef: `ops/actions/${day}.jsonl`,
    },
    correlationId: entry.correlationId || process.env.CORRELATION_ID || null,
  });
}

export function updateProgress(updater) {
  const rel = 'ops/progress.json';
  const current = readProjectJson(rel) || {
    currentPhase: 'week_1',
    phaseProgress: 0,
    tasks: [],
    pendingUserActions: [],
    metrics: {},
  };
  const next = updater(current);
  writeProjectJson(rel, next);
  return next;
}

export function setTaskStatus(taskId, status, summary, extra = {}) {
  return updateProgress((p) => {
    const tasks = [...(p.tasks || [])];
    const i = tasks.findIndex((t) => t.id === taskId);
    const row = { id: taskId, status, summary, updatedAt: new Date().toISOString(), ...extra };
    if (i >= 0) tasks[i] = row;
    else tasks.push(row);
    const done = tasks.filter((t) => t.status === 'done').length;
    const total = tasks.length || 1;
    return { ...p, tasks, phaseProgress: Math.min(1, done / total) };
  });
}

export function loadUserInputs() {
  return readProjectJson('runtime/user-inputs.json') || {};
}
