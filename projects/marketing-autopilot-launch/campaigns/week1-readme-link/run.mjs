#!/usr/bin/env node
/** Inject waitlist + OG links into project README (Automation-maintained block). */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getProjectRoot, setTaskStatus, logAction } from '../../../../runtime/campaign-lib/helpers.mjs';

const TASK = 'week1-readme-link';
const START = '<!-- MA_AUTOMATION_LINKS_START -->';
const END = '<!-- MA_AUTOMATION_LINKS_END -->';

function main() {
  setTaskStatus(TASK, 'running', 'Updating README automation block');
  const root = getProjectRoot();
  const readmePath = join(root, 'README.md');
  if (!existsSync(readmePath)) {
    setTaskStatus(TASK, 'skipped', 'No project README.md');
    return;
  }
  let readme = readFileSync(readmePath, 'utf8');
  const block = `${START}
## Automation-generated links (Week 1)

| Asset | Path |
|-------|------|
| Waitlist landing | [campaigns/week1-waitlist/output/index.html](./campaigns/week1-waitlist/output/index.html) |
| OG image | [assets/og.svg](./assets/og.svg) |
| EN thread draft | [campaigns/launch-content-en/output/thread.md](./campaigns/launch-content-en/output/thread.md) |
| CN article draft | [campaigns/launch-content-cn/output/article.md](./campaigns/launch-content-cn/output/article.md) |
| Progress | [ops/progress.json](./ops/progress.json) |

Deploy landing to GitHub Pages or static host — user only provides \`WAITLIST_FORM_URL\` if needed.
${END}`;

  const re = new RegExp(`${START}[\\s\\S]*?${END}`, 'm');
  readme = re.test(readme) ? readme.replace(re, block) : readme.trimEnd() + '\n\n' + block + '\n';
  writeFileSync(readmePath, readme);

  logAction({ taskId: TASK, action: 'content.patch', status: 'success', summary: 'README automation block updated' });
  setTaskStatus(TASK, 'done', 'README links block updated');
  console.log(JSON.stringify({ ok: true }));
}

main();
