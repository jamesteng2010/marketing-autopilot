import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectRoot } from './workspace.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

const INITIAL_PROGRESS = {
  version: 1,
  currentPhase: 'intake',
  phaseProgress: 0,
  phaseLabel: 'Intake — gather product & materials',
  tasks: [],
  pendingUserActions: [],
  metrics: {},
};

export function provisionWorkspace(userId, projectId) {
  const root = resolveProjectRoot({ userId, projectId });
  const dirs = [
    'intake/analysis',
    'materials',
    'ops/activity',
    'runtime/orchestrator',
    'runtime/credentials',
    'campaigns',
  ];
  for (const d of dirs) mkdirSync(join(root, d), { recursive: true });

  const template = readFileSync(join(REPO_ROOT, 'intake/template.json'), 'utf8');
  const intake = JSON.parse(template);
  intake.updatedAt = new Date().toISOString();
  writeFileSync(join(root, 'intake/active.json'), JSON.stringify(intake, null, 2));

  writeFileSync(join(root, 'ops/progress.json'), JSON.stringify(INITIAL_PROGRESS, null, 2));

  copyFileSync(
    join(REPO_ROOT, 'runtime/orchestrator/phases.template.json'),
    join(root, 'runtime/orchestrator/phases.json'),
  );

  return root;
}

export function newProjectId() {
  return `prj_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
