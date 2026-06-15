import { randomBytes } from 'node:crypto';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { readIntake, writeIntake } from './intake-store.mjs';

const MAX_ITEMS = 50;
const MAX_FILE_MB = 10;

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function newMaterialId() {
  return `mat_${Date.now()}_${randomBytes(4).toString('hex')}`;
}

function extFromMime(mime) {
  const map = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
    'application/pdf': '.pdf', 'text/plain': '.txt',
    'video/mp4': '.mp4', 'audio/mpeg': '.mp3',
  };
  return map[mime] || extname(mime) || '.bin';
}

export function addMaterial(projectRoot, body) {
  const intake = readIntake(projectRoot);
  if (!intake) throw httpError('Intake not found', 404);

  const items = intake.materials?.items || [];
  if (items.length >= MAX_ITEMS) throw httpError('Maximum 50 materials per project', 400);

  const { type, title, source } = body;
  if (!type || !title?.trim()) throw httpError('type and title are required', 400);

  const id = newMaterialId();
  const now = new Date().toISOString();
  let uri = '';
  let mimeType = body.mimeType || null;

  if (type === 'text') {
    const text = body.text?.trim();
    if (!text) throw httpError('text content is required', 400);
    const dir = join(projectRoot, 'materials', id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'original.txt'), text, 'utf8');
    uri = `materials/${id}/original.txt`;
    mimeType = 'text/plain';
  } else if (type === 'url') {
    const url = body.url?.trim();
    if (!url || !/^https?:\/\//i.test(url)) throw httpError('Valid http(s) url is required', 400);
    uri = url;
  } else if (['image', 'video', 'audio', 'document', 'spreadsheet'].includes(type)) {
    const b64 = body.contentBase64;
    if (!b64) throw httpError('contentBase64 is required for file uploads', 400);
    const buf = Buffer.from(b64, 'base64');
    if (buf.length > MAX_FILE_MB * 1024 * 1024) {
      throw httpError(`File exceeds ${MAX_FILE_MB}MB limit`, 400);
    }
    const ext = body.filename ? extname(body.filename) : extFromMime(mimeType || 'application/octet-stream');
    const dir = join(projectRoot, 'materials', id);
    mkdirSync(dir, { recursive: true });
    const filename = `original${ext || '.bin'}`;
    writeFileSync(join(dir, filename), buf);
    uri = `materials/${id}/${filename}`;
    writeFileSync(join(dir, 'meta.json'), JSON.stringify({ title, mimeType, uploadedAt: now }, null, 2));
  } else {
    throw httpError(`Unsupported material type: ${type}`, 400);
  }

  const item = {
    id,
    type,
    title: title.trim(),
    source: source || (type === 'url' ? 'url' : type === 'text' ? 'paste' : 'upload'),
    uri,
    mimeType,
    uploadedAt: now,
    analysisStatus: 'pending',
    analysisSummary: null,
  };

  intake.materials = intake.materials || { items: [] };
  intake.materials.items = [...items, item];
  writeIntake(projectRoot, intake);
  return item;
}

export function deleteMaterial(projectRoot, materialId) {
  const intake = readIntake(projectRoot);
  if (!intake) throw httpError('Intake not found', 404);

  const items = intake.materials?.items || [];
  const idx = items.findIndex((m) => m.id === materialId);
  if (idx < 0) throw httpError('Material not found', 404);

  const dir = join(projectRoot, 'materials', materialId);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });

  intake.materials.items = items.filter((m) => m.id !== materialId);
  writeIntake(projectRoot, intake);
  return { ok: true, deletedId: materialId };
}
