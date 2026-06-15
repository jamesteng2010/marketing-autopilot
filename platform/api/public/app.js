const API = window.location.origin;

const T = {
  appName: 'Marketing Autopilot',
  projects: 'Projects',
  createProject: 'Create project',
  projectName: 'Project name',
  projectNamePh: 'e.g. My SaaS launch',
  freeTrial: 'Free trial — no pricing or billing details needed on this page.',
  noProjects: 'No projects yet. Create one above.',
  signOut: 'Sign out',
  intake: 'Intake',
  stepper: '● Intake → Analysis → Goals → Strategy',
  intakeTitle: 'Intake & materials',
  intakeSub: 'Describe your product and market, add materials, then request analysis. Pricing and KPI targets are set on other pages.',
  save: 'Save',
  requestAnalysis: 'Request analysis',
  saved: 'Saved',
  requiredTitle: 'Required before analysis',
  allRequired: '✓ All required fields complete',
  product: '1 · Product',
  productName: 'Product name *',
  productUrl: 'Product URL *',
  pullWebsite: 'Import from website',
  pullHint: 'Reads the public page to fill name, description, suggested ICP, target regions, analytics tags, and social links.',
  reading: 'Reading website…',
  importDone: 'Import complete',
  oneLiner: 'One-liner (elevator pitch)',
  description: 'Full description',
  audience: '2 · Target market',
  icp: 'Primary audience (ICP) *',
  icpHint: 'Who is your ideal customer? We suggest this from your product URL and description — edit freely. Example: “Parents of teens worried about online safety”.',
  suggestAudience: 'Suggest from product info',
  suggestAudienceHint: 'Uses your product name, description, and website copy. You can always edit the result.',
  audienceSuggested: 'Suggested — edit if needed',
  regions: 'Target countries / regions * (select one or more)',
  painPoints: 'Pain points (one per line)',
  promotion: '3 · Promotion preferences',
  promotionSub: 'Preferences only — numeric targets are confirmed on the Goals page.',
  brandTone: 'Brand tone',
  compliance: 'Compliance notes (e.g. GDPR, no cold DMs)',
  existing: '4 · Existing marketing',
  hasMarketing: 'Already running marketing? *',
  select: 'Select…',
  yes: 'Yes — already marketing',
  no: 'No — starting from scratch',
  existingSub: 'If yes, add one or more records: platform, what you do, link or account ID.',
  addActivity: 'Add marketing record',
  platform: 'Platform / channel',
  status: 'Status',
  statusActive: 'Active',
  statusPaused: 'Paused',
  statusPlanning: 'Planning only',
  whatDone: 'What you have done *',
  whatDonePh: 'e.g. Post on LinkedIn 3×/week; Google Ads ~$500/mo…',
  linkOrId: 'Link or account ID',
  linkOrIdPh: 'Page URL, @handle, or account ID',
  monthlySpend: 'Monthly spend (USD, optional)',
  monthlySpendPh: 'e.g. 500',
  remove: 'Remove',
  noActivities: 'Add at least one marketing record.',
  identity: '5 · Brand identity',
  domain: 'Custom domain',
  brandEmail: 'Desired brand email',
  account: '6 · Account strategy',
  useExisting: 'Use existing social accounts when possible',
  materials: '7 · Materials',
  dropFiles: 'Drop files here or click to upload',
  addUrl: 'Add URL',
  noMaterials: 'No materials yet',
  signInRequired: 'Please sign in',
  analysisStarted: 'Site scan complete. Cursor is generating your feasibility report…',
  analysisRunning: 'Cursor Automation is analyzing your intake. This usually takes 1–3 minutes.',
  analysisReady: 'Your feasibility report is ready.',
  analysisConfirmed: 'Analysis confirmed. Goals workshop coming next.',
  analysisTitle: 'Feasibility analysis',
  analysisSub: 'Review what we understood about your product, current marketing, and recommended direction.',
  analysisStatusRunning: 'Status: Running in Cursor…',
  analysisStatusReady: 'Status: Ready for review',
  analysisStatusConfirmed: 'Status: Confirmed',
  analysisConfirm: 'Confirm and continue to Goals',
  analysisBackIntake: 'Edit intake',
  analysisNoReport: 'No report yet. Complete Intake and request analysis first.',
  analysisPoll: 'Checking for report…',
  analysisFailed: 'Analysis failed in Cursor. Edit intake and try again, or check Automation run logs.',
  analysisFallback: 'Cursor was unavailable — report generated via OpenAI fallback.',
  analysisProgressSave: '① Saving intake…',
  analysisProgressPrepare: '② Running site scan and preparing analysis…',
  analysisProgressCursor: '③ Sending to Cursor Automation…',
  analysisProgressFallback: '③ Cursor unavailable — generating report via OpenAI…',
  analysisProgressDone: 'Done — opening Analysis page…',
  analysisErrTitle: 'Analysis could not start',
  analysisErrNotRunning: 'Nothing is running in the background. Fix the issue below and click Request analysis again.',
  analysisViewStatus: 'View Analysis status',
  analysisRetry: 'Try again',
  analysisRunningHint: 'Analysis is in progress. You can leave this page — open Analysis to watch progress.',
  analysisRunningSince: 'Started',
  analysisStatusFailed: 'Status: Failed',
  analysisFailedNoFallback: 'Cursor hit its usage limit and OpenAI fallback is not configured on the server.',
  tone: { professional: 'Professional', friendly: 'Friendly', technical: 'Technical', playful: 'Playful' },
  missing: {
    'product.name': 'Product name',
    'product.url': 'Product URL',
    'audience.primary': 'Primary audience',
    'audience.geographyRegions': 'Target regions',
    'existingMarketing.hasActiveMarketing': 'Existing marketing (yes/no)',
  },
  footReady: 'Ready for analysis',
  footIncomplete: 'Complete required fields',
  active: 'Active',
  back: 'Back',
  next: 'Continue',
  stepOf: (n, total) => `Step ${n} of ${total}`,
  reviewTitle: 'Review & submit',
  reviewSub: 'Check your answers, then request analysis. You can go back to edit any step.',
  reviewProduct: 'Product',
  reviewMarket: 'Target market',
  reviewBrand: 'Brand & preferences',
  reviewExisting: 'Existing marketing',
  reviewMaterials: 'Materials',
  stepErrorProduct: 'Enter product name and a valid URL to continue.',
  stepErrorMarket: 'Enter primary audience and select at least one region.',
  stepErrorExisting: 'Answer whether you already run marketing. If yes, add at least one complete record.',
  none: 'None',
  notSet: 'Not set',
  asideTips: 'Tips for this step',
  asideRequired: 'Required before analysis',
  asideProgress: 'Overall progress',
  stepTips: {
    product: ['Paste your live product URL first — we can auto-fill name and description.', 'Accurate URL helps us scan analytics tags and social links.'],
    market: ['We auto-suggest ICP when you import a website — always review and edit.', 'Pick all regions where you want to acquire users.'],
    brand: ['Custom domain and brand email are optional — useful for identity setup later.', 'Prefer existing social accounts when you already have them.'],
    existing: ['Pick the specific channel under each group (organic social vs paid ads are different).', 'Add one record per platform; link or account ID helps us build on what you have.'],
    finish: ['Materials are optional but improve analysis quality (deck, screenshots, URLs).', 'Review the summary, then request analysis when all required items are checked.'],
  },
};

