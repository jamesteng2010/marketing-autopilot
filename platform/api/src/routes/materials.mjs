import { json } from '../lib/http.mjs';
import { requireAuth, requireProject } from '../middleware/project-auth.mjs';
import { resolveProjectRoot } from '../services/workspace.mjs';
import { addMaterial, deleteMaterial } from '../services/materials.mjs';

export async function handleAddMaterial(res, authHeader, projectId, body) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const item = addMaterial(root, body);
  json(res, 201, { material: item });
}

export async function handleDeleteMaterial(res, authHeader, projectId, materialId) {
  const auth = requireAuth(authHeader);
  await requireProject(auth, projectId);
  const root = resolveProjectRoot({ userId: auth.userId, projectId });
  const result = deleteMaterial(root, materialId);
  json(res, 200, result);
}
