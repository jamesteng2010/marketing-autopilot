/**
 * Automation 05 — Phase A: validate intake, passive site scan, activity, trigger Cursor webhook.
 * Phase B: Cursor Agent completes LLM analysis per automations/instructions/05-intake-analysis.txt
 */
import { loadAndValidateIntakeForAnalysis } from './validate-intake.mjs';
import { runSiteScanForProject } from './site-scan.mjs';
import { buildIntakeBundle } from './build-intake-bundle.mjs';
import { generateFeasibilityAnalysis } from './generate-feasibility.mjs';
import { logActivity, readProjectJson, writeProjectJson } from '../campaign-lib/helpers.mjs';

const AUTOMATION_NAME = '05-intake-analysis';

function recordAnalysisFailure(reason, code) {
  try {
    const intakeUpdated = readProjectJson('intake/active.json');
    intakeUpdated.materials = intakeUpdated.materials || { items: [] };
    intakeUpdated.materials.analysisFailedAt = new Date().toISOString();
    intakeUpdated.materials.analysisErrorSummary = reason;
    intakeUpdated.materials.analysisErrorCode = code || null;
    writeProjectJson('intake/active.json', intakeUpdated);
  } catch {
    /* ignore */
  }
}

function clearAnalysisFailure() {
  try {
    const intakeUpdated = readProjectJson('intake/active.json');
    if (!intakeUpdated.materials) return;
    intakeUpdated.materials.analysisFailedAt = null;
    intakeUpdated.materials.analysisErrorSummary = null;
    intakeUpdated.materials.analysisErrorCode = null;
    writeProjectJson('intake/active.json', intakeUpdated);
  } catch {
    /* ignore */
  }
}

function enrichCursorFailure(err, { fallbackOpenAi, openaiKey }) {
  recordAnalysisFailure(err.message, err.code);
  if (fallbackOpenAi && !openaiKey) {
    err.userHint =
      'OpenAI fallback is not configured on the server (OPENAI_API_KEY). Add it to secrets.local.env and redeploy, or wait for Cursor quota to reset at cursor.com/settings.';
    err.fallbackAvailable = false;
  }
  return err;
}

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
  intakeUpdated.materials.lastAnalysisCorrelationId = correlationId;
  writeProjectJson('intake/active.json', intakeUpdated);

  const projectRoot = process.env.PROJECT_ROOT || process.cwd();
  try {
    const { snapshotPolicyToProject, loadPlatformPolicy } = await import('../automation-policy.mjs');
    snapshotPolicyToProject(projectRoot);
    const policy = loadPlatformPolicy();
    intakeUpdated.marketing = intakeUpdated.marketing || {};
    if (!intakeUpdated.marketing.complianceNotes?.trim() && policy.complianceNotes) {
      intakeUpdated.marketing.complianceNotes = policy.complianceNotes;
      intakeUpdated.marketing.complianceSource = 'platform_policy';
    }
    if (!intakeUpdated.marketing.brandTone && policy.defaultBrandTone) {
      intakeUpdated.marketing.brandTone = policy.defaultBrandTone;
    }
    writeProjectJson('intake/active.json', intakeUpdated);
  } catch (e) {
    console.warn('[prepare-analysis] policy snapshot failed:', e.message);
  }

  const webhookUrl = options.webhookUrl || process.env.CURSOR_AUTOMATION_05_WEBHOOK_URL;
  const intakeBundle = buildIntakeBundle(projectRoot);
  const analysisEngine = (process.env.ANALYSIS_ENGINE || 'auto').toLowerCase();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const fallbackOpenAi = analysisEngine === 'auto' || analysisEngine === 'cursor_first';

  let phaseB = null;
  let webhookResult = null;
  let fallback = null;

  if (analysisEngine === 'openai') {
    phaseB = await runOpenAiPhaseB(projectRoot, intakeBundle, correlationId, { engine: 'openai' });
    if (!phaseB?.ok) {
      const err = new Error(phaseB?.reason || 'OPENAI_API_KEY not set');
      err.code = 'ANALYSIS_NOT_CONFIGURED';
      throw err;
    }
  } else if (webhookUrl) {
    try {
      const appPublicUrl = (process.env.APP_PUBLIC_URL || 'https://api.myreceipt.website').replace(/\/$/, '');
      webhookResult = await triggerAnalysisWebhook(webhookUrl, {
        userId,
        projectId,
        workspaceRoot: projectRoot,
        correlationId,
        intakeBundle,
        callbackUrl: `${appPublicUrl}/api/internal/automation/callback`,
      });
      clearAnalysisFailure();
      logActivity({
        type: 'analysis.webhook_invoked',
        category: 'automation.analysis',
        actorId: AUTOMATION_NAME,
        source: 'automation',
        summary: 'Cursor Automation 05 webhook invoked',
        payload: { webhookStatus: webhookResult.status },
        correlationId,
      });
    } catch (e) {
      logActivity({
        type: 'analysis.webhook_failed',
        category: 'automation.analysis',
        actorId: AUTOMATION_NAME,
        source: 'automation',
        summary: `Cursor webhook failed: ${e.message}`,
        payload: { code: e.code, errorSummary: e.message },
        correlationId,
      });
      if (!fallbackOpenAi || !openaiKey) throw enrichCursorFailure(e, { fallbackOpenAi, openaiKey });
      console.warn('[prepare-analysis] Cursor failed, falling back to OpenAI:', e.message);
      try {
        phaseB = await runOpenAiPhaseB(projectRoot, intakeBundle, correlationId, {
          engine: 'openai-fallback',
          fallbackFrom: 'cursor',
          fallbackReason: e.message,
        });
        if (!phaseB?.ok) throw new Error(phaseB?.reason || 'OpenAI fallback unavailable');
        fallback = { from: 'cursor', reason: e.message, code: e.code || null };
      } catch (openAiErr) {
        recordAnalysisFailure(
          `Cursor failed (${e.message}). OpenAI fallback failed (${openAiErr.message}).`,
          'ANALYSIS_FAILED',
        );
        const err = new Error(
          `Cursor failed (${e.message}). OpenAI fallback also failed (${openAiErr.message}).`,
        );
        err.code = 'ANALYSIS_FAILED';
        throw err;
      }
    }
  } else if (openaiKey) {
    phaseB = await runOpenAiPhaseB(projectRoot, intakeBundle, correlationId, { engine: 'openai' });
  } else {
    const err = new Error(
      'Set CURSOR_AUTOMATION_05_WEBHOOK_URL and/or OPENAI_API_KEY (ANALYSIS_ENGINE=auto tries Cursor first)',
    );
    err.code = 'ANALYSIS_NOT_CONFIGURED';
    throw err;
  }

  const usedEngine = phaseB?.ok
    ? phaseB.engine
    : webhookResult?.invoked
      ? 'cursor-automation-05'
      : null;

  logActivity({
    type: 'automation.run_completed',
    category: 'automation.execution',
    actorId: AUTOMATION_NAME,
    source: 'automation',
    summary: phaseB?.ok
      ? `Prepare complete — feasibility via ${phaseB.engine}`
      : webhookResult?.invoked
        ? 'Prepare complete — Cursor Analysis webhook invoked'
        : 'Prepare complete',
    payload: {
      phase: 'prepare',
      webhookInvoked: Boolean(webhookResult?.invoked),
      engine: usedEngine,
      fallback: fallback || null,
    },
    correlationId,
  });

  return {
    ok: true,
    correlationId,
    scan: scanResult,
    phaseB,
    webhook: webhookResult,
    fallback,
    engine: usedEngine,
    nextStep: phaseB?.ok
      ? fallback
        ? 'Cursor unavailable — feasibility report generated via OpenAI fallback'
        : 'Review feasibility report in Analysis'
      : webhookResult?.invoked
        ? 'Cursor Automation is generating your report — open Analysis to watch progress'
        : 'Configure CURSOR_AUTOMATION_05_WEBHOOK_URL or OPENAI_API_KEY',
  };
}

