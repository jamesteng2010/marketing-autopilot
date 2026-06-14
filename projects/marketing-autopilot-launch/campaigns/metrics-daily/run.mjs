#!/usr/bin/env node
/** Collect GitHub stars + local waitlist counter; update progress for user dashboard. */
import {
  readProjectJson, writeProjectJson, writeText, setTaskStatus, logAction, updateProgress, getProjectRoot,
} from '../../../../runtime/campaign-lib/helpers.mjs';

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TASK = 'week1-metrics';

async function fetchGithubStars(repoSlug) {
  const res = await fetch(`https://api.github.com/repos/${repoSlug}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Marketing-Autopilot' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();
  return data.stargazers_count ?? 0;
}

function main() {
  return (async () => {
    setTaskStatus(TASK, 'running', 'Collecting metrics');
    const intake = readProjectJson('intake/active.json');
    const url = intake?.product?.url || 'https://github.com/jamesteng2010/marketing-autopilot';
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    const slug = match ? match[1].replace(/\.git$/, '') : 'jamesteng2010/marketing-autopilot';

    let stars = 0;
    try {
      stars = await fetchGithubStars(slug);
    } catch (e) {
      stars = readProjectJson('ops/state/metrics.json')?.github_stars ?? 0;
    }

    const waitlistFile = join(getProjectRoot(), 'ops/state/waitlist-count.json');
    let waitlist = 0;
    if (existsSync(waitlistFile)) {
      waitlist = JSON.parse(readFileSync(waitlistFile, 'utf8')).count ?? 0;
    }

    const metrics = {
      lastRunAt: new Date().toISOString(),
      github_stars: stars,
      waitlist_count: waitlist,
      repo: slug,
    };
    writeProjectJson('ops/state/metrics.json', metrics);

    const day = new Date().toISOString().slice(0, 10);
    const summary = `# Daily metrics — ${day}

| Metric | Value |
|--------|-------|
| GitHub stars | ${stars} |
| Waitlist | ${waitlist} |

_Automation-generated. User does not edit manually._
`;
    writeText(`ops/daily/${day}-metrics.md`, summary);

    updateProgress((p) => ({ ...p, metrics, currentPhase: p.currentPhase || 'week_1' }));

    logAction({ taskId: TASK, action: 'metrics.collect', status: 'success', summary: `stars=${stars}`, metrics });
    setTaskStatus(TASK, 'done', `stars=${stars} waitlist=${waitlist}`);
    console.log(JSON.stringify({ ok: true, metrics }));
  })();
}

main().catch((e) => {
  setTaskStatus(TASK, 'failed', e.message);
  process.exit(1);
});
