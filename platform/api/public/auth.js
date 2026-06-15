const API = window.location.origin;
let mode = 'login';
let pendingEmail = '';

const panels = {
  auth: document.getElementById('panel-auth'),
  checkEmail: document.getElementById('panel-check-email'),
  forgot: document.getElementById('panel-forgot'),
  reset: document.getElementById('panel-reset'),
  verified: document.getElementById('panel-verified'),
};

function showPanel(name) {
  Object.values(panels).forEach((p) => p.classList.remove('active'));
  panels[name].classList.add('active');
  document.getElementById('tabs').classList.toggle('hidden', name !== 'auth');
}

function showMsg(el, type, text) {
  el.className = `msg show ${type}`;
  el.textContent = text;
}

function clearMsg(el) {
  el.className = 'msg';
  el.textContent = '';
}

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || res.statusText);
  return data;
}

function setAuthMode(m) {
  mode = m;
  document.getElementById('tab-login').classList.toggle('active', m === 'login');
  document.getElementById('tab-register').classList.toggle('active', m === 'register');
  document.getElementById('name-field').classList.toggle('hidden', m !== 'register');
  document.getElementById('forgot-row').classList.toggle('hidden', m !== 'login');
  document.getElementById('submit-auth').textContent = m === 'login' ? 'Sign in' : 'Create account';
  document.getElementById('password').autocomplete = m === 'login' ? 'current-password' : 'new-password';
  clearMsg(document.getElementById('msg-auth'));
}

document.getElementById('tab-login').onclick = () => setAuthMode('login');
document.getElementById('tab-register').onclick = () => setAuthMode('register');
document.getElementById('goto-forgot').onclick = () => showPanel('forgot');
document.getElementById('back-from-forgot').onclick = () => showPanel('auth');
document.getElementById('goto-signin-from-check').onclick = () => showPanel('auth');
document.getElementById('goto-signin-verified').onclick = () => showPanel('auth');

document.getElementById('form-auth').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-auth');
  const msgEl = document.getElementById('msg-auth');
  clearMsg(msgEl);
  btn.disabled = true;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  pendingEmail = email;

  try {
    if (mode === 'login') {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem('ma_token', data.token);
      showMsg(msgEl, 'ok', 'Signed in successfully. Redirecting…');
      setTimeout(() => { window.location.href = '/app'; }, 800);
    } else {
      const body = { email, password };
      const name = document.getElementById('displayName').value.trim();
      if (name) body.displayName = name;
      const data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
      document.getElementById('check-email-text').textContent = data.message ||
        `We sent a verification link to ${email}. Click it to activate your account, then sign in.`;
      showPanel('checkEmail');
      if (!data.emailSent) {
        showMsg(document.getElementById('msg-check'), 'info', 'Email delivery failed — try resend below, or check spam.');
      }
    }
  } catch (err) {
    if (mode === 'login' && err.message.includes('verify')) {
      showMsg(msgEl, 'info', err.message);
    } else {
      showMsg(msgEl, 'err', err.message);
    }
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('resend-verification').onclick = async () => {
  const msgEl = document.getElementById('msg-check');
  clearMsg(msgEl);
  try {
    const data = await api('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: pendingEmail || document.getElementById('email').value.trim() }),
    });
    showMsg(msgEl, 'ok', data.message);
  } catch (err) {
    showMsg(msgEl, 'err', err.message);
  }
};

document.getElementById('form-forgot').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('msg-forgot');
  const btn = e.target.querySelector('button[type=submit]');
  clearMsg(msgEl);
  btn.disabled = true;
  try {
    const email = document.getElementById('forgot-email').value.trim();
    const data = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    showMsg(msgEl, 'ok', data.message);
  } catch (err) {
    showMsg(msgEl, 'err', err.message);
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('form-reset').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('msg-reset');
  const btn = e.target.querySelector('button[type=submit]');
  const p1 = document.getElementById('new-password').value;
  const p2 = document.getElementById('confirm-password').value;
  clearMsg(msgEl);
  if (p1 !== p2) {
    showMsg(msgEl, 'err', 'Passwords do not match.');
    return;
  }
  const token = new URLSearchParams(window.location.search).get('token');
  if (!token) {
    showMsg(msgEl, 'err', 'Invalid reset link.');
    return;
  }
  btn.disabled = true;
  try {
    const data = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: p1 }),
    });
    showMsg(msgEl, 'ok', data.message);
    setTimeout(() => { window.location.href = '/auth'; }, 1500);
  } catch (err) {
    showMsg(msgEl, 'err', err.message);
  } finally {
    btn.disabled = false;
  }
});

async function handleDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.replace(/\/$/, '');

  if (path.endsWith('/auth/verify') || params.has('verify')) {
    const token = params.get('token');
    showPanel('verified');
    try {
      const data = await api(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      document.getElementById('verified-text').textContent = data.message;
    } catch (err) {
      document.getElementById('verified-text').textContent = err.message;
      document.querySelector('#panel-verified .icon-circle').textContent = '!';
    }
    return;
  }

  if (path.endsWith('/auth/reset')) {
    showPanel('reset');
    return;
  }

  if (params.get('signed_in') === '1') {
    showPanel('auth');
    setAuthMode('login');
    showMsg(document.getElementById('msg-auth'), 'ok', 'You are signed in.');
  }
}

handleDeepLinks();
