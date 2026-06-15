/**
 * Auth API integration tests
 *   API_BASE=https://api.myreceipt.website node test/auth.test.mjs
 *
 * Set SKIP_EMAIL_TESTS=1 to avoid sending real verification emails (used on deploy).
 */
const BASE = process.env.API_BASE || 'http://127.0.0.1:3002';
const SKIP_EMAIL = process.env.SKIP_EMAIL_TESTS === '1' || process.env.SKIP_EMAIL_TESTS === 'true';
const testEmail = process.env.TEST_EMAIL || `ci-test-${Date.now()}@myreceipt.website`;
const testPassword = process.env.TEST_PASSWORD || 'TestPass123!';

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
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

console.log(`Testing auth at ${BASE}${SKIP_EMAIL ? ' (no email sends)' : ''}\n`);

await test('health', async () => {
  const { res, data } = await jsonFetch('/health');
  assert(res.ok && data.auth === true);
});

if (!SKIP_EMAIL) {
  await test('register (no token until verified)', async () => {
    const { res, data } = await jsonFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: testPassword, displayName: 'Test' }),
    });
    assert(res.status === 201, data.error);
    assert(!data.token, 'must not return JWT before verification');
    assert(data.emailSent === true, `verification email not sent: ${JSON.stringify(data)}`);
  });

  await test('login before verify returns 403', async () => {
    const { res } = await jsonFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert(res.status === 403);
  });

  await test('forgot password', async () => {
    const { res, data } = await jsonFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail }),
    });
    assert(res.ok, data.error);
  });

  await test('duplicate register returns 409', async () => {
    const { res } = await jsonFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert(res.status === 409);
  });
} else {
  console.log('⊘ skip register / forgot-password (SKIP_EMAIL_TESTS)');
}

await test('me without token returns 401', async () => {
  const { res } = await jsonFetch('/api/auth/me');
  assert(res.status === 401);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
