import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

/**
 * Resolve project workspace path.
 * - WORKSPACE_ROOT set: {WORKSPACE_ROOT}/{userId}/projects/{projectId}
 * - else: {repo}/projects/{projectId} (dogfood layout)
 */
export function resolveProjectRoot({ userId, projectId }) {
  const workspaceRoot = process.env.WORKSPACE_ROOT;
  if (workspaceRoot) {
    return join(workspaceRoot, userId, 'projects', projectId);
  }
  return join(REPO_ROOT, 'projects', projectId);
}
