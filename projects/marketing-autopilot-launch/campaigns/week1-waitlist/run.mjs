#!/usr/bin/env node
/** Generate static waitlist landing page. No manual Carrd required for v1. */
import {
  getProjectRoot, readProjectJson, writeText, setTaskStatus, logAction, loadUserInputs,
} from '../../../../runtime/campaign-lib/helpers.mjs';

const TASK = 'week1-waitlist';

async function main() {
  setTaskStatus(TASK, 'running', 'Generating waitlist landing page');
  const intake = readProjectJson('intake/active.json');
  const inputs = loadUserInputs();
  const name = intake?.product?.name || 'Marketing Autopilot';
  const oneLiner = intake?.product?.oneLiner || '';
  const repo = intake?.product?.url || 'https://github.com/jamesteng2010/marketing-autopilot';
  const formUrl = inputs.WAITLIST_FORM_URL || '';
  const embedHtml = inputs.WAITLIST_EMBED_HTML || '';

  const formBlock = embedHtml
    ? embedHtml
    : formUrl
      ? `<form action="${formUrl}" method="POST" class="form">
  <input type="email" name="email" placeholder="you@company.com" required />
  <button type="submit">Join waitlist</button>
</form>
<p class="hint">Form posts to your configured WAITLIST_FORM_URL (Tally/GetWaitlist/etc.)</p>`
      : `<div class="form-placeholder">
  <p><strong>Automation note:</strong> Set <code>WAITLIST_FORM_URL</code> or <code>WAITLIST_EMBED_HTML</code> in <code>runtime/user-inputs.json</code> to enable live capture. Page structure is ready.</p>
  <input type="email" placeholder="Preview only — configure form URL" disabled />
</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name} — Waitlist</title>
  <meta property="og:title" content="${name}" />
  <meta property="og:description" content="${oneLiner.replace(/"/g, '&quot;')}" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 520px; margin: 4rem auto; padding: 0 1.5rem; line-height: 1.5; color: #111; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .tag { color: #555; font-size: 1.05rem; margin-bottom: 2rem; }
    .form input[type=email] { width: 100%; padding: 0.75rem; margin-bottom: 0.75rem; border: 1px solid #ccc; border-radius: 8px; }
    .form button { width: 100%; padding: 0.85rem; background: #111; color: #fff; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
    .hint { font-size: 0.85rem; color: #666; margin-top: 1rem; }
    .form-placeholder { background: #f6f6f6; padding: 1rem; border-radius: 8px; }
    a.repo { display: inline-block; margin-top: 2rem; color: #0366d6; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <p class="tag">${oneLiner}</p>
  ${formBlock}
  <a class="repo" href="${repo}">View open-source framework on GitHub →</a>
</body>
</html>`;

  writeText('campaigns/week1-waitlist/output/index.html', html);
  writeText('campaigns/week1-waitlist/output/deploy-notes.md', `# Deploy (Automation generated)

Host \`campaigns/week1-waitlist/output/\` on:
- GitHub Pages (branch gh-pages or /docs)
- Cloudflare Pages / Vercel static
- S3 + CloudFront

Set \`runtime/user-inputs.json\`:
\`\`\`json
{ "WAITLIST_FORM_URL": "https://tally.so/r/xxxxx" }
\`\`\`
Then re-run: \`npm run marketing:phase -- week1-waitlist\`
`);

  logAction({
    taskId: TASK,
    action: 'content.generate',
    status: 'success',
    summary: 'Waitlist landing HTML generated',
    artifact: 'campaigns/week1-waitlist/output/index.html',
  });

  setTaskStatus(TASK, 'done', 'Landing at campaigns/week1-waitlist/output/index.html');
  console.log(JSON.stringify({ ok: true, artifact: 'campaigns/week1-waitlist/output/index.html' }));
}

main().catch((e) => {
  setTaskStatus(TASK, 'failed', e.message);
  console.error(e);
  process.exit(1);
});
