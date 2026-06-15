import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** Package project intake + scan for webhook / LLM analysis (Phase B). */
export function buildIntakeBundle(projectRoot) {
  const intake = readJson(join(projectRoot, 'intake/active.json')) || {};
  const existingMarketing = readJson(join(projectRoot, 'intake/analysis/existing-marketing.json'));
  const policy = readJson(join(projectRoot, 'runtime/automation-policy.json'));
  const materials = (intake.materials?.items || []).map((m) => ({
    id: m.id,
    type: m.type,
    title: m.title,
    uri: m.uri,
    analysisStatus: m.analysisStatus,
    analysisSummary: m.analysisSummary,
  }));

  return {
    builtAt: new Date().toISOString(),
    product: intake.product,
    audience: intake.audience,
    existingMarketing: {
      hasActiveMarketing: intake.existingMarketing?.hasActiveMarketing,
      activities: intake.existingMarketing?.activities || [],
      userSummary: intake.existingMarketing?.userSummary || '',
      discovery: intake.existingMarketing?.discovery,
    },
    existingMarketingAnalysis: existingMarketing,
    materials,
    marketing: {
      brandTone: intake.marketing?.brandTone,
      complianceNotes: intake.marketing?.complianceNotes,
    },
    automationPolicy: policy,
  };
}