const INTAKE_STEPS = [
  { id: 'product', title: 'Product', subtitle: 'Your product and website' },
  { id: 'market', title: 'Target market', subtitle: 'Who you sell to and where' },
  { id: 'brand', title: 'Brand & preferences', subtitle: 'Domain and account preferences' },
  { id: 'existing', title: 'Current marketing', subtitle: 'What you already do today' },
  { id: 'finish', title: 'Materials & review', subtitle: 'Upload assets and submit' },
];

function token() {
  return sessionStorage.getItem('ma_token');
}

function authHeaders() {
  const t = token();
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    sessionStorage.removeItem('ma_token');
    window.location.href = '/auth';
    throw new Error(T.signInRequired);
  }
  if (!res.ok) {
    const err = new Error(data.error || data.message || res.statusText);
    err.body = data;
    throw err;
  }
  return data;
}

function route() {
  const p = window.location.pathname.replace(/\/$/, '') || '/app';
  let m = p.match(/^\/app\/projects\/([^/]+)\/intake$/);
  if (m) return { view: 'intake', projectId: decodeURIComponent(m[1]) };
  m = p.match(/^\/app\/projects\/([^/]+)\/analysis$/);
  if (m) return { view: 'analysis', projectId: decodeURIComponent(m[1]) };
  return { view: 'projects' };
}

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n[k.toLowerCase()] = v;
    else n.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    n.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return n;
}

function showMsg(container, type, text) {
  const m = container.querySelector('.msg') || el('div', { className: 'msg' });
  m.className = `msg show ${type}`;
  m.textContent = text;
  if (!m.parentElement) container.append(m);
}

async function renderProjects(root) {
  root.innerHTML = '';
  root.append(
    el('div', { className: 'topbar' }, [
      el('div', { className: 'logo' }, [T.appName]),
      el('div', { className: 'topbar-right' }, [
        el('a', { href: '#', onclick: (e) => { e.preventDefault(); sessionStorage.removeItem('ma_token'); window.location.href = '/auth'; } }, [T.signOut]),
      ]),
    ]),
  );
  const main = el('main', { className: 'main', style: 'max-width:640px;margin:40px auto' });
  main.append(
    el('div', { className: 'msg show info', style: 'margin-bottom:16px' }, [T.freeTrial]),
    el('h2', {}, [T.projects]),
    el('p', { className: 'sub' }, ['Create a project to start Intake.']),
  );
  const form = el('div', { className: 'card' });
  const nameInput = el('input', { type: 'text', placeholder: T.projectNamePh });
  form.append(el('div', { className: 'field' }, [el('label', {}, [T.projectName]), nameInput]));
  const createBtn = el('button', { className: 'btn btn-primary', type: 'button' }, [T.createProject]);
  form.append(createBtn);
  const listWrap = el('div');
  main.append(form, listWrap);
  root.append(main);

  createBtn.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) return;
    createBtn.disabled = true;
    try {
      const { projectId } = await api('/api/projects', { method: 'POST', body: JSON.stringify({ name }) });
      window.location.href = `/app/projects/${projectId}/intake`;
    } catch (err) {
      showMsg(form, 'err', err.message);
    } finally {
      createBtn.disabled = false;
    }
  };

  try {
    const { projects } = await api('/api/projects');
    if (!projects.length) {
      listWrap.append(el('p', { className: 'sub' }, [T.noProjects]));
      return;
    }
    const ul = el('ul', { className: 'project-list' });
    for (const p of projects) {
      ul.append(el('li', {}, [
        el('a', { href: `/app/projects/${p.projectId}/intake` }, [p.name]),
        el('span', { className: 'tag' }, [p.status === 'active' ? T.active : p.status]),
        el('span', { style: 'margin-left:8px;font-size:13px' }, [
          el('a', { href: `/app/projects/${p.projectId}/analysis`, style: 'margin-left:8px' }, ['Analysis']),
        ]),
      ]));
    }
    listWrap.append(ul);
  } catch (err) {
    showMsg(form, 'err', err.message);
  }
}

const state = { intake: null, summary: null, catalog: null, projectId: null, projectName: '', currentStep: 0 };

async function renderIntake(root, projectId) {
  state.projectId = projectId;
  root.innerHTML = '';
  root.append(
    el('div', { className: 'topbar' }, [
      el('div', { className: 'logo' }, [T.appName]),
      el('div', { className: 'topbar-right' }, [
        el('a', { href: '/app' }, [T.projects]),
        el('a', { href: '#', onclick: (e) => { e.preventDefault(); sessionStorage.removeItem('ma_token'); window.location.href = '/auth'; } }, [T.signOut]),
      ]),
    ]),
    el('div', { className: 'stepper' }, [
      el('span', { className: 'step' }, ['Intake']),
      el('span', {}, ['→ Analysis → Goals → Strategy']),
    ]),
  );
  const body = el('div', { className: 'app-body intake-wizard-body' });
  const page = el('div', { className: 'wizard-page' });
  const main = el('main', { className: 'intake-wizard-main' });
  main.id = 'intake-main';
  const aside = el('aside', { className: 'wizard-aside', id: 'wizard-aside' });
  page.append(main, aside);
  body.append(page);
  root.append(body);

  const savedStep = sessionStorage.getItem(`ma_intake_step_${projectId}`);
  state.currentStep = savedStep ? Math.min(Number(savedStep), INTAKE_STEPS.length - 1) : 0;

  try {
    const [{ project }, intakeData, catalog] = await Promise.all([
      api(`/api/projects/${projectId}`),
      api(`/api/projects/${projectId}/intake`),
      api('/api/catalog/recommendations?regions=US,CN,EU,GLOBAL_EN'),
    ]);
    state.projectName = project.name;
    state.intake = intakeData.intake;
    state.summary = intakeData.summary;
    state.catalog = catalog;
    renderIntakeWizard(main);
  } catch (err) {
    main.append(el('div', { className: 'msg show err' }, [err.message]));
  }
}

