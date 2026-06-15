import { json } from '../lib/http.mjs';
import { requireAuth } from '../middleware/project-auth.mjs';
import { createProject, listProjects, getProjectDetail, updateProject } from '../services/projects.mjs';

export async function handleListProjects(res, authHeader) {
  const auth = requireAuth(authHeader);
  const projects = await listProjects(auth.userId);
  json(res, 200, { projects });
}

export async function handleCreateProject(res, authHeader, body) {
  const auth = requireAuth(authHeader);
  const project = await createProject(auth.userId, body);
  json(res, 201, project);
}

export async function handleGetProject(res, authHeader, projectId) {
  const auth = requireAuth(authHeader);
  const project = await getProjectDetail(auth.userId, projectId);
  if (!project) {
    json(res, 404, { error: 'Project not found' });
    return;
  }
  json(res, 200, { project });
}

export async function handlePatchProject(res, authHeader, projectId, body) {
  const auth = requireAuth(authHeader);
  const project = await updateProject(auth.userId, projectId, body);
  json(res, 200, { project });
}
