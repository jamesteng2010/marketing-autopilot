import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { validateIntakeForAnalysis } from '../../../../runtime/analysis/validate-intake.mjs';

const PATCHABLE_BLOCKS = [
  'identity', 'product', 'audience', 'goals', 'productData',
  'marketing', 'assets', 'existingMarketing', 'runtime',
];

export function intakePath(projectRoot) {
  return join(projectRoot, 'intake/active.json');
}

export function readIntake(projectRoot) {
  const p = intakePath(projectRoot);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

export function writeIntake(projectRoot, data) {
  const p = intakePath(projectRoot);
  mkdirSync(dirname(p), { recursive: true });
  const next = { ...data, updatedAt: new Date().toISOString() };
  writeFileSync(p, JSON.stringify(next, null, 2));
  return next;
}

export function patchIntake(projectRoot, patch) {
  const current = readIntake(projectRoot);
  if (!current) {
    const err = new Error('Intake not found');
    err.status = 404;
    throw err;
  }
  const next = { ...current, updatedAt: new Date().toISOString() };
  for (const key of PATCHABLE_BLOCKS) {
    if (patch[key] !== undefined) {
      next[key] = { ...(current[key] || {}), ...patch[key] };
    }
  }
  writeFileSync(intakePath(projectRoot), JSON.stringify(next, null, 2));
  return next;
}

export function readIntakeSummary(projectRoot) {
  const intake = readIntake(projectRoot);
  if (!intake) return {};
  const validation = validateIntakeForAnalysis(intake);
  const requiredFields = [
    'product.name', 'product.url', 'audience.primary', 'audience.geographyRegions',
    'existingMarketing.hasActiveMarketing',
  ];
  let filled = 0;
  const missing = [];
  for (const field of requiredFields) {
    const val = field.split('.').reduce((o, k) => o?.[k], intake);
    const ok = field === 'audience.geographyRegions'
      ? Array.isArray(val) && val.length > 0
      : val !== null && val !== undefined && String(val).trim?.() !== '' && val !== '';
    if (ok) filled += 1;
    else missing.push(field);
  }
  return {
    productName: intake.product?.name || '',
    analysisRequested: Boolean(intake.materials?.analysisRequestedAt),
    analysisCompleted: Boolean(intake.materials?.analysisCompletedAt),
    userConfirmedAnalysis: Boolean(intake.materials?.userConfirmedAnalysis),
    userConfirmedGoals: Boolean(intake.goals?.userConfirmedGoals),
    materialCount: intake.materials?.items?.length || 0,
    readyForAnalysis: validation.ok,
    validationErrors: validation.errors || [],
    completenessPercent: Math.round((filled / requiredFields.length) * 100),
    missingFields: missing,
  };
}

export function buildIntakeResponse(projectRoot) {
  const intake = readIntake(projectRoot);
  if (!intake) {
    const err = new Error('Intake not found');
    err.status = 404;
    throw err;
  }
  const validation = validateIntakeForAnalysis(intake);
  const summary = readIntakeSummary(projectRoot);
  return { intake, validation, summary };
}

export function readAnalysisFile(projectRoot, rel) {
  const p = join(projectRoot, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
}

export function readAnalysisJson(projectRoot, rel) {
  const p = join(projectRoot, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}