function renderIntakeWizard(main) {
  main.innerHTML = '';
  const step = INTAKE_STEPS[state.currentStep];
  const i = state.intake;

  main.append(
    el('div', { className: 'wizard-header' }, [
      el('h2', {}, [`${state.projectName}`]),
      el('p', { className: 'sub', style: 'margin-bottom:8px' }, [T.intakeSub]),
    ]),
    buildWizardStepper(),
    el('div', { className: 'wizard-step-label' }, [
      el('strong', {}, [step.title]),
      el('span', { className: 'sub' }, [` — ${step.subtitle}`]),
    ]),
    el('div', { className: 'msg show info', style: 'margin-bottom:16px;font-size:12px' }, [T.freeTrial]),
    el('div', { id: 'wizard-panel', className: 'wizard-panel' }),
    el('div', { id: 'wizard-msg', className: 'msg' }),
    el('div', { id: 'analysis-progress', className: 'analysis-progress hidden' }),
    el('div', { id: 'analysis-status-banner', className: 'analysis-banner hidden' }),
    buildWizardFooter(main),
  );

  const panel = document.getElementById('wizard-panel');
  panel.append(renderStepPanel(step.id, i));
  renderWizardAside(step.id);
  updateWizardFooter();
  refreshAnalysisStatusBanner();
}

function setWizardMsg(text, type = 'info') {
  const msgEl = document.getElementById('wizard-msg');
  if (!msgEl) return;
  msgEl.className = `msg show ${type}`;
  msgEl.textContent = text;
}

function setAnalysisProgress(steps) {
  const elProgress = document.getElementById('analysis-progress');
  if (!elProgress) return;
  if (!steps?.length) {
    elProgress.classList.add('hidden');
    elProgress.innerHTML = '';
    return;
  }
  elProgress.classList.remove('hidden');
  elProgress.innerHTML = '';
  for (const s of steps) {
    const row = document.createElement('div');
    row.className = `analysis-progress-row ${s.state || 'pending'}`;
    row.textContent = `${s.state === 'done' ? '✓' : s.state === 'active' ? '…' : '○'} ${s.text}`;
    elProgress.appendChild(row);
  }
}

async function refreshAnalysisStatusBanner() {
  const banner = document.getElementById('analysis-status-banner');
  if (!banner || !state.projectId) return;
  banner.classList.add('hidden');
  banner.innerHTML = '';
  if (state.currentStep !== INTAKE_STEPS.length - 1) return;
  try {
    const data = await api(`/api/projects/${state.projectId}/analysis/feasibility`);
    if (data.status === 'running') {
      banner.classList.remove('hidden');
      banner.className = 'analysis-banner info';
      const since = data.analysisRequestedAt
        ? new Date(data.analysisRequestedAt).toLocaleString()
        : '';
      banner.append(
        el('strong', {}, [T.analysisRunningHint]),
        el('p', { className: 'sub', style: 'margin:8px 0' }, [
          since ? `${T.analysisRunningSince}: ${since}` : '',
        ]),
        el('a', { href: `/app/projects/${state.projectId}/analysis`, className: 'btn btn-secondary', style: 'margin-top:8px;display:inline-block' }, [T.analysisViewStatus]),
      );
    } else if (data.status === 'failed') {
      banner.classList.remove('hidden');
      banner.className = 'analysis-banner err';
      banner.append(
        el('strong', {}, [T.analysisStatusFailed]),
        el('p', { style: 'margin:8px 0' }, [data.analysisErrorSummary || T.analysisFailed]),
        el('a', { href: `/app/projects/${state.projectId}/analysis`, className: 'btn btn-secondary', style: 'margin-top:8px;display:inline-block' }, [T.analysisViewStatus]),
      );
    } else if (data.status === 'ready') {
      banner.classList.remove('hidden');
      banner.className = 'analysis-banner ok';
      banner.append(
        el('strong', {}, [T.analysisReady]),
        el('a', { href: `/app/projects/${state.projectId}/analysis`, className: 'btn btn-primary', style: 'margin-top:8px;display:inline-block' }, [T.analysisViewStatus]),
      );
    }
  } catch {
    /* ignore */
  }
}

function renderWizardAside(stepId) {
  const aside = document.getElementById('wizard-aside');
  if (!aside) return;
  aside.innerHTML = '';
  const tips = T.stepTips[stepId] || [];

  const progressCard = el('div', { className: 'card wizard-aside-card' }, [
    el('strong', {}, [T.asideProgress]),
    el('p', { className: 'wizard-progress-pct', style: 'font-size:28px;font-weight:700;color:var(--accent);margin:8px 0 4px' },
      [`${state.summary?.completenessPercent ?? 0}%`]),
    el('p', { className: 'sub', style: 'margin:0' }, [
      state.summary?.readyForAnalysis ? T.footReady : T.footIncomplete,
    ]),
  ]);

  const tipsCard = el('div', { className: 'card wizard-aside-card' }, [
    el('strong', {}, [T.asideTips]),
    el('ul', { className: 'wizard-tips-list' }, tips.map((t) => el('li', {}, [t]))),
  ]);

  const reqCard = el('div', { className: 'card wizard-aside-card' }, [
    el('strong', {}, [T.asideRequired]),
    el('ul', { id: 'required-list', className: 'wizard-req-list' }),
  ]);

  aside.append(progressCard, tipsCard, reqCard);
  updateRequiredList();
}

function buildWizardStepper() {
  const wrap = el('div', { className: 'wizard-steps' });
  INTAKE_STEPS.forEach((s, idx) => {
    const done = idx < state.currentStep;
    const cur = idx === state.currentStep;
    const btn = el('button', {
      type: 'button',
      className: `wizard-step${cur ? ' cur' : ''}${done ? ' done' : ''}`,
      onclick: () => { if (idx <= state.currentStep) goToStep(idx); },
    }, [
      el('span', { className: 'wizard-step-num' }, [String(idx + 1)]),
      el('span', { className: 'wizard-step-title' }, [s.title]),
    ]);
    wrap.append(btn);
    if (idx < INTAKE_STEPS.length - 1) wrap.append(el('span', { className: 'wizard-step-line' }, ['']));
  });
  return wrap;
}

