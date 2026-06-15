/**
 * Validate intake/active.json has minimum fields required before Analysis (05).
 */
import { readProjectJson } from '../campaign-lib/helpers.mjs';

export function validateIntakeForAnalysis(intake) {
  const errors = [];
  if (!intake) {
    return { ok: false, errors: ['intake/active.json not found'] };
  }
  if (!intake.product?.name?.trim()) errors.push('product.name is required');
  const url = intake.product?.url?.trim();
  if (!url) errors.push('product.url is required');
  else if (!/^https?:\/\//i.test(url)) errors.push('product.url must be http(s)');
  if (!intake.audience?.primary?.trim()) errors.push('audience.primary is required');
  const regions = intake.audience?.geographyRegions || intake.audience?.geography || [];
  if (!Array.isArray(regions) || regions.length === 0) {
    errors.push('audience.geographyRegions requires at least one region');
  }
  if (intake.existingMarketing?.hasActiveMarketing === null || intake.existingMarketing?.hasActiveMarketing === undefined) {
    errors.push('existingMarketing.hasActiveMarketing must be answered (true/false)');
  }
  if (intake.existingMarketing?.hasActiveMarketing === true) {
    const acts = intake.existingMarketing?.activities || [];
    if (!acts.length) {
      errors.push('existingMarketing.activities requires at least one record when marketing is active');
    } else {
      for (const a of acts) {
        if (!a.platform?.trim()) errors.push('Each marketing activity needs a platform');
        if (!a.summary?.trim()) errors.push('Each marketing activity needs a description of what was done');
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

export function loadAndValidateIntakeForAnalysis() {
  const intake = readProjectJson('intake/active.json');
  return { intake, ...validateIntakeForAnalysis(intake) };
}
