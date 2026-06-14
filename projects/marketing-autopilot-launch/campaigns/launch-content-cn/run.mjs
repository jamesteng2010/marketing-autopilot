#!/usr/bin/env node
import { readProjectJson, writeText, setTaskStatus, logAction } from '../../../../runtime/campaign-lib/helpers.mjs';

const TASK = 'week1-content-cn';

function main() {
  setTaskStatus(TASK, 'running', 'Generating CN launch article');
  const intake = readProjectJson('intake/active.json');
  const p = intake?.product || {};

  const article = `# 我用 Marketing Autopilot 给「营销自动化产品」做营销（Project #1）

> 本文由 Automation 自动生成草稿，可发布至掘金 / 知乎。

## 背景

独立开发者会写代码，但很少会按 **国家** 做营销规划。Marketing Autopilot 的定位是：**Automation 当总指挥**——用户只提供信息和看进度，阶段计划、写代码、跑任务由 Automation 完成。

## 我做了什么（Week 1 全自动）

| 任务 | 用户要动手吗？ | Automation 产出 |
|------|----------------|-----------------|
| Waitlist 落地页 | 否（可选提供表单 URL） | \`campaigns/week1-waitlist/output/index.html\` |
| 架构 OG 图 | 否 | \`assets/og.svg\` |
| 英文 Thread 草稿 | 否 | \`campaigns/launch-content-en/output/thread.md\` |
| 中文长文 | 否 | 本文 |
| 每日指标 | 否 | \`ops/state/metrics.json\` |

## 产品闭环

1. UI 填写需求 + 上传资料（PRD、官网、截图…）
2. 分析可行性：中国 vs 美国渠道不同
3. 确认后生成分阶段计划
4. 每阶段 Automation **生成 campaign 脚本并执行**
5. \`ops/progress.json\` 汇报进度；缺凭证时通知用户

## 开源与 waitlist

- 仓库：${p.url || 'https://github.com/jamesteng2010/marketing-autopilot'}
- Waitlist 静态页已由脚本生成，可部署到 GitHub Pages

## 下一步

Week 2 Automation 将调度内容发布与 GitHub star 采集——我仍然只需要看仪表盘。

---

**标签：** Cursor, 营销自动化, 独立开发, AI Agent, build in public
`;

  writeText('campaigns/launch-content-cn/output/article.md', article);
  logAction({ taskId: TASK, action: 'content.generate', status: 'success', summary: 'CN article draft', artifact: 'campaigns/launch-content-cn/output/article.md' });
  setTaskStatus(TASK, 'done', 'CN article at campaigns/launch-content-cn/output/article.md');
  console.log(JSON.stringify({ ok: true }));
}

main();