function renderStepPanel(stepId, i) {
  const frag = el('div', { className: 'card wizard-card' });
  let content;
  switch (stepId) {
    case 'product': content = productSection(i); break;
    case 'market': content = audienceSection(i); break;
    case 'brand': content = brandStepSection(i); break;
    case 'existing': content = existingSection(i); break;
    case 'finish':
      content = el('div', {}, []);
      content.append(materialsSection());
      content.append(el('hr', { style: 'margin:20px 0;border:none;border-top:1px solid var(--border)' }));
      content.append(el('h3', { style: 'margin:0 0 8px' }, [T.reviewTitle]));
      content.append(el('p', { className: 'sub' }, [T.reviewSub]));
      content.append(buildReviewSummary());
      break;
    default: content = el('div');
  }
  frag.append(content);
  return frag;
}

function brandStepSection(i) {
  const acct = i.marketing?.accountStrategy || {};
  const c = el('div');
  c.append(
    field(T.domain, 'text', i.identity?.domain, (v) => patchLater({ identity: { domain: v } })),
    field(T.brandEmail, 'email', i.identity?.brandEmailDesired, (v) => patchLater({ identity: { brandEmailDesired: v } })),
    checkbox(T.useExisting, acct.useExistingAccounts, (v) => patchLater({ marketing: { accountStrategy: { ...acct, useExistingAccounts: v } } })),
  );
  return c;
}

function buildReviewSummary() {
  const i = state.intake;
  const regions = (i.audience?.geographyRegions || []).map((id) => {
    const r = state.catalog?.allRegions?.find((x) => x.id === id);
    return r?.labelEn || id;
  }).join(', ') || T.notSet;
  const acts = i.existingMarketing?.activities || [];
  const matCount = i.materials?.items?.length || 0;
  const hasM = i.existingMarketing?.hasActiveMarketing;

  const acct = i.marketing?.accountStrategy || {};
  const rows = [
    [T.reviewProduct, i.product?.name || T.notSet, i.product?.url || ''],
    [T.reviewMarket, i.audience?.primary || T.notSet, regions],
    [T.reviewBrand, i.identity?.domain || T.notSet, acct.useExistingAccounts ? T.useExisting : ''],
    [T.reviewExisting, hasM === true ? T.yes : hasM === false ? T.no : T.notSet, hasM ? `${acts.length} record(s)` : ''],
    [T.reviewMaterials, `${matCount} file(s) / link(s)`, ''],
  ];

  const ul = el('div', { className: 'review-list' });
  for (const [label, a, b] of rows) {
    ul.append(el('div', { className: 'review-row' }, [
      el('span', { className: 'review-label' }, [label]),
      el('span', { className: 'review-value' }, [b ? `${a} · ${b}` : a]),
    ]));
  }

  const checklist = el('ul', { className: 'wizard-req-list' });
  updateRequiredList(checklist);
  ul.append(el('div', { style: 'margin-top:12px' }, [el('strong', { style: 'font-size:13px' }, [T.requiredTitle]), checklist]));
  return ul;
}

function buildWizardFooter(main) {
  const foot = el('div', { className: 'wizard-foot' });
  foot.append(
    el('span', { className: 'foot-meta', id: 'foot-meta' }),
    el('button', { className: 'btn btn-secondary', type: 'button', id: 'wizard-back', onclick: () => goToStep(state.currentStep - 1) }, [T.back]),
    el('button', { className: 'btn btn-primary', type: 'button', id: 'wizard-next', onclick: () => wizardNext(main) }, [T.next]),
    el('button', { className: 'btn btn-primary hidden', type: 'button', id: 'analyze-btn', onclick: () => requestAnalysis(main) }, [T.requestAnalysis]),
  );
  return foot;
}

function updateWizardFooter() {
  const back = document.getElementById('wizard-back');
  const next = document.getElementById('wizard-next');
  const analyze = document.getElementById('analyze-btn');
  const foot = document.getElementById('foot-meta');
  const isLast = state.currentStep === INTAKE_STEPS.length - 1;

  if (back) back.classList.toggle('hidden', state.currentStep === 0);
  if (next) next.classList.toggle('hidden', isLast);
  if (analyze) {
    analyze.classList.toggle('hidden', !isLast);
    analyze.disabled = !state.summary?.readyForAnalysis;
  }
  if (foot && state.summary) {
    foot.textContent = T.stepOf(state.currentStep + 1, INTAKE_STEPS.length) + ` · ${state.summary.completenessPercent}%`;
  }
}

