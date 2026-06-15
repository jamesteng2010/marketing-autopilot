import { verifyToken } from '../services/auth.mjs';
import { getProjectById } from '../services/projects.mjs';

export function requireAuth(authHeader) {
  return verifyToken(authHeader);
}

export async function requireProject(auth, projectId) {
  const project = await getProjectById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  if (project.userId !== auth.userId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return project;
}
