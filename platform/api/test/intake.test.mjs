/**
 * Intake API integration tests
 *   API_BASE=... TEST_EMAIL=... TEST_PASSWORD=... node test/intake.test.mjs
 */
const BASE = process.env.API_BASE || 'http://127.0.0.1:3002';
const EMAIL = process.env.TEST_EMAIL || 'jamesteng2010@gmail.com';
const PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';

let token;
let projectId;
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
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

async function jsonFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

console.log(`Testing intake at ${BASE}\n`);

await test('login', async () => {
  const { res, data } = await jsonFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) {
    console.log(`  (skip authenticated intake tests — login failed: ${data.error || res.status})`);
    console.log(`  Set TEST_EMAIL and TEST_PASSWORD env vars for full intake test.`);
    console.log(`\n${passed} passed, 0 failed (authenticated tests skipped)`);
    process.exit(0);
  }
  token = data.token;
});

await test('create project', async () => {
  const { res, data } = await jsonFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name: `Intake test ${Date.now()}` }),
  });
  assert(res.status === 201, data.error);
  projectId = data.projectId;
});

await test('patch intake', async () => {
  const { res, data } = await jsonFetch(`/api/projects/${projectId}/intake`, {
    method: 'PATCH',
    body: JSON.stringify({
      product: { name: 'Test Product', url: 'https://example.com', oneLiner: 'A test' },
      audience: { primary: 'Developers', geographyRegions: ['US'] },
      existingMarketing: { hasActiveMarketing: false },
    }),
  });
  assert(res.ok, data.error);
  assert(data.summary.readyForAnalysis, JSON.stringify(data.summary));
});

await test('add material url', async () => {
  const { res } = await jsonFetch(`/api/projects/${projectId}/materials`, {
    method: 'POST',
    body: JSON.stringify({ type: 'url', title: 'Example', url: 'https://example.com/docs', source: 'url' }),
  });
  assert(res.status === 201);
});

await test('get intake', async () => {
  const { res, data } = await jsonFetch(`/api/projects/${projectId}/intake`);
  assert(res.ok);
  assert(data.intake.materials.items.length >= 1);
});

await test('catalog recommendations', async () => {
  const { res, data } = await jsonFetch('/api/catalog/recommendations?regions=US');
  assert(res.ok);
  assert(data.recommendedMethods?.length > 0);
});

await test('request analyze prepare', async () => {
  const { res, data } = await jsonFetch(`/api/projects/${projectId}/intake/analyze`, {
    method: 'POST',
    body: '{}',
  });
  assert(res.status === 202, JSON.stringify(data));
});

await test('existing marketing after scan', async () => {
  const { res, data } = await jsonFetch(`/api/projects/${projectId}/analysis/existing-marketing`);
  assert(res.ok, data.error);
});

await test('feasibility status polling', async () => {
  const { res, data } = await jsonFetch(`/api/projects/${projectId}/analysis/feasibility`);
  assert(res.ok, data.error);
  assert(['running', 'ready', 'confirmed', 'not_started'].includes(data.status), data.status);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