function validateCurrentStep() {
  const i = state.intake;
  const stepId = INTAKE_STEPS[state.currentStep].id;
  if (stepId === 'product') {
    if (!i.product?.name?.trim() || !/^https?:\/\//i.test(i.product?.url?.trim() || '')) return T.stepErrorProduct;
  }
  if (stepId === 'market') {
    const regions = i.audience?.geographyRegions || [];
    if (!i.audience?.primary?.trim() || !regions.length) return T.stepErrorMarket;
  }
  if (stepId === 'existing') {
    const hasM = i.existingMarketing?.hasActiveMarketing;
    if (hasM === null || hasM === undefined) return T.stepErrorExisting;
    if (hasM === true) {
      const acts = i.existingMarketing?.activities || [];
      if (!acts.length || acts.some((a) => !a.platform?.trim() || !a.summary?.trim())) return T.stepErrorExisting;
    }
  }
  return null;
}

async function wizardNext(main) {
  const err = validateCurrentStep();
  const msgEl = document.getElementById('wizard-msg');
  if (err) {
    if (msgEl) { msgEl.className = 'msg show err'; msgEl.textContent = err; }
    return;
  }
  if (msgEl) msgEl.className = 'msg';
  await flushPatch();
  goToStep(state.currentStep + 1);
}

function goToStep(idx) {
  if (idx < 0 || idx >= INTAKE_STEPS.length) return;
  state.currentStep = idx;
  sessionStorage.setItem(`ma_intake_step_${state.projectId}`, String(idx));
  const main = document.getElementById('intake-main');
  if (main) renderIntakeWizard(main);
}

async function flushPatch() {
  clearTimeout(patchTimer);
  return new Promise((resolve) => {
    patchTimer = setTimeout(async () => {
      try {
        const data = await api(`/api/projects/${state.projectId}/intake`);
        state.intake = data.intake;
        state.summary = data.summary;
      } catch { /* ignore */ }
      resolve();
    }, 100);
  });
}

function buildIntakeForm(main) {
  renderIntakeWizard(main);
}

function productSection(i) {
  const urlInput = el('input', { type: 'url', value: i.product?.url || '', placeholder: 'https://' });
  urlInput.onblur = () => {
    const url = urlInput.value.trim();
    patchLater({ product: { url } });
    if (/^https?:\/\//i.test(url)) scheduleWebsiteImport(url);
  };
  const pullBtn = el('button', { className: 'btn btn-secondary btn-sm', type: 'button' }, [T.pullWebsite]);
  pullBtn.onclick = () => importFromWebsite(urlInput.value.trim(), pullBtn);
  const statusEl = el('div', { id: 'import-status', className: 'sub', style: 'margin-top:6px;min-height:18px' });

  return el('div', {}, [
    field(T.productName, 'text', i.product?.name, (v) => patchLater({ product: { name: v } }), 'product-name'),
    el('div', { className: 'field' }, [
      el('label', {}, [T.productUrl]),
      el('div', { style: 'display:flex;gap:8px' }, [urlInput, pullBtn]),
      statusEl,
      el('p', { className: 'sub', style: 'margin:6px 0 0' }, [T.pullHint]),
    ]),
    field(T.oneLiner, 'text', i.product?.oneLiner, (v) => patchLater({ product: { oneLiner: v } })),
    fieldArea(T.description, i.product?.description, (v) => patchLater({ product: { description: v } })),
  ]);
}

function audienceSection(i) {
  const regions = i.audience?.geographyRegions || [];
  const chips = el('div', { className: 'chips' });
  for (const r of (state.catalog?.allRegions || [])) {
    const chip = el('span', { className: `chip${regions.includes(r.id) ? ' on' : ''}`, title: r.id }, [r.labelEn || r.id]);
    chip.onclick = () => {
      const cur = state.intake?.audience?.geographyRegions || [];
      const next = cur.includes(r.id) ? cur.filter((x) => x !== r.id) : [...cur, r.id];
      chip.classList.toggle('on', next.includes(r.id));
      patchLater({ audience: { geographyRegions: next } });
    };
    chips.append(chip);
  }

  const suggestBtn = el('button', { className: 'btn btn-secondary btn-sm', type: 'button' }, [T.suggestAudience]);
  const suggestStatus = el('div', { id: 'suggest-audience-status', className: 'sub', style: 'margin-top:6px;min-height:18px' });
  suggestBtn.onclick = () => suggestAudience(suggestBtn, suggestStatus);

  const icpInput = el('input', { type: 'text', value: i.audience?.primary || '' });
  icpInput.onblur = () => patchLater({ audience: { primary: icpInput.value.trim() } });

  const inferred = i.audience?.primarySource && i.audience?.primary?.trim();
  const icpBadge = inferred
    ? el('p', { className: 'sub', style: 'margin:-4px 0 8px;color:var(--accent,#0d9488)' }, [T.audienceSuggested])
    : null;

  return el('div', {}, [
    el('div', { className: 'field' }, [el('label', {}, [T.icp]), icpInput]),
    icpBadge,
    el('p', { className: 'sub', style: 'margin:-8px 0 12px' }, [T.icpHint]),
    el('div', { style: 'margin-bottom:16px' }, [
      suggestBtn,
      suggestStatus,
      el('p', { className: 'sub', style: 'margin:6px 0 0' }, [T.suggestAudienceHint]),
    ]),
    el('div', { className: 'field' }, [el('label', {}, [T.regions]), chips]),
    fieldArea(T.painPoints, (i.audience?.painPoints || []).join('\n'), (v) => patchLater({ audience: { painPoints: v.split('\n').map((s) => s.trim()).filter(Boolean) } })),
  ]);
}


function existingSection(i) {
  const hasM = i.existingMarketing?.hasActiveMarketing;
  const sel = el('select');
  sel.append(el('option', { value: '' }, [T.select]), el('option', { value: 'yes' }, [T.yes]), el('option', { value: 'no' }, [T.no]));
  if (hasM === true) sel.value = 'yes';
  if (hasM === false) sel.value = 'no';

  const activitiesWrap = el('div', { id: 'activities-wrap' });
  const renderActs = () => {
    activitiesWrap.innerHTML = '';
    const show = state.intake?.existingMarketing?.hasActiveMarketing === true;
    if (!show) return;
    activitiesWrap.append(el('p', { className: 'sub' }, [T.existingSub]));
    const acts = state.intake?.existingMarketing?.activities || [];
    for (const act of acts) activitiesWrap.append(activityRow(act, renderActs));
    activitiesWrap.append(el('button', {
      className: 'btn btn-secondary btn-sm', type: 'button', style: 'margin-top:8px',
      onclick: () => addActivity(renderActs),
    }, [T.addActivity]));
    if (!acts.length) activitiesWrap.append(el('p', { className: 'msg show info', style: 'margin-top:8px' }, [T.noActivities]));
  };

  sel.onchange = async () => {
    const val = sel.value === 'yes' ? true : sel.value === 'no' ? false : null;
    state.intake.existingMarketing = state.intake.existingMarketing || {};
    state.intake.existingMarketing.hasActiveMarketing = val;
    if (val === false) {
      await saveActivities([], renderActs);
    }
    renderActs();
    await patchLater({ existingMarketing: { hasActiveMarketing: val } });
  };

  renderActs();
  return el('div', {}, [
    el('div', { className: 'field' }, [el('label', {}, [T.hasMarketing]), sel]),
    activitiesWrap,
  ]);
}

function isPaidChannel(platformId) {
  return (state.catalog?.paidChannelIds || ['meta_ads', 'google_ads']).includes(platformId);
}

function buildPlatformSelect(selectedId) {
  const sel = el('select');
  sel.append(el('option', { value: '' }, [T.select]));
  const groups = state.catalog?.channelGroups?.length
    ? state.catalog.channelGroups
    : [{ labelEn: 'Channels', channels: state.catalog?.allChannels || [] }];
  for (const g of groups) {
    const og = document.createElement('optgroup');
    og.label = g.labelEn;
    for (const c of g.channels) {
      const opt = el('option', { value: c.id }, [c.label]);
      if (c.id === selectedId) opt.selected = true;
      og.append(opt);
    }
    sel.append(og);
  }
  return sel;
}

function activityRow(act, rerender) {
  const plat = buildPlatformSelect(act.platform);

  const st = el('select');
  [['active', T.statusActive], ['paused', T.statusPaused], ['planning', T.statusPlanning]].forEach(([v, l]) => {
    st.append(el('option', { value: v, selected: v === act.status }, [l]));
  });

  const summary = el('textarea', { placeholder: T.whatDonePh });
  summary.value = act.summary || '';
  const link = el('input', { type: 'text', placeholder: T.linkOrIdPh, value: act.linkOrId || '' });

  const spendWrap = el('div', { className: 'field' });
  const spendInput = el('input', {
    type: 'number',
    min: '0',
    step: '1',
    placeholder: T.monthlySpendPh,
    value: act.monthlySpendUsd != null && act.monthlySpendUsd !== '' ? String(act.monthlySpendUsd) : '',
  });
  spendWrap.append(el('label', {}, [T.monthlySpend]), spendInput);

  const syncSpendVisibility = () => {
    const show = isPaidChannel(plat.value);
    spendWrap.style.display = show ? '' : 'none';
  };
  syncSpendVisibility();

  const saveAct = () => {
    const paid = isPaidChannel(plat.value);
    const spendVal = spendInput.value.trim();
    const acts = (state.intake.existingMarketing?.activities || []).map((a) =>
      a.id === act.id ? {
        ...a,
        platform: plat.value,
        status: st.value,
        summary: summary.value.trim(),
        linkOrId: link.value.trim(),
        monthlySpendUsd: paid && spendVal !== '' ? Number(spendVal) : null,
      } : a,
    );
    saveActivities(acts, rerender);
  };

  plat.onchange = () => { syncSpendVisibility(); saveAct(); };
  st.onchange = saveAct;
  summary.onblur = saveAct;
  link.onblur = saveAct;
  spendInput.onblur = saveAct;

  const row = el('div', { className: 'card', style: 'padding:12px;margin-top:8px;background:#f8fafc' });
  row.append(
    el('div', { className: 'grid-2' }, [
      el('div', { className: 'field' }, [el('label', {}, [T.platform]), plat]),
      el('div', { className: 'field' }, [el('label', {}, [T.status]), st]),
    ]),
    el('div', { className: 'field' }, [el('label', {}, [T.whatDone]), summary]),
    el('div', { className: 'field' }, [el('label', {}, [T.linkOrId]), link]),
    spendWrap,
    el('button', {
      className: 'link', type: 'button',
      onclick: () => {
        const acts = (state.intake.existingMarketing?.activities || []).filter((a) => a.id !== act.id);
        saveActivities(acts, rerender);
      },
    }, [T.remove]),
  );
  return row;
}

function addActivity(rerender) {
  const acts = [...(state.intake.existingMarketing?.activities || []), {
    id: `act_${Date.now()}`,
    platform: '',
    status: 'active',
    summary: '',
    linkOrId: '',
    source: 'user',
  }];
  saveActivities(acts, rerender);
}

async function saveActivities(acts, rerender) {
  const data = await api(`/api/projects/${state.projectId}/intake`, {
    method: 'PATCH',
    body: JSON.stringify({ existingMarketing: { activities: acts } }),
  });
  state.intake = data.intake;
  state.summary = data.summary;
  rerender();
  updateWizardFooter();
  updateRequiredList();
}

function identitySection(i) {
  return card(T.identity, [
    field(T.domain, 'text', i.identity?.domain, (v) => patchLater({ identity: { domain: v } })),
    field(T.brandEmail, 'email', i.identity?.brandEmailDesired, (v) => patchLater({ identity: { brandEmailDesired: v } })),
  ]);
}

function accountSection(i) {
  const acct = i.marketing?.accountStrategy || {};
  return card(T.account, [
    checkbox(T.useExisting, acct.useExistingAccounts, (v) => patchLater({ marketing: { accountStrategy: { ...acct, useExistingAccounts: v } } })),
  ]);
}

function materialsSection() {
  const matList = el('div', { id: 'material-list' });
  refreshMaterials(matList);
  const drop = el('div', { className: 'dropzone' }, [T.dropFiles]);
  const fileInput = el('input', { type: 'file', multiple: 'true', className: 'hidden' });
  drop.onclick = () => fileInput.click();
  fileInput.onchange = () => uploadFiles(fileInput.files, matList);
  drop.ondragover = (e) => e.preventDefault();
  drop.ondrop = (e) => { e.preventDefault(); uploadFiles(e.dataTransfer.files, matList); };
  const urlInput = el('input', { type: 'url', placeholder: 'https://…' });
  const urlBtn = el('button', { className: 'btn btn-secondary btn-sm', type: 'button' }, [T.addUrl]);
  urlBtn.onclick = async () => {
    await api(`/api/projects/${state.projectId}/materials`, { method: 'POST', body: JSON.stringify({ type: 'url', title: urlInput.value, url: urlInput.value, source: 'url' }) });
    await reloadIntake(matList);
    urlInput.value = '';
  };
  return el('div', {}, [drop, fileInput, el('div', { className: 'grid-2' }, [urlInput, urlBtn]), matList]);
}

function card(title, children) {
  const c = el('div', { className: 'card' });
  c.append(el('h3', {}, [title]), ...children);
  return c;
}

function field(label, type, value, onBlur, id) {
  const input = el('input', { type, value: value || '', ...(id ? { id } : {}) });
  input.onblur = () => onBlur(input.value.trim());
  return el('div', { className: 'field' }, [el('label', {}, [label]), input]);
}

function fieldArea(label, value, onBlur) {
  const ta = el('textarea');
  ta.value = value || '';
  ta.onblur = () => onBlur(ta.value);
  return el('div', { className: 'field' }, [el('label', {}, [label]), ta]);
}

let importTimer;
let lastImportedUrl = '';

function scheduleWebsiteImport(url) {
  if (!url || url === lastImportedUrl) return;
  clearTimeout(importTimer);
  importTimer = setTimeout(() => importFromWebsite(url), 1200);
}

async function importFromWebsite(url, btn) {
  if (!/^https?:\/\//i.test(url || '')) return;
  const status = document.getElementById('import-status');
  if (status) status.textContent = T.reading;
  if (btn) btn.disabled = true;
  try {
    const data = await api(`/api/projects/${state.projectId}/intake/import-website`, { method: 'POST', body: JSON.stringify({ url }) });
    state.intake = data.intake;
    state.summary = data.summary;
    lastImportedUrl = url;
    const step = state.currentStep;
    state.currentStep = step;
    renderIntakeWizard(document.getElementById('intake-main'));
    if (status) status.textContent = data.message || T.importDone;
  } catch (err) {
    if (status) status.textContent = err.message;
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function suggestAudience(btn, statusEl) {
  if (btn) btn.disabled = true;
  if (statusEl) statusEl.textContent = T.reading;
  try {
    const data = await api(`/api/projects/${state.projectId}/intake/suggest-audience`, { method: 'POST', body: '{}' });
    state.intake = data.intake;
    state.summary = data.summary;
    renderIntakeWizard(document.getElementById('intake-main'));
    if (statusEl) statusEl.textContent = data.message || T.importDone;
  } catch (err) {
    if (statusEl) statusEl.textContent = err.message;
  } finally {
    if (btn) btn.disabled = false;
  }
}

function selectField(label, options, value, onChange, labels) {
  const sel = el('select');
  for (const o of options) sel.append(el('option', { value: o, selected: o === (value || options[0]) }, [labels?.[o] || o]));
  sel.onchange = () => onChange(sel.value);
  return el('div', { className: 'field' }, [el('label', {}, [label]), sel]);
}

function checkbox(label, checked, onChange) {
  const cb = el('input', { type: 'checkbox' });
  cb.checked = !!checked;
  cb.onchange = () => onChange(cb.checked);
  return el('p', { style: 'font-size:14px' }, [cb, ' ', label]);
}

let patchTimer;
function patchLater(partial) {
  clearTimeout(patchTimer);
  return new Promise((resolve) => {
    patchTimer = setTimeout(async () => {
      const data = await api(`/api/projects/${state.projectId}/intake`, { method: 'PATCH', body: JSON.stringify(partial) });
      state.intake = data.intake;
      state.summary = data.summary;
      updateWizardFooter();
      updateRequiredList();
      resolve(data);
    }, 500);
  });
}

async function saveNow(main, { quiet = false } = {}) {
  const data = await api(`/api/projects/${state.projectId}/intake`);
  state.summary = data.summary;
  updateWizardFooter();
  if (!quiet) {
    setWizardMsg(T.saved, 'ok');
  }
}

async function requestAnalysis(main) {
  const btn = document.getElementById('analyze-btn');
  const back = document.getElementById('wizard-back');
  const next = document.getElementById('wizard-next');
  btn.disabled = true;
  if (back) back.disabled = true;
  btn.classList.add('btn-loading');
  btn.textContent = T.analysisProgressPrepare;

  const steps = [
    { text: T.analysisProgressSave.replace(/^①\s*/, ''), state: 'active' },
    { text: T.analysisProgressPrepare.replace(/^②\s*/, ''), state: 'pending' },
    { text: T.analysisProgressCursor.replace(/^③\s*/, ''), state: 'pending' },
  ];
  setAnalysisProgress(steps);
  setWizardMsg(T.analysisProgressSave, 'info');

  try {
    steps[0].state = 'active';
    setAnalysisProgress([...steps]);
    await saveNow(main, { quiet: true });

    steps[0].state = 'done';
    steps[1].state = 'active';
    setAnalysisProgress([...steps]);
    setWizardMsg(T.analysisProgressPrepare, 'info');
    btn.textContent = T.analysisProgressPrepare;

    const data = await api(`/api/projects/${state.projectId}/intake/analyze`, { method: 'POST', body: '{}' });

    steps[1].state = 'done';
    if (data.fallback?.from === 'cursor' && data.phaseB?.ok) {
      steps[2].text = T.analysisProgressFallback.replace(/^③\s*/, '');
      steps[2].state = 'done';
      setAnalysisProgress([...steps]);
      setWizardMsg(T.analysisFallback, 'ok');
    } else if (data.webhook?.invoked) {
      steps[2].state = 'done';
      setAnalysisProgress([...steps]);
      setWizardMsg(T.analysisStarted, 'ok');
    } else if (data.phaseB?.ok) {
      steps[2].state = 'done';
      setAnalysisProgress([...steps]);
      setWizardMsg(T.analysisReady, 'ok');
    }

    btn.textContent = T.analysisProgressDone;
    await new Promise((r) => setTimeout(r, 600));
    const qs = data.fallback?.from ? '?fallback=1' : data.webhook?.invoked ? '?cursor=1' : data.phaseB?.ok ? '?ready=1' : '';
    window.location.href = `/app/projects/${state.projectId}/analysis${qs}`;
  } catch (err) {
    const body = err.body || {};
    steps.forEach((s) => { if (s.state === 'active') s.state = 'failed'; });
    setAnalysisProgress([...steps]);
    btn.classList.remove('btn-loading');
    btn.textContent = T.requestAnalysis;
    if (back) back.disabled = false;
    btn.disabled = !state.summary?.readyForAnalysis;

    const msgEl = document.getElementById('wizard-msg');
    if (msgEl) {
      msgEl.className = 'msg show err';
      msgEl.innerHTML = '';
      msgEl.append(el('strong', {}, [`${T.analysisErrTitle}. ${T.analysisErrNotRunning}`]));
      msgEl.append(el('p', { style: 'margin:8px 0 0' }, [body.error || err.message]));
      const hint = body.userHint || (String(body.error || err.message).includes('usage limit')
        ? T.analysisFailedNoFallback
        : null);
      if (hint) msgEl.append(el('p', { className: 'sub', style: 'margin:8px 0 0' }, [hint]));
      msgEl.append(el('a', {
        href: `/app/projects/${state.projectId}/analysis`,
        className: 'btn btn-secondary',
        style: 'margin-top:12px;display:inline-block',
      }, [T.analysisViewStatus]));
    }
    refreshAnalysisStatusBanner();
  }
}

function renderMarkdown(md) {
  const box = el('div', { className: 'report-prose' });
  if (!md) return box;
  for (const line of md.split('\n')) {
    const t = line.trimEnd();
    if (t.startsWith('## ')) box.append(el('h2', {}, [t.slice(3)]));
    else if (t.startsWith('### ')) box.append(el('h3', {}, [t.slice(4)]));
    else if (t.startsWith('- [ ] ')) box.append(el('p', { className: 'check' }, ['☐ ' + t.slice(6)]));
    else if (t.startsWith('- [x] ') || t.startsWith('- [X] ')) box.append(el('p', { className: 'check done' }, ['☑ ' + t.slice(6)]));
    else if (t.startsWith('- ')) box.append(el('p', { className: 'bullet' }, [t.slice(2)]));
    else if (t.startsWith('|')) box.append(el('p', { className: 'table-line' }, [t]));
    else if (t.trim()) box.append(el('p', {}, [t]));
  }
  return box;
}

async function renderAnalysis(root, projectId) {
  state.projectId = projectId;
  root.innerHTML = '';
  root.append(
    el('div', { className: 'topbar' }, [
      el('div', { className: 'logo' }, [T.appName]),
      el('div', { className: 'topbar-right' }, [
        el('a', { href: '/app' }, [T.projects]),
        el('a', { href: `/app/projects/${projectId}/intake` }, [T.intake]),
        el('a', { href: '#', onclick: (e) => { e.preventDefault(); sessionStorage.removeItem('ma_token'); window.location.href = '/auth'; } }, [T.signOut]),
      ]),
    ]),
    el('div', { className: 'stepper' }, [
      el('span', { className: 'step' }, [T.intake]),
      el('span', { className: 'step cur' }, ['Analysis']),
      el('span', {}, ['→ Goals → Strategy']),
    ]),
  );

  const main = el('main', { className: 'main analysis-page' });
  main.append(
    el('h1', { style: 'margin:0 0 8px;font-size:22px' }, [T.analysisTitle]),
    el('p', { className: 'sub', style: 'margin:0 0 20px' }, [T.analysisSub]),
  );
  const statusEl = el('div', { className: 'msg show info', id: 'analysis-status' }, [T.analysisPoll]);
  const detailEl = el('div', { className: 'analysis-detail sub', id: 'analysis-detail' });
  const reportEl = el('div', { id: 'analysis-report' });
  const actions = el('div', { className: 'wizard-footer', style: 'margin-top:24px;padding:0' });
  main.append(statusEl, detailEl, reportEl, actions);
  root.append(main);

  let pollTimer;
  const confirmBtn = el('button', { className: 'btn btn-primary hidden', type: 'button', id: 'confirm-analysis-btn' }, [T.analysisConfirm]);
  const backBtn = el('button', { className: 'btn btn-secondary', type: 'button' }, [T.analysisBackIntake]);
  backBtn.onclick = () => { window.location.href = `/app/projects/${projectId}/intake`; };
  actions.append(backBtn, confirmBtn);

  const qs = new URLSearchParams(window.location.search);
  if (qs.get('cursor') === '1') {
    statusEl.className = 'msg show info';
    statusEl.textContent = T.analysisStarted;
    detailEl.textContent = T.analysisRunningHint;
  } else if (qs.get('fallback') === '1') {
    statusEl.className = 'msg show ok';
    statusEl.textContent = T.analysisFallback;
  } else if (qs.get('ready') === '1') {
    statusEl.className = 'msg show ok';
    statusEl.textContent = T.analysisReady;
  }

  async function refresh() {
    const data = await api(`/api/projects/${projectId}/analysis/feasibility`);
    if (data.status === 'running' || data.status === 'not_started') {
      statusEl.className = 'msg show info';
      statusEl.textContent = data.status === 'running' ? T.analysisRunning : T.analysisNoReport;
      detailEl.textContent = data.analysisRequestedAt
        ? `${T.analysisRunningSince}: ${new Date(data.analysisRequestedAt).toLocaleString()} · ${T.analysisRunningHint}`
        : '';
      reportEl.innerHTML = '';
      confirmBtn.classList.add('hidden');
      return false;
    }
    if (data.status === 'failed') {
      statusEl.className = 'msg show err';
      statusEl.textContent = T.analysisStatusFailed;
      detailEl.textContent = data.analysisErrorSummary || T.analysisFailed;
      reportEl.innerHTML = '';
      confirmBtn.classList.add('hidden');
      if (pollTimer) clearInterval(pollTimer);
      return true;
    }
    if (data.status === 'ready' || data.status === 'confirmed') {
      statusEl.className = 'msg show ok';
      statusEl.textContent = data.status === 'confirmed' ? T.analysisStatusConfirmed : T.analysisStatusReady;
      detailEl.textContent = data.analysisEngine === 'openai-fallback' ? T.analysisFallback : '';
      reportEl.innerHTML = '';
      reportEl.append(renderMarkdown(data.markdown));
      if (data.status === 'ready') {
        confirmBtn.classList.remove('hidden');
        confirmBtn.disabled = false;
      } else {
        confirmBtn.classList.add('hidden');
      }
      return true;
    }
    return false;
  }

  confirmBtn.onclick = async () => {
    confirmBtn.disabled = true;
    try {
      await api(`/api/projects/${projectId}/analysis/confirm`, { method: 'POST', body: '{}' });
      statusEl.className = 'msg show ok';
      statusEl.textContent = T.analysisConfirmed;
      confirmBtn.classList.add('hidden');
    } catch (err) {
      statusEl.className = 'msg show err';
      statusEl.textContent = err.message;
      confirmBtn.disabled = false;
    }
  };

  const done = await refresh();
  if (!done) {
    let attempts = 0;
    pollTimer = setInterval(async () => {
      attempts += 1;
      try {
        if (await refresh() || attempts > 90) clearInterval(pollTimer);
      } catch {
        if (attempts > 90) clearInterval(pollTimer);
      }
    }, 4000);
  }
}

async function uploadFiles(files, matList) {
  for (const file of files) {
    const b64 = await fileToBase64(file);
    const type = file.type.startsWith('image/') ? 'image' : 'document';
    await api(`/api/projects/${state.projectId}/materials`, {
      method: 'POST',
      body: JSON.stringify({ type, title: file.name, contentBase64: b64.split(',')[1], mimeType: file.type, filename: file.name, source: 'upload' }),
    });
  }
  await reloadIntake(matList);
}

async function reloadIntake(matList) {
  const data = await api(`/api/projects/${state.projectId}/intake`);
  state.intake = data.intake;
  refreshMaterials(matList);
}

function refreshMaterials(container) {
  container.innerHTML = '';
  const items = state.intake?.materials?.items || [];
  if (!items.length) { container.append(el('p', { className: 'sub' }, [T.noMaterials])); return; }
  for (const m of items) {
    container.append(el('div', { className: 'material-row' }, [
      el('span', {}, [m.title]),
      el('button', { className: 'link', type: 'button', onclick: async () => {
        await api(`/api/projects/${state.projectId}/materials/${m.id}`, { method: 'DELETE' });
        await reloadIntake(container);
      } }, [T.remove]),
    ]));
  }
}

function updateFootMeta() {
  updateWizardFooter();
}

function updateRequiredList(ul = document.getElementById('required-list')) {
  if (!ul || !state.summary) return;
  ul.innerHTML = '';
  for (const f of (state.summary.missingFields || [])) {
    ul.append(el('li', {}, [`○ ${T.missing[f] || f}`]));
  }
  for (const e of (state.summary.validationErrors || [])) {
    if (e.includes('activities')) ul.append(el('li', {}, [`○ ${e}`]));
  }
  if (!state.summary.missingFields?.length && state.summary.readyForAnalysis) {
    ul.append(el('li', { style: 'color:var(--success)' }, [T.allRequired]));
  }
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

(async function boot() {
  if (!token()) { window.location.href = '/auth'; return; }
  const root = document.getElementById('app-root');
  const r = route();
  if (r.view === 'intake') await renderIntake(root, r.projectId);
  else if (r.view === 'analysis') await renderAnalysis(root, r.projectId);
  else await renderProjects(root);
})();
