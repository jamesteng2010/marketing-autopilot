import { inferAudienceHeuristic, inferAudienceFromIntake } from '../../../runtime/analysis/infer-audience.mjs';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (e) {
    failed += 1;
    console.error(`✗ ${name}: ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

test('Kids Guard style parental safety', () => {
  const corpus = 'Kids Guard helps parents monitor screen time and keep children safe online.';
  const r = inferAudienceHeuristic(corpus);
  assert(r.primary.toLowerCase().includes('parent'), r.primary);
  assert(r.painPoints.length >= 2);
});

test('explicit "for" phrase wins', () => {
  const corpus = 'Acme — built for solo founders who ship without a marketing team.';
  const r = inferAudienceHeuristic(corpus);
  assert(r.primary.toLowerCase().includes('solo founder'), r.primary);
  assert(r.method === 'explicit_phrase');
});

test('developer SaaS vertical', () => {
  const corpus = 'Marketing Autopilot\nAI-driven marketing for indie developers and small teams using GitHub.';
  const r = inferAudienceFromIntake({
    product: { name: 'Marketing Autopilot', description: corpus },
  });
  assert(r.primary.length > 10, r.primary);
  assert(['vertical_rules', 'explicit_phrase', 'heuristic', 'openai'].includes(r.method) || r.confidence !== 'none');
});

test('empty corpus returns empty', () => {
  const r = inferAudienceHeuristic('');
  assert(r.primary === '');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
