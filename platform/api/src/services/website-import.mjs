import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { importWebsiteToIntake } from '../../../../runtime/analysis/website-import.mjs';
import { patchIntake, readIntake, buildIntakeResponse } from './intake-store.mjs';

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function importWebsiteForProject(projectRoot, { url, force = false } = {}) {
  const intake = readIntake(projectRoot);
  if (!intake) throw httpError('Intake not found', 404);

  const siteUrl = (url || intake.product?.url || '').trim();
  if (!siteUrl) throw httpError('Provide a website URL or save product.url first', 400);

  const { patch, imported, scan } = await importWebsiteToIntake(siteUrl, intake, { force });

  if (!imported.length) {
    return {
      ok: true,
      message: 'No new fields to import — existing values kept.',
      imported: [],
      intake,
      scan: { siteUrl: scan.siteUrl, confidence: scan.confidence },
    };
  }

  let merged = patchIntake(projectRoot, patch);

  const analysisDir = join(projectRoot, 'intake/analysis');
  mkdirSync(analysisDir, { recursive: true });
  writeFileSync(join(analysisDir, 'existing-marketing.json'), JSON.stringify({
    ...scan,
    userDeclared: {
      hasActiveMarketing: merged.existingMarketing?.hasActiveMarketing ?? null,
      userSummary: merged.existingMarketing?.userSummary || '',
      channelsUserDeclared: merged.existingMarketing?.channelsUserDeclared || [],
    },
    importedAt: new Date().toISOString(),
    importedFields: imported,
  }, null, 2));

  const items = merged.materials?.items || [];
  const hasUrlMaterial = items.some((m) => m.type === 'url' && m.uri === siteUrl);
  if (!hasUrlMaterial && items.length < 50) {
    merged = patchIntake(projectRoot, {
      materials: {
        items: [...items, {
          id: `mat_${Date.now()}_site`,
          type: 'url',
          title: merged.product?.name || siteUrl,
          source: 'url',
          uri: siteUrl,
          uploadedAt: new Date().toISOString(),
          analysisStatus: 'pending',
          analysisSummary: 'Imported from product URL',
        }],
      },
    });
  }

  const response = buildIntakeResponse(projectRoot);
  return {
    ok: true,
    message: `Imported ${imported.length} field(s) from ${scan.siteUrl}`,
    imported,
    scan: {
      siteUrl: scan.siteUrl,
      confidence: scan.confidence,
      socialLinksFound: scan.passiveScan?.socialLinksFound || [],
      tags: scan.passiveScan?.tags || {},
    },
    intake: response.intake,
    summary: response.summary,
  };
}
