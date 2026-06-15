import { getPool } from '../db/pool.mjs';
import { provisionWorkspace, newProjectId } from './provision.mjs';
import { resolveProjectRoot } from './workspace.mjs';
import { readIntakeSummary } from './intake-store.mjs';

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function createProject(userId, { name }) {
  const trimmed = name?.trim();
  if (!trimmed) throw httpError('Project name is required', 400);

  const projectId = newProjectId();
  const workspaceUri = provisionWorkspace(userId, projectId);
  const pool = getPool();

  await pool.query(
    `INSERT INTO projects (project_id, user_id, name, status, workspace_uri)
     VALUES (?, ?, ?, 'active', ?)`,
    [projectId, userId, trimmed, workspaceUri],
  );

  return { projectId, name: trimmed, status: 'active', workspaceUri };
}

export async function listProjects(userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT project_id, name, status, created_at, updated_at
     FROM projects WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId],
  );
  return rows.map(toPublicProject);
}

export async function getProjectById(projectId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT project_id, user_id, name, status, workspace_uri, created_at, updated_at
     FROM projects WHERE project_id = ? LIMIT 1`,
    [projectId],
  );
  if (!rows[0]) return null;
  return toPublicProject(rows[0]);
}

export async function getProjectDetail(userId, projectId) {
  const project = await getProjectById(projectId);
  if (!project || project.userId !== userId) return null;

  const root = resolveProjectRoot({ userId, projectId });
  let summary = {};
  try {
    summary = readIntakeSummary(root);
  } catch {
    summary = {};
  }

  return { ...project, intakeSummary: summary };
}

export async function updateProject(userId, projectId, { name, status }) {
  const project = await getProjectById(projectId);
  if (!project || project.userId !== userId) throw httpError('Project not found', 404);

  const updates = [];
  const params = [];
  if (name?.trim()) {
    updates.push('name = ?');
    params.push(name.trim());
  }
  if (status === 'archived' || status === 'active') {
    updates.push('status = ?');
    params.push(status);
  }
  if (!updates.length) throw httpError('Nothing to update', 400);

  params.push(projectId);
  const pool = getPool();
  await pool.query(`UPDATE projects SET ${updates.join(', ')} WHERE project_id = ?`, params);
  return getProjectById(projectId);
}

function toPublicProject(row) {
  return {
    projectId: row.project_id,
    userId: row.user_id,
    name: row.name,
    status: row.status,
    workspaceUri: row.workspace_uri,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}
