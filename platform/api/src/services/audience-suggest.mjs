import { inferAudienceWithAi } from '../../../../runtime/analysis/infer-audience.mjs';
import { patchIntake, readIntake, buildIntakeResponse } from './intake-store.mjs';

function isEmpty(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

export async function suggestAudienceForProject(projectRoot, { force = false } = {}) {
  const intake = readIntake(projectRoot);
  if (!intake) {
    const err = new Error('Intake not found');
    err.status = 404;
    throw err;
  }

  const inference = await inferAudienceWithAi({ product: intake.product || {} });
  if (!inference.primary) {
    return {
      ok: true,
      message: 'Not enough product information yet. Add a URL, name, or description first.',
      suggested: null,
      intake,
      summary: buildIntakeResponse(projectRoot).summary,
    };
  }

  const patch = { audience: {} };
  const imported = [];

  if (force || isEmpty(intake.audience?.primary)) {
    patch.audience.primary = inference.primary;
    patch.audience.primarySource = inference.method === 'openai' ? 'ai_suggested' : 'product_inferred';
    patch.audience.primaryInference = {
      method: inference.method,
      confidence: inference.confidence,
      suggestedAt: inference.suggestedAt || new Date().toISOString(),
    };
    imported.push('audience.primary');
  }

  if (inference.painPoints?.length && (force || isEmpty(intake.audience?.painPoints))) {
    patch.audience.painPoints = inference.painPoints;
    imported.push('audience.painPoints');
  }

  if (!imported.length) {
    return {
      ok: true,
      message: 'Audience fields already filled. Use force=true to replace suggestions.',
      suggested: inference,
      intake,
      summary: buildIntakeResponse(projectRoot).summary,
    };
  }

  patchIntake(projectRoot, patch);
  const response = buildIntakeResponse(projectRoot);

  return {
    ok: true,
    message: `Suggested audience from ${inference.method === 'openai' ? 'AI analysis' : 'product copy'}. Edit any field if needed.`,
    imported,
    suggested: inference,
    intake: response.intake,
    summary: response.summary,
  };
}
