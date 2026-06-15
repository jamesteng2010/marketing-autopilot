import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POLICY_PATH = join(REPO_ROOT, 'runtime/automation-policy.json');

export function getPolicyPath() {
  return POLICY_PATH;
}

export function loadPlatformPolicy() {
  if (!existsSync(POLICY_PATH)) {
    return {
      version: 1,
      complianceNotes: '',
      forbiddenActions: [],
      contentRules: [],
      defaultBrandTone: 'professional',
      requireUserApprovalFor: {},
    };
  }
  return JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
}

export function savePlatformPolicy(policy) {
  const next = {
    ...policy,
    version: policy.version || 1,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(POLICY_PATH, JSON.stringify(next, null, 2));
  return next;
}

/** Copy platform policy into a project workspace for Strategy / Automation runs. */
export function snapshotPolicyToProject(projectRoot) {
  const policy = loadPlatformPolicy();
  const outPath = join(projectRoot, 'runtime/automation-policy.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify({ ...policy, snapshotAt: new Date().toISOString(), source: 'platform' }, null, 2));
  return outPath;
}