async function runOpenAiPhaseB(projectRoot, intakeBundle, correlationId, meta = {}) {
  const result = await generateFeasibilityAnalysis(projectRoot, {
    bundle: intakeBundle,
    engine: meta.engine || 'openai',
    fallbackFrom: meta.fallbackFrom,
    fallbackReason: meta.fallbackReason,
  });
  if (!result.ok) return result;

  logActivity({
    type: 'analysis.completed',
    category: 'automation.analysis',
    actorId: AUTOMATION_NAME,
    source: 'automation',
    summary: meta.fallbackFrom
      ? 'Feasibility report generated (OpenAI fallback after Cursor failed)'
      : 'Feasibility report generated (OpenAI on server)',
    payload: {
      engine: result.engine,
      fallbackFrom: meta.fallbackFrom || null,
      fallbackReason: meta.fallbackReason || null,
    },
    correlationId,
  });
  return result;
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
  const bearer = process.env.CURSOR_AUTOMATION_05_BEARER_TOKEN?.trim()
    || process.env.CURSOR_AUTOMATION_05_AUTH_HEADER?.replace(/^Bearer\s+/i, '').trim();
  const headers = { 'Content-Type': 'application/json' };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    const inner = parsed?.error || parsed?.message || text.slice(0, 300);
    const err = new Error(formatWebhookError(res.status, inner));
    if (String(inner).includes('resource_exhausted')) err.code = 'CURSOR_QUOTA_EXHAUSTED';
    else err.code = 'WEBHOOK_FAILED';
    throw err;
  }
  return { status: res.status, invoked: true };
}

function formatWebhookError(status, detail) {
  const msg = String(detail || '');
  if (msg.includes('resource_exhausted') || msg.includes('usage limit')) {
    return 'Cursor usage limit reached';
  }
  return `Cursor webhook failed (${status}): ${msg || 'unknown error'}`;
}

const isCli = process.argv[1]?.includes('prepare-analysis.mjs');
if (isCli) {
  prepareIntakeAnalysis()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.log(JSON.stringify({
        ok: false,
        code: err.code,
        error: err.message,
        userHint: err.userHint || null,
        fallbackAvailable: err.fallbackAvailable ?? null,
        details: err.details,
      }, null, 2));
      process.exit(1);
    });
}
