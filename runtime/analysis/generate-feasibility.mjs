import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIntakeBundle } from './build-intake-bundle.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function loadTemplate(name) {
  return readFileSync(join(REPO_ROOT, 'intake/analysis', name), 'utf8');
}

function loadCatalogSummary() {
  const regions = JSON.parse(readFileSync(join(REPO_ROOT, 'runtime/regions-catalog.json'), 'utf8'));
  const methods = JSON.parse(readFileSync(join(REPO_ROOT, 'runtime/marketing-methods-catalog.json'), 'utf8'));
  const regionCodes = Object.keys(regions.regions || {}).slice(0, 12);
  const methodIds = (methods.categories || [])
    .flatMap((c) => (c.methods || []).map((m) => m.id))
    .slice(0, 40);
  return { regionCodes, methodIds };
}

export async function generateFeasibilityAnalysis(projectRoot, { bundle, engine, fallbackFrom, fallbackReason } = {}) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { ok: false, skipped: true, reason: 'OPENAI_API_KEY not set' };
  }

  const intakeBundle = bundle || buildIntakeBundle(projectRoot);
  const feasibilityTemplate = loadTemplate('feasibility.template.md');
  const extractedTemplate = loadTemplate('extracted.template.json');
  const catalogHint = loadCatalogSummary();

  const system = `You are Marketing Autopilot intake analyst. Produce feasibility analysis from intake data.
Return JSON only:
{
  "feasibilityMarkdown": "full markdown following the template sections",
  "extracted": { ...matching extracted.template structure... }
}
Rules:
- English for user-facing text unless intake is clearly Chinese-only
- Use real data from bundle; do not invent URLs or metrics
- existingMarketingBaseline with continue/fix/add arrays
- methodFeasibility for audience regions
- Do NOT set userConfirmedAnalysis
- Honest about gaps and low confidence when scan is empty`;

  const user = JSON.stringify({
    template: feasibilityTemplate.slice(0, 4000),
    extractedSchema: extractedTemplate,
    catalogHint,
    intakeBundle,
  }).slice(0, 28000);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  const feasibilityMarkdown = String(parsed.feasibilityMarkdown || '').trim();
  const extracted = parsed.extracted || {};

  if (!feasibilityMarkdown) {
    throw new Error('OpenAI returned empty feasibilityMarkdown');
  }

  const analysisDir = join(projectRoot, 'intake/analysis');
  mkdirSync(analysisDir, { recursive: true });
  writeFileSync(join(analysisDir, 'feasibility.md'), `${feasibilityMarkdown}\n`);
  writeFileSync(join(analysisDir, 'extracted.json'), JSON.stringify(extracted, null, 2));

  const intakePath = join(projectRoot, 'intake/active.json');
  if (existsSync(intakePath)) {
    const intake = JSON.parse(readFileSync(intakePath, 'utf8'));
    intake.materials = intake.materials || { items: [] };
    intake.materials.analysisCompletedAt = new Date().toISOString();
    intake.materials.analysisEngine = engine || 'openai';
    if (fallbackFrom) {
      intake.materials.analysisFallbackFrom = fallbackFrom;
      intake.materials.analysisFallbackReason = fallbackReason || null;
    }
    writeFileSync(intakePath, JSON.stringify(intake, null, 2));
  }

  return {
    ok: true,
    engine: engine || 'openai',
    feasibilityPath: join(analysisDir, 'feasibility.md'),
    extractedPath: join(analysisDir, 'extracted.json'),
  };
}
