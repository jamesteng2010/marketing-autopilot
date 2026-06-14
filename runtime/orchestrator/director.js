#!/usr/bin/env node
/**
 * Marketing Autopilot — orchestrator director.
 * PROJECT_ROOT env = project workspace (e.g. projects/marketing-autopilot-launch)
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../..');

function getRoot() {
  return process.env.PROJECT_ROOT
    ? (process.env.PROJECT_ROOT.startsWith('/') ? process.env.PROJECT_ROOT : join(REPO_ROOT, process.env.PROJECT_ROOT))
    : REPO_ROOT;
}

function readJson(rel) {
  const p = join(getRoot(), rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

function cmdStatus() {
  const intake = readJson('intake/active.json');
  const registry = readJson('runtime/orchestrator/registry.json');
  const plan = readJson('runtime/orchestrator/plan.json');
  const phases = readJson('runtime/orchestrator/phases.json');
  const progress = readJson('ops/progress.json');
  const hasStrategy = existsSync(join(getRoot(), 'strategy/active-plan.md'));
  console.log(JSON.stringify({
    ok: true,
    projectRoot: getRoot(),
    intake: intake ? 'active' : 'missing',
    strategy: hasStrategy ? 'active' : 'missing',
    currentPhase: phases?.currentPhase ?? null,
    phaseProgress: progress?.phaseProgress ?? 0,
    tasksEnabled: registry?.tasks?.filter((t) => t.enabled).length ?? 0,
    planPriorities: plan?.priorities ?? [],
    pendingUserActions: progress?.pendingUserActions ?? [],
  }, null, 2));
}

function cmdValidate() {
  const intake = readJson('intake/active.json');
  const missing = [];
  if (!intake) {
    missing.push('intake/active.json (copy from intake/template.json)');
  } else {
    if (!intake.product?.name) missing.push('product.name');
    if (!intake.product?.url) missing.push('product.url');
    if (!intake.goals?.deadline) missing.push('goals.deadline');
    if (!intake.marketing?.channelsPreferred?.length) missing.push('marketing.channelsPreferred');
  }
  const schema = readJson(join(REPO_ROOT, 'runtime/credentials/schema.json'));
  const channels = intake?.marketing?.channelsPreferred ?? [];
  const credGaps = [];
  for (const ch of channels) {
    const key = ch.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (schema?.channels?.[key] && !(intake.credentialsProvided || []).includes(key)) {
      credGaps.push(key);
    }
  }
  const ok = missing.length === 0;
  console.log(JSON.stringify({ ok, missing, credentialsPending: credGaps }, null, 2));
  process.exit(ok ? 0 : 1);
}

function cmdContext() {
  const intake = readJson('intake/active.json');
  const plan = readJson('runtime/orchestrator/plan.json');
  const phases = readJson('runtime/orchestrator/phases.json');
  const progress = readJson('ops/progress.json');
  let strategy = '';
  const sp = join(getRoot(), 'strategy/active-plan.md');
  if (existsSync(sp)) strategy = readFileSync(sp, 'utf8');
  const md = [
    '# Marketing Autopilot Context',
    '',
    '## Intake',
    '```json',
    JSON.stringify(intake, null, 2),
    '```',
    '',
    '## Phases',
    '```json',
    JSON.stringify(phases, null, 2),
    '```',
    '',
    '## Progress',
    '```json',
    JSON.stringify(progress, null, 2),
    '```',
    '',
    '## Strategy excerpt',
    strategy.slice(0, 8000) || '_No active-plan.md yet_',
  ].join('\n');
  const outDir = join(getRoot(), 'ops/state');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'agent-context.md');
  writeFileSync(outPath, md);
  console.log(outPath);
}

function cmdExecute(taskId) {
  const registry = readJson('runtime/orchestrator/registry.json');
  const task = registry?.tasks?.find((t) => t.id === taskId && t.enabled);
  if (!task) {
    console.error(JSON.stringify({ ok: false, error: `Unknown or disabled task: ${taskId}` }));
    process.exit(1);
  }
  const parts = task.command.split(/\s+/);
  const bin = parts[0];
  const args = parts.slice(1);
  const env = { ...process.env, PROJECT_ROOT: getRoot() };
  const r = spawnSync(bin, args, { cwd: REPO_ROOT, stdio: 'inherit', shell: process.platform === 'win32', env });
  process.exit(r.status ?? 1);
}

function cmdRunPhase(phaseId) {
  const phases = readJson('runtime/orchestrator/phases.json');
  const registry = readJson('runtime/orchestrator/registry.json');
  if (!phases) {
    console.error(JSON.stringify({ ok: false, error: 'Missing runtime/orchestrator/phases.json' }));
    process.exit(1);
  }
  const pid = phaseId || phases.currentPhase;
  const phase = phases.phases?.[pid];
  if (!phase) {
    console.error(JSON.stringify({ ok: false, error: `Unknown phase: ${pid}` }));
    process.exit(1);
  }
  console.log(`\n▶ Phase: ${pid} — ${phase.label}\n`);
  const results = [];
  for (const taskId of phase.taskIds || []) {
    const task = registry?.tasks?.find((t) => t.id === taskId);
    if (!task) {
      results.push({ taskId, ok: false, error: 'not in registry' });
      continue;
    }
    if (!task.enabled) {
      results.push({ taskId, ok: false, error: 'disabled' });
      continue;
    }
    console.log(`  → ${taskId}: ${task.name}`);
    const parts = task.command.split(/\s+/);
    const r = spawnSync(parts[0], parts.slice(1), {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, PROJECT_ROOT: getRoot() },
    });
    results.push({ taskId, ok: r.status === 0, exitCode: r.status });
    if (r.status !== 0) break;
  }
  const allOk = results.every((x) => x.ok);
  console.log(JSON.stringify({ ok: allOk, phase: pid, results }, null, 2));
  process.exit(allOk ? 0 : 1);
}

const [,, command, arg] = process.argv;
switch (command) {
  case 'status': cmdStatus(); break;
  case 'validate': cmdValidate(); break;
  case 'context': cmdContext(); break;
  case 'execute': cmdExecute(arg); break;
  case 'run-phase': cmdRunPhase(arg); break;
  default:
    console.log(`Usage: director.js <status|validate|context|execute|run-phase> [taskId|phaseId]`);
    console.log(`  PROJECT_ROOT=projects/marketing-autopilot-launch for dogfood project`);
    process.exit(command ? 1 : 0);
}
