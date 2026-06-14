#!/usr/bin/env node
/**
 * Marketing Autopilot — local director CLI.
 * Usage: node runtime/orchestrator/director.js <command> [args]
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

function readJson(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

function cmdStatus() {
  const intake = readJson('intake/active.json');
  const registry = readJson('runtime/orchestrator/registry.json');
  const plan = readJson('runtime/orchestrator/plan.json');
  const hasStrategy = existsSync(join(ROOT, 'strategy/active-plan.md'));
  console.log(JSON.stringify({
    ok: true,
    intake: intake ? 'active' : 'missing',
    strategy: hasStrategy ? 'active' : 'missing',
    tasksEnabled: registry?.tasks?.filter((t) => t.enabled).length ?? 0,
    planPriorities: plan?.priorities ?? [],
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
  const schema = readJson('runtime/credentials/schema.json');
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
  let strategy = '';
  const sp = join(ROOT, 'strategy/active-plan.md');
  if (existsSync(sp)) strategy = readFileSync(sp, 'utf8');
  const md = [
    '# Marketing Autopilot Context',
    '',
    '## Intake',
    '```json',
    JSON.stringify(intake, null, 2),
    '```',
    '',
    '## Orchestrator plan',
    '```json',
    JSON.stringify(plan, null, 2),
    '```',
    '',
    '## Strategy excerpt',
    strategy.slice(0, 8000) || '_No active-plan.md yet_',
  ].join('\n');
  const outDir = join(ROOT, 'ops/state');
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
  const r = spawnSync(bin, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  process.exit(r.status ?? 1);
}

const [,, command, arg] = process.argv;
switch (command) {
  case 'status': cmdStatus(); break;
  case 'validate': cmdValidate(); break;
  case 'context': cmdContext(); break;
  case 'execute': cmdExecute(arg); break;
  default:
    console.log(`Usage: director.js <status|validate|context|execute> [taskId]`);
    process.exit(command ? 1 : 0);
}
