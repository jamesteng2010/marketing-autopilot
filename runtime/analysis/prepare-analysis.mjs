/**
 * Automation 05 — Phase A: validate intake, passive site scan, activity, trigger Cursor webhook.
 * Phase B: Cursor Agent completes LLM analysis per automations/instructions/05-intake-analysis.txt
 */
import { loadAndValidateIntakeForAnalysis } from './validate-intake.mjs';
import { runSiteScanForProject } from './site-scan.mjs';
import { logActivity, readProjectJson, writeProjectJson } from '../campaign-lib/helpers.mjs';

const AUTOMATION_NAME = '05-intake-analysis';

export async function prepareIntakeAnalysis(options = {}) {
  const correlationId = options.correlationId || process.env.CORRELATION_ID || `analysis_${Date.now()}`;
  const userId = options.userId || process.env.USER_ID || 'local';
  const projectId = options.projectId || process.env.PROJECT_ID || 'local';

  const { intake, ok, errors } = loadAndValidateIntakeForAnalysis();
  if (!ok) {
    const err = new Error(`Intake validation failed: ${errors.join('; ')}`);
    err.code = 'INTAKE_INVALID';
    err.details = errors;
    throw err;
  }

  logActivity({
    type: 'automation.run_started',
    category: 'automation.execution',
    actorId: AUTOMATION_NAME,
    source: 'automation',
    summary: 'Intake Analysis prepare started (site scan)',
    payload: { automationName: AUTOMATION_NAME, userId, projectId },
    correlationId,
  });

  logActivity({
    type: 'analysis.started',
    category: 'automation.analysis',
    actorId: AUTOMATION_NAME,
    source: 'automation',
    summary: `Analyzing intake for ${intake.product.name}`,
    payload: { productName: intake.product.name, siteUrl: intake.product.url },
    correlationId,
  });

  let scanResult;
  try {
    scanResult = await runSiteScanForProject();
  } catch (e) {
    logActivity({
      type: 'automation.run_failed',
      category: 'automation.execution',
      actorId: AUTOMATION_NAME,
      source: 'automation',
      summary: `Site scan failed: ${e.message}`,
      payload: { errorSummary: e.message },
      correlationId,
    });
    throw e;
  }

  logActivity({
    type: 'analysis.site_scan_completed',
    category: 'automation.analysis',
    actorId: AUTOMATION_NAME,
    source: 'automation',
    summary: `Scanned ${scanResult.siteUrl} — GA4: ${scanResult.passiveScan?.tags?.ga4MeasurementId || 'none'}`,
    payload: {
      siteUrl: scanResult.siteUrl,
      ga4: scanResult.passiveScan?.tags?.ga4MeasurementId,
      social: scanResult.passiveScan?.socialLinksFound,
    },
    correlationId,
  });

  const intakeUpdated = readProjectJson('intake/active.json');
  intakeUpdated.materials = intakeUpdated.materials || { items: [] };
  intakeUpdated.materials.analysisRequestedAt = new Date().toISOString();
  writeProjectJson('intake/active.json', intakeUpdated);

  const webhookUrl = options.webhookUrl || process.env.CURSOR_AUTOMATION_05_WEBHOOK_URL;
  let webhookResult = null;
  if (webhookUrl) {
    webhookResult = await triggerAnalysisWebhook(webhookUrl, {
      userId,
      projectId,
      workspaceRoot: process.env.PROJECT_ROOT || process.cwd(),
      correlationId,
    });
  }

  logActivity({
    type: 'automation.run_completed',
    category: 'automation.execution',
    actorId: AUTOMATION_NAME,
    source: 'automation',
    summary: webhookUrl
      ? 'Prepare complete — Cursor Analysis webhook invoked'
      : 'Prepare complete — run Cursor Automation 05 for LLM feasibility',
    payload: { phase: 'prepare', webhookInvoked: Boolean(webhookUrl) },
    correlationId,
  });

  return {
    ok: true,
    correlationId,
    scan: scanResult,
    webhook: webhookResult,
    nextStep: webhookUrl
      ? 'Wait for Cursor Automation 05 to finish feasibility.md'
      : 'Run Cursor Automation 05 manually (automations/instructions/05-intake-analysis.txt)',
  };
}

async function triggerAnalysisWebhook(webhookUrl, payload) {
  const body = {
    ...payload,
    automationName: AUTOMATION_NAME,
    env: {
      PROJECT_ROOT: payload.workspaceRoot,
      USER_ID: payload.userId,
      PROJECT_ID: payload.projectId,
      CORRELATION_ID: payload.correlationId,
    },
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Webhook ${res.status}: ${text.slice(0, 200)}`);
  }
  return { status: res.status, invoked: true };
}

const isCli = process.argv[1]?.includes('prepare-analysis.mjs');
if (isCli) {
  prepareIntakeAnalysis()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(JSON.stringify({ ok: false, code: err.code, error: err.message, details: err.details }, null, 2));
      process.exit(1);
    });
}
